"""
Skim Pintar – Masjid Ar-Raudhah  •  FastAPI Backend  v2
-------------------------------------------------------
Payment logic:
  • Subscribers pay via PayNow anytime within the month (subscription fee).
  • If PayNow not completed by month-end AND GIRO is active:
      - GIRO tries to deduct on the 15th of following month.
      - If that fails, retries on the 30th.
  • If payment fails for 3 consecutive months → subscription deactivated.
  • Additional donations are always allowed (separate payment_category).

Data is persisted to a JSON file so it survives server restarts.
In production, replace with Convex or another database.
"""

from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import bcrypt
import uuid
import json
import os
import calendar
from pathlib import Path
from datetime import datetime, timedelta, timezone, date
from typing import Optional
from enum import Enum

from models import (
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    UserOut,
    GiroInfo,
    DependentIn,
    DependentOut,
    SelectTierRequest,
    PayNowRequest,
    PayNowResponse,
    GiroRegisterRequest,
    GiroRegisterResponse,
    GiroRequest,
    GiroResponse,
    DonationRequest,
    PaymentOut,
    MembershipStatus,
    PaymentCategory,
    MonthlyStatusResponse,
    ErrorResponse,
)

# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
MOSQUE_PAYNOW_UEN = os.getenv("MOSQUE_PAYNOW_UEN", "T08CC4132K")

# ─────────────────────────────────────────────
# Persistent store (JSON file)
# ─────────────────────────────────────────────
_DATA_DIR = Path(__file__).resolve().parent / "data"
_DATA_FILE = _DATA_DIR / "store.json"

_users: dict[str, dict] = {}
_users_by_nric: dict[str, str] = {}
_users_by_email: dict[str, str] = {}
_dependents: dict[str, dict] = {}
_payments: dict[str, dict] = {}


def _serialize_user(u: dict) -> dict:
    out = dict(u)
    if "membership_status" in out and isinstance(out["membership_status"], Enum):
        out["membership_status"] = out["membership_status"].value
    return out


def _load_data() -> None:
    if not _DATA_FILE.exists():
        return
    try:
        with open(_DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError):
        return
    for uid, u in (data.get("users") or {}).items():
        if isinstance(u.get("membership_status"), str):
            try:
                u["membership_status"] = MembershipStatus(u["membership_status"])
            except ValueError:
                u["membership_status"] = MembershipStatus.NOT_REGISTERED
        _users[uid] = u
    for uid, u in _users.items():
        if nric := u.get("nric"):
            _users_by_nric[nric] = uid
        if email := u.get("email"):
            _users_by_email[email.lower()] = uid
    _dependents.update(data.get("dependents") or {})
    _payments.update(data.get("payments") or {})


def _save_data() -> None:
    _DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(_DATA_FILE, "w", encoding="utf-8") as f:
        json.dump({
            "users": {k: _serialize_user(v) for k, v in _users.items()},
            "dependents": _dependents,
            "payments": _payments,
        }, f, indent=2, ensure_ascii=False)


_load_data()


def _get_user_dependents(user_id: str) -> list[dict]:
    return [d for d in _dependents.values() if d["user_id"] == user_id]


def _get_user_payments(user_id: str) -> list[dict]:
    return sorted(
        [p for p in _payments.values() if p["user_id"] == user_id],
        key=lambda x: x["created_at"],
        reverse=True,
    )

# ─────────────────────────────────────────────
# JWT helpers
# ─────────────────────────────────────────────
def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except jwt.PyJWTError:
        return None


bearer_scheme = HTTPBearer()


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    user_id = decode_token(credentials.credentials)
    if not user_id or user_id not in _users:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return user_id


def get_current_user(user_id: str = Depends(get_current_user_id)) -> dict:
    return _users[user_id]

# ─────────────────────────────────────────────
# Password helpers
# ─────────────────────────────────────────────
def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

# ─────────────────────────────────────────────
# Generators
# ─────────────────────────────────────────────
def generate_membership_id() -> str:
    suffix = str(uuid.uuid4().int)[:4].upper()
    return f"SPTAR-{suffix}"


