"""Pydantic models for Skim Pintar API."""
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from enum import Enum


class MembershipStatus(str, Enum):
    NOT_REGISTERED = "NOT_REGISTERED"
    PINTAR = "PINTAR"
    PINTAR_PLUS = "PINTAR_PLUS"


# ─────────────────────────────────────────────
# Auth
# ─────────────────────────────────────────────
class DependentRegistrationItem(BaseModel):
    full_name: str
    date_of_birth: str
    relationship: str
    same_address: bool = True
    address: Optional[str] = None
    nric: Optional[str] = None


class RegisterRequest(BaseModel):
    nric: str
    full_name: str
    email: str
    password: str
    phone: str
    address: str
    postal_code: str
    date_of_birth: str
    preferred_language: Optional[str] = "en"
    dependents: list[DependentRegistrationItem] = []

    @field_validator("nric")
    @classmethod
    def nric_format(cls, v: str) -> str:
        v = v.strip().upper()
        if len(v) != 9:
            raise ValueError("NRIC must be 9 characters (e.g. S1234567D)")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: str
    nric: str
    full_name: str
    email: str
    phone: str
    address: str
    postal_code: str
    date_of_birth: str
    membership_status: MembershipStatus
    membership_id: Optional[str]
    email_verified: bool
    created_at: str
    preferred_language: str = "en"


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ─────────────────────────────────────────────
# Dependents
# ─────────────────────────────────────────────
class DependentIn(BaseModel):
    full_name: str
    date_of_birth: str
    relationship: str
    same_address: bool = True
    address: Optional[str] = None
    nric: Optional[str] = None


class DependentOut(BaseModel):
    id: str
    user_id: str
    full_name: str
    date_of_birth: str
    relationship: str
    same_address: bool
    address: str
    nric: str
    created_at: str


# ─────────────────────────────────────────────
# Membership
# ─────────────────────────────────────────────
class SelectTierRequest(BaseModel):
    tier: MembershipStatus


# ─────────────────────────────────────────────
# Payments
# ─────────────────────────────────────────────
class PayNowRequest(BaseModel):
    amount: Optional[float] = None  # If None, use tier default


class PayNowResponse(BaseModel):
    qr_data: str
    reference: str
    amount: float
    payment_id: str
    uen: str


class GiroRequest(BaseModel):
    bank_name: str
    account_number: str
    account_holder_name: str


class GiroResponse(BaseModel):
    payment_id: str
    reference: str
    amount: float
    bank_name: str
    mandate_ref: str
    status: str
    message: str


class PaymentOut(BaseModel):
    id: str
    user_id: str
    amount: float
    payment_type: str
    status: str
    reference: str
    created_at: str


# ─────────────────────────────────────────────
# Generic
# ─────────────────────────────────────────────
class ErrorResponse(BaseModel):
    code: str
    message: str
