"""
Skim Pintar – Masjid Ar-Raudhah
FastAPI Backend
-----------------
Handles: authentication, user management, dependent management,
membership tiers, PayNow QR generation, and GIRO setup.

Data is persisted to a JSON file so it survives server restarts (e.g. uvicorn --reload).
In production, replace with Convex or another database.
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import bcrypt
import uuid
import json
import os
from pathlib import Path
from datetime import datetime, timedelta, timezone
from typing import Optional
from enum import Enum

from models import (
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    UserOut,
    DependentIn,
    DependentOut,
    SelectTierRequest,
    PayNowRequest,
    PayNowResponse,
    GiroRequest,
    GiroResponse,
    PaymentOut,
    MembershipStatus,
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
# Persistent store (JSON file; survives restarts)
# ─────────────────────────────────────────────
_DATA_DIR = Path(__file__).resolve().parent / "data"
_DATA_FILE = _DATA_DIR / "store.json"

_users: dict[str, dict] = {}          # user_id -> user_doc
_users_by_nric: dict[str, str] = {}   # nric -> user_id
_users_by_email: dict[str, str] = {}  # email -> user_id
_dependents: dict[str, dict] = {}     # dep_id -> dep_doc
_payments: dict[str, dict] = {}       # payment_id -> payment_doc


def _serialize_user(u: dict) -> dict:
    """Copy user dict with enum converted to string for JSON."""
    out = dict(u)
    if "membership_status" in out and isinstance(out["membership_status"], Enum):
        out["membership_status"] = out["membership_status"].value
    return out


def _load_data() -> None:
    """Load users, dependents, payments from disk. Rebuild index dicts."""
    if not _DATA_FILE.exists():
        return
    try:
        with open(_DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError):
        return
    users_raw = data.get("users") or {}
    for uid, u in users_raw.items():
        if isinstance(u.get("membership_status"), str) and u["membership_status"] in [e.value for e in MembershipStatus]:
            u["membership_status"] = MembershipStatus(u["membership_status"])
        _users[uid] = u
    for uid, u in _users.items():
        nric = u.get("nric")
        email = u.get("email")
        if nric:
            _users_by_nric[nric] = uid
        if email:
            _users_by_email[email.lower()] = uid
    _dependents.clear()
    for did, d in (data.get("dependents") or {}).items():
        _dependents[did] = d
    _payments.clear()
    for pid, p in (data.get("payments") or {}).items():
        _payments[pid] = p


def _save_data() -> None:
    """Persist users, dependents, payments to disk."""
    _DATA_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "users": {k: _serialize_user(v) for k, v in _users.items()},
        "dependents": _dependents,
        "payments": _payments,
    }
    with open(_DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)


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
# Membership ID generator
# ─────────────────────────────────────────────
def generate_membership_id() -> str:
    suffix = str(uuid.uuid4().int)[:4].upper()
    return f"SPTAR-{suffix}"

# ─────────────────────────────────────────────
# PayNow reference generator
# ─────────────────────────────────────────────
def generate_paynow_qr_data(membership_id: str, amount: float) -> str:
    """
    Returns a PayNow QR payload string.
    In production, use the PayNow QR spec or a certified payment provider SDK.
    This mock returns a human-readable string that QR libraries can encode.
    """
    return (
        f"PayNow|UEN:{MOSQUE_PAYNOW_UEN}|"
        f"Amount:{amount:.2f}|"
        f"Ref:{membership_id}|"
        f"Merchant:Masjid Ar-Raudhah Skim Pintar"
    )

# ─────────────────────────────────────────────
# App setup
# ─────────────────────────────────────────────
app = FastAPI(
    title="Skim Pintar API",
    description="Backend for Masjid Ar-Raudhah Skim Pintar onboarding",
    version="1.0.0",
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
    # Check NRIC uniqueness (duplicate detection)
    if body.nric.upper() in _users_by_nric:
        existing_user_id = _users_by_nric[body.nric.upper()]
        existing = _users[existing_user_id]
        # Check if they're a dependent
        for dep in _get_user_dependents(existing_user_id):
            if dep["full_name"].lower() == body.full_name.lower():
                raise HTTPException(
                    status_code=409,
                    detail={
                        "code": "NRIC_IS_DEPENDENT",
                        "message": "This NRIC is already registered as a dependent under another account.",
                        "primary_email": existing.get("email", ""),
                    },
                )
        raise HTTPException(
            status_code=409,
            detail={"code": "NRIC_EXISTS", "message": "An account with this NRIC already exists."},
        )

    if body.email.lower() in _users_by_email:
        raise HTTPException(
            status_code=409,
            detail={"code": "EMAIL_EXISTS", "message": "An account with this email already exists."},
        )

    user_id = str(uuid.uuid4())
    membership_id = generate_membership_id()
    now = datetime.now(timezone.utc).isoformat()

    user_doc = {
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
    }
    _users[user_id] = user_doc
    _users_by_nric[body.nric.upper()] = user_id
    _users_by_email[body.email.lower()] = user_id

    # Save dependents
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
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=_user_to_out(user_doc),
    )


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
    # Check if NRIC conflicts with existing user
    if body.nric and body.nric.upper() in _users_by_nric:
        raise HTTPException(
            status_code=409,
            detail={"code": "NRIC_IS_PRIMARY", "message": "This NRIC already has a primary account."},
        )
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
    return None

# ─────────────────────────────────────────────
# Membership
# ─────────────────────────────────────────────
TIER_AMOUNTS = {MembershipStatus.PINTAR: 5.0, MembershipStatus.PINTAR_PLUS: 20.0}

@app.post("/api/membership/select-tier")
async def select_tier(body: SelectTierRequest, user: dict = Depends(get_current_user)):
    if body.tier not in (MembershipStatus.PINTAR, MembershipStatus.PINTAR_PLUS):
        raise HTTPException(status_code=400, detail="Invalid tier. Choose 'PINTAR' or 'PINTAR_PLUS'")
    _users[user["id"]]["membership_status"] = body.tier
    _users[user["id"]]["updated_at"] = datetime.now(timezone.utc).isoformat()
    _save_data()
    return {
        "ok": True,
        "tier": body.tier,
        "amount": TIER_AMOUNTS[body.tier],
        "membership_id": user["membership_id"],
    }

# ─────────────────────────────────────────────
# Payments
# ─────────────────────────────────────────────
def _user_has_paid_for_period(user_id: str, period_month: int, period_year: int) -> bool:
    """True if user has a COMPLETED payment for this month/year."""
    for p in _payments.values():
        if p["user_id"] != user_id or p.get("status") != "COMPLETED":
            continue
        if p.get("period_month") == period_month and p.get("period_year") == period_year:
            return True
    return False


@app.post("/api/payments/paynow", response_model=PayNowResponse)
async def generate_paynow(body: PayNowRequest, user: dict = Depends(get_current_user)):
    tier = user["membership_status"]
    if tier == MembershipStatus.NOT_REGISTERED:
        raise HTTPException(status_code=400, detail="Please select a membership tier first.")
    period_month = body.period_month
    period_year = body.period_year
    if not (1 <= period_month <= 12):
        raise HTTPException(status_code=400, detail="Invalid month.")
    if period_year < 2020 or period_year > 2100:
        raise HTTPException(status_code=400, detail="Invalid year.")
    if _user_has_paid_for_period(user["id"], period_month, period_year):
        raise HTTPException(
            status_code=400,
            detail={"code": "ALREADY_PAID", "message": "You have already paid for this month. Please select another period."},
        )
    amount = body.amount or TIER_AMOUNTS.get(tier, 5.0)
    membership_id = user["membership_id"]
    qr_data = generate_paynow_qr_data(membership_id, amount)
    payment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    _payments[payment_id] = {
        "id": payment_id,
        "user_id": user["id"],
        "amount": amount,
        "payment_type": "PAYNOW",
        "status": "PENDING",
        "reference": membership_id,
        "qr_data": qr_data,
        "created_at": now,
        "period_month": period_month,
        "period_year": period_year,
    }
    _save_data()
    return PayNowResponse(
        qr_data=qr_data,
        reference=membership_id,
        amount=amount,
        payment_id=payment_id,
        uen=MOSQUE_PAYNOW_UEN,
    )


@app.post("/api/payments/giro", response_model=GiroResponse)
async def setup_giro(body: GiroRequest, user: dict = Depends(get_current_user)):
    tier = user["membership_status"]
    if tier == MembershipStatus.NOT_REGISTERED:
        raise HTTPException(status_code=400, detail="Please select a membership tier first.")
    amount = TIER_AMOUNTS.get(tier, 5.0)
    membership_id = user["membership_id"]
    payment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    _payments[payment_id] = {
        "id": payment_id,
        "user_id": user["id"],
        "amount": amount,
        "payment_type": "GIRO",
        "status": "PENDING",
        "reference": membership_id,
        "bank_name": body.bank_name,
        "account_last4": body.account_number[-4:] if body.account_number else "****",
        "created_at": now,
    }
    _save_data()
    return GiroResponse(
        payment_id=payment_id,
        reference=membership_id,
        amount=amount,
        bank_name=body.bank_name,
        mandate_ref=f"GIRO-{membership_id}",
        status="PENDING_MANDATE",
        message=(
            f"Your GIRO e-Mandate (Ref: GIRO-{membership_id}) has been submitted. "
            "You will receive a confirmation from your bank within 3–5 working days. "
            "Monthly deductions of $" + f"{amount:.2f}" + " will begin on the 1st of next month."
        ),
    )


@app.post("/api/payments/{payment_id}/confirm")
async def confirm_payment(payment_id: str, user: dict = Depends(get_current_user)):
    """Simulate payment confirmation (webhook / manual confirm for demo)."""
    if payment_id not in _payments:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment = _payments[payment_id]
    if payment["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your payment")
    _payments[payment_id]["status"] = "COMPLETED"
    # Activate membership
    tier = _users[user["id"]]["membership_status"]
    if tier in (MembershipStatus.PINTAR, MembershipStatus.PINTAR_PLUS):
        _users[user["id"]]["membership_active"] = True
    _save_data()
    return {"ok": True, "status": "COMPLETED"}


@app.get("/api/payments", response_model=list[PaymentOut])
async def list_payments(user: dict = Depends(get_current_user)):
    return [_payment_to_out(p) for p in _get_user_payments(user["id"])]

# ─────────────────────────────────────────────
# Serializers
# ─────────────────────────────────────────────
def _user_to_out(u: dict) -> "UserOut":
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
    )

def _dep_to_out(d: dict) -> "DependentOut":
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

def _payment_to_out(p: dict) -> "PaymentOut":
    return PaymentOut(
        id=p["id"],
        user_id=p["user_id"],
        amount=p["amount"],
        payment_type=p["payment_type"],
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
    return {"status": "ok", "service": "skim-pintar-api"}