def generate_paynow_qr_data(membership_id: str, amount: float) -> str:
    return (
        f"PayNow|UEN:{MOSQUE_PAYNOW_UEN}|"
        f"Amount:{amount:.2f}|"
        f"Ref:{membership_id}|"
        f"Merchant:Masjid Ar-Raudhah Skim Pintar"
    )

# ─────────────────────────────────────────────
# Payment helpers
# ─────────────────────────────────────────────
TIER_AMOUNTS = {MembershipStatus.PINTAR: 5.0, MembershipStatus.PINTAR_PLUS: 20.0}


def _user_has_paid_subscription_for_period(user_id: str, month: int, year: int) -> bool:
    """True if user has a COMPLETED SUBSCRIPTION payment for this month/year."""
    for p in _payments.values():
        if p["user_id"] != user_id:
            continue
        if p.get("status") != "COMPLETED":
            continue
        if p.get("payment_category", "SUBSCRIPTION") != PaymentCategory.SUBSCRIPTION.value:
            continue
        if p.get("period_month") == month and p.get("period_year") == year:
            return True
    return False


def _days_until_end_of_month(month: int, year: int) -> int:
    today = date.today()
    last_day = calendar.monthrange(year, month)[1]
    end = date(year, month, last_day)
    delta = (end - today).days
    return max(0, delta)


def _get_giro_info(user: dict) -> Optional[dict]:
    return user.get("giro")


def _giro_is_active(user: dict) -> bool:
    giro = _get_giro_info(user)
    return bool(giro and giro.get("status") == "ACTIVE")


def _attempt_giro_deduction(user_id: str, month: int, year: int, attempt: int) -> bool:
    """
    Simulate a GIRO deduction attempt.
    attempt=1 → 15th, attempt=2 → 30th.
    Returns True if succeeded (mock: always succeeds unless explicitly failed).
    In production, call your bank's GIRO API here.
    """
    user = _users.get(user_id)
    if not user or not _giro_is_active(user):
        return False
    tier = user.get("membership_status", MembershipStatus.NOT_REGISTERED)
    if tier == MembershipStatus.NOT_REGISTERED:
        return False
    amount = TIER_AMOUNTS.get(tier, 5.0)
    membership_id = user.get("membership_id", "")
    payment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    # Mock: succeed
    _payments[payment_id] = {
        "id": payment_id,
        "user_id": user_id,
        "amount": amount,
        "payment_type": "GIRO",
        "payment_category": PaymentCategory.SUBSCRIPTION.value,
        "status": "COMPLETED",
        "reference": membership_id,
        "created_at": now,
        "period_month": month,
        "period_year": year,
        "giro_attempt": attempt,
    }
    # Reset failure counter on success
    _users[user_id]["consecutive_failed_months"] = 0
    _users[user_id]["is_deactivated"] = False
    _save_data()
    return True


def _record_giro_failure(user_id: str, month: int, year: int) -> None:
    """
    Called when both GIRO attempts (15th + 30th) have failed for a month.
    Increments consecutive_failed_months. Deactivates if >= 3.
    """
    user = _users.get(user_id)
    if not user:
        return
    count = user.get("consecutive_failed_months", 0) + 1
    _users[user_id]["consecutive_failed_months"] = count
    if count >= 3:
        _users[user_id]["is_deactivated"] = True
        _users[user_id]["membership_status"] = MembershipStatus.NOT_REGISTERED
    _save_data()

# ─────────────────────────────────────────────
# App setup
# ─────────────────────────────────────────────
app = FastAPI(
    title="Skim Pintar API",
    description="Backend for Masjid Ar-Raudhah Skim Pintar onboarding",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Auth routes
# ─────────────────────────────────────────────
@app.post("/api/auth/register", response_model=LoginResponse, status_code=201)
async def register(body: RegisterRequest):
    if body.nric.upper() in _users_by_nric:
        existing_user_id = _users_by_nric[body.nric.upper()]
        existing = _users[existing_user_id]
        for dep in _get_user_dependents(existing_user_id):
            if dep["full_name"].lower() == body.full_name.lower():
                raise HTTPException(status_code=409, detail={
                    "code": "NRIC_IS_DEPENDENT",
                    "message": "This NRIC is already registered as a dependent under another account.",
                    "primary_email": existing.get("email", ""),
                })
        raise HTTPException(status_code=409, detail={"code": "NRIC_EXISTS", "message": "An account with this NRIC already exists."})

    if body.email.lower() in _users_by_email:
        raise HTTPException(status_code=409, detail={"code": "EMAIL_EXISTS", "message": "An account with this email already exists."})

    user_id = str(uuid.uuid4())
    membership_id = generate_membership_id()
    now = datetime.now(timezone.utc).isoformat()

    user_doc: dict = {
        "id": user_id,
        "nric": body.nric.upper(),
        "full_name": body.full_name,
        "email": body.email.lower(),
        "password_hash": hash_password(body.password),
        "phone": body.phone,
        "address": body.address,
        "postal_code": body.postal_code,
        "date_of_birth": body.date_of_birth,
        "membership_status": MembershipStatus.NOT_REGISTERED,
        "membership_id": membership_id,
        "email_verified": False,
        "created_at": now,
        "updated_at": now,
        "preferred_language": body.preferred_language or "en",
        "giro": None,
        "consecutive_failed_months": 0,
        "is_deactivated": False,
    }
    _users[user_id] = user_doc
    _users_by_nric[body.nric.upper()] = user_id
    _users_by_email[body.email.lower()] = user_id

    for dep in body.dependents:
        dep_id = str(uuid.uuid4())
        _dependents[dep_id] = {
            "id": dep_id,
            "user_id": user_id,
            "full_name": dep.full_name,
            "date_of_birth": dep.date_of_birth,
            "relationship": dep.relationship,
            "same_address": dep.same_address,
            "address": dep.address if not dep.same_address else user_doc["address"],
            "nric": dep.nric or "",
            "created_at": now,
        }

    _save_data()
    token = create_access_token(user_id)
    return LoginResponse(access_token=token, token_type="bearer", user=_user_to_out(user_doc))


@app.post("/api/auth/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    email = body.email.lower()
    if email not in _users_by_email:
        raise HTTPException(status_code=401, detail={"code": "NO_ACCOUNT", "message": "No account found with this email."})
    user = _users[_users_by_email[email]]
    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail={"code": "WRONG_PASSWORD", "message": "Incorrect password."})
    token = create_access_token(user["id"])
    return LoginResponse(access_token=token, token_type="bearer", user=_user_to_out(user))


@app.get("/api/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return _user_to_out(user)

# ─────────────────────────────────────────────
# User profile
# ─────────────────────────────────────────────
@app.put("/api/users/language")
async def update_language(body: dict, user: dict = Depends(get_current_user)):
    lang = body.get("language", "en")
    if lang not in ("en", "ms"):
        raise HTTPException(status_code=400, detail="Language must be 'en' or 'ms'")
    _users[user["id"]]["preferred_language"] = lang
    _save_data()
    return {"ok": True}

# ─────────────────────────────────────────────
# Dependents
# ─────────────────────────────────────────────
@app.get("/api/dependents", response_model=list[DependentOut])
async def list_dependents(user: dict = Depends(get_current_user)):
    return [_dep_to_out(d) for d in _get_user_dependents(user["id"])]


@app.post("/api/dependents", response_model=DependentOut, status_code=201)
async def add_dependent(body: DependentIn, user: dict = Depends(get_current_user)):
    if body.nric and body.nric.upper() in _users_by_nric:
        raise HTTPException(status_code=409, detail={"code": "NRIC_IS_PRIMARY", "message": "This NRIC already has a primary account."})
    dep_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    dep_doc = {
        "id": dep_id,
        "user_id": user["id"],
        "full_name": body.full_name,
        "date_of_birth": body.date_of_birth,
        "relationship": body.relationship,
        "same_address": body.same_address,
        "address": body.address if not body.same_address else user["address"],
        "nric": body.nric or "",
        "created_at": now,
    }
    _dependents[dep_id] = dep_doc
    _save_data()
    return _dep_to_out(dep_doc)


@app.put("/api/dependents/{dep_id}", response_model=DependentOut)
async def update_dependent(dep_id: str, body: DependentIn, user: dict = Depends(get_current_user)):
    if dep_id not in _dependents:
        raise HTTPException(status_code=404, detail="Dependent not found")
    dep = _dependents[dep_id]
    if dep["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your dependent")
    dep.update({
        "full_name": body.full_name,
        "date_of_birth": body.date_of_birth,
        "relationship": body.relationship,
        "same_address": body.same_address,
        "address": body.address if not body.same_address else user["address"],
        "nric": body.nric or dep.get("nric", ""),
    })
    _save_data()
    return _dep_to_out(dep)


@app.delete("/api/dependents/{dep_id}", status_code=204)
async def remove_dependent(dep_id: str, user: dict = Depends(get_current_user)):
    if dep_id not in _dependents:
        raise HTTPException(status_code=404, detail="Dependent not found")
    if _dependents[dep_id]["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your dependent")
    del _dependents[dep_id]
    _save_data()

# ─────────────────────────────────────────────
# Membership
# ─────────────────────────────────────────────
@app.post("/api/membership/select-tier")
async def select_tier(body: SelectTierRequest, user: dict = Depends(get_current_user)):
    if body.tier not in (MembershipStatus.PINTAR, MembershipStatus.PINTAR_PLUS):
        raise HTTPException(status_code=400, detail="Invalid tier. Choose 'PINTAR' or 'PINTAR_PLUS'")
    _users[user["id"]]["membership_status"] = body.tier
    _users[user["id"]]["is_deactivated"] = False
    _users[user["id"]]["consecutive_failed_months"] = 0
    _users[user["id"]]["updated_at"] = datetime.now(timezone.utc).isoformat()
    _save_data()
    return {
        "ok": True,
        "tier": body.tier,
        "amount": TIER_AMOUNTS[body.tier],
        "membership_id": user["membership_id"],
    }

# ─────────────────────────────────────────────
# GIRO profile registration
# ─────────────────────────────────────────────
@app.post("/api/giro/register", response_model=GiroRegisterResponse)
async def register_giro(body: GiroRegisterRequest, user: dict = Depends(get_current_user)):
    """
    Register or update a GIRO mandate on the user's profile.
    This is separate from the payment setup flow — users can do this from the Profile tab.
    """
    tier = user.get("membership_status", MembershipStatus.NOT_REGISTERED)
    if tier == MembershipStatus.NOT_REGISTERED:
        raise HTTPException(status_code=400, detail={"code": "NO_TIER", "message": "Please select a membership tier before setting up GIRO."})
    membership_id = user.get("membership_id", "")
    mandate_ref = f"GIRO-{membership_id}"
    last4 = body.account_number[-4:] if len(body.account_number) >= 4 else "****"
    masked = f"****-****-****-{last4}"
    now = datetime.now(timezone.utc).isoformat()
    giro_info = {
        "bank_name": body.bank_name,
        "account_number_masked": masked,
        "account_holder_name": body.account_holder_name,
        "mandate_ref": mandate_ref,
        "status": "ACTIVE",      # In production: "PENDING_MANDATE" until bank confirms
        "registered_at": now,
    }
    _users[user["id"]]["giro"] = giro_info
    _save_data()
    return GiroRegisterResponse(
        mandate_ref=mandate_ref,
        bank_name=body.bank_name,
        account_number_masked=masked,
        status="ACTIVE",
        message=(
            f"GIRO mandate (Ref: {mandate_ref}) registered with {body.bank_name}. "
            "Monthly deductions will be attempted on the 15th of each month, "
            "with a retry on the 30th if the first attempt fails."
        ),
    )


@app.delete("/api/giro/cancel")
async def cancel_giro(user: dict = Depends(get_current_user)):
    """Cancel the user's GIRO mandate."""
    if not user.get("giro"):
        raise HTTPException(status_code=404, detail="No GIRO mandate found.")
    _users[user["id"]]["giro"]["status"] = "CANCELLED"
    _save_data()
    return {"ok": True, "message": "GIRO mandate cancelled."}

# ─────────────────────────────────────────────
# Monthly payment status
# ─────────────────────────────────────────────
@app.get("/api/payments/monthly-status", response_model=MonthlyStatusResponse)
async def monthly_payment_status(user: dict = Depends(get_current_user)):
    """
    Returns whether the current month's subscription has been paid,
    days remaining in the month, and GIRO status.
    """
    today = date.today()
    month = today.month
    year = today.year
    paid = _user_has_paid_subscription_for_period(user["id"], month, year)
    days_left = _days_until_end_of_month(month, year)
    return MonthlyStatusResponse(
        paid=paid,
        month=month,
        year=year,
        days_until_end_of_month=days_left,
        giro_active=_giro_is_active(user),
        consecutive_failed_months=user.get("consecutive_failed_months", 0),
        is_deactivated=user.get("is_deactivated", False),
    )

# ─────────────────────────────────────────────
# Payments
# ─────────────────────────────────────────────
@app.post("/api/payments/paynow", response_model=PayNowResponse)
async def generate_paynow(body: PayNowRequest, user: dict = Depends(get_current_user)):
    tier = user.get("membership_status", MembershipStatus.NOT_REGISTERED)
    if tier == MembershipStatus.NOT_REGISTERED:
        raise HTTPException(status_code=400, detail="Please select a membership tier first.")

    # For SUBSCRIPTION payments, enforce one-per-month rule
    if body.category == PaymentCategory.SUBSCRIPTION:
        if not (1 <= body.period_month <= 12):
            raise HTTPException(status_code=400, detail="Invalid month.")
        if body.period_year < 2020 or body.period_year > 2100:
            raise HTTPException(status_code=400, detail="Invalid year.")
        if _user_has_paid_subscription_for_period(user["id"], body.period_month, body.period_year):
            raise HTTPException(status_code=400, detail={
                "code": "ALREADY_PAID",
                "message": "You have already paid your subscription for this month. You can make an additional donation instead.",
            })
        amount = TIER_AMOUNTS.get(tier, 5.0)
    else:
        # DONATION — amount is user-specified
        if not body.amount or body.amount <= 0:
            raise HTTPException(status_code=400, detail="Please specify a donation amount greater than $0.")
        amount = body.amount

    membership_id = user.get("membership_id", "")
    qr_data = generate_paynow_qr_data(membership_id, amount)
    payment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    _payments[payment_id] = {
        "id": payment_id,
        "user_id": user["id"],
        "amount": amount,
        "payment_type": "PAYNOW",
        "payment_category": body.category.value,
        "status": "PENDING",
        "reference": membership_id,
        "qr_data": qr_data,
        "created_at": now,
        "period_month": body.period_month if body.category == PaymentCategory.SUBSCRIPTION else None,
        "period_year": body.period_year if body.category == PaymentCategory.SUBSCRIPTION else None,
    }
    _save_data()
    return PayNowResponse(qr_data=qr_data, reference=membership_id, amount=amount, payment_id=payment_id, uen=MOSQUE_PAYNOW_UEN)


@app.post("/api/payments/{payment_id}/confirm")
async def confirm_payment(payment_id: str, user: dict = Depends(get_current_user)):
    """Confirm a PayNow payment (manual/demo; production uses webhook)."""
    if payment_id not in _payments:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment = _payments[payment_id]
    if payment["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your payment")
    _payments[payment_id]["status"] = "COMPLETED"
    # On successful subscription, reset failure counter
    if payment.get("payment_category", "SUBSCRIPTION") == PaymentCategory.SUBSCRIPTION.value:
        _users[user["id"]]["consecutive_failed_months"] = 0
        _users[user["id"]]["is_deactivated"] = False
    _save_data()
    return {"ok": True, "status": "COMPLETED"}


@app.post("/api/payments/giro/simulate-cycle")
async def simulate_giro_cycle(
    month: int,
    year: int,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
):
    """
    DEV/DEMO endpoint: simulate a GIRO monthly cycle for a specific month/year.
    In production this would be triggered by a cron job on the 15th/30th.

    Logic:
      1. If user already paid via PayNow for this month → skip (no double charge).
      2. Try GIRO deduction (attempt 1 = 15th).
      3. If attempt 1 fails → try again (attempt 2 = 30th).
      4. If both fail → record_giro_failure().
    """
    if not _giro_is_active(user):
        raise HTTPException(status_code=400, detail="No active GIRO mandate.")
    if _user_has_paid_subscription_for_period(user["id"], month, year):
        return {"status": "SKIPPED", "reason": "Already paid via PayNow for this period."}

    success1 = _attempt_giro_deduction(user["id"], month, year, attempt=1)
    if success1:
        return {"status": "SUCCESS", "attempt": 1, "message": f"GIRO deducted on 15th for {month}/{year}."}

    success2 = _attempt_giro_deduction(user["id"], month, year, attempt=2)
    if success2:
        return {"status": "SUCCESS", "attempt": 2, "message": f"GIRO deducted on 30th (retry) for {month}/{year}."}

    _record_giro_failure(user["id"], month, year)
    updated_user = _users[user["id"]]
    count = updated_user.get("consecutive_failed_months", 0)
    deactivated = updated_user.get("is_deactivated", False)
    return {
        "status": "FAILED",
        "consecutive_failed_months": count,
        "deactivated": deactivated,
        "message": (
            f"Both GIRO attempts failed for {month}/{year}. "
            f"Consecutive failed months: {count}/3."
            + (" Subscription has been deactivated." if deactivated else "")
        ),
    }


@app.get("/api/payments", response_model=list[PaymentOut])
async def list_payments(user: dict = Depends(get_current_user)):
    return [_payment_to_out(p) for p in _get_user_payments(user["id"])]

# ─────────────────────────────────────────────
# Serializers
# ─────────────────────────────────────────────
def _user_to_out(u: dict) -> UserOut:
    giro_raw = u.get("giro")
    giro_out = GiroInfo(**giro_raw) if giro_raw else None
    return UserOut(
        id=u["id"],
        nric=u["nric"],
        full_name=u["full_name"],
        email=u["email"],
        phone=u.get("phone", ""),
        address=u.get("address", ""),
        postal_code=u.get("postal_code", ""),
        date_of_birth=u.get("date_of_birth", ""),
        membership_status=u.get("membership_status", MembershipStatus.NOT_REGISTERED),
        membership_id=u.get("membership_id"),
        email_verified=u.get("email_verified", False),
        created_at=u.get("created_at", ""),
        preferred_language=u.get("preferred_language", "en"),
        giro=giro_out,
        consecutive_failed_months=u.get("consecutive_failed_months", 0),
        is_deactivated=u.get("is_deactivated", False),
    )


def _dep_to_out(d: dict) -> DependentOut:
    return DependentOut(
        id=d["id"],
        user_id=d["user_id"],
        full_name=d["full_name"],
        date_of_birth=d["date_of_birth"],
        relationship=d["relationship"],
        same_address=d.get("same_address", True),
        address=d.get("address", ""),
        nric=d.get("nric", ""),
        created_at=d.get("created_at", ""),
    )


def _payment_to_out(p: dict) -> PaymentOut:
    return PaymentOut(
        id=p["id"],
        user_id=p["user_id"],
        amount=p["amount"],
        payment_type=p["payment_type"],
        payment_category=p.get("payment_category", PaymentCategory.SUBSCRIPTION.value),
        status=p["status"],
        reference=p["reference"],
        created_at=p["created_at"],
        period_month=p.get("period_month"),
        period_year=p.get("period_year"),
    )

# ─────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "skim-pintar-api", "version": "2.0.0"}
