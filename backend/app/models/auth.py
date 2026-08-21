"""Pydantic schemas for OTP Authentication."""

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field, field_validator
from app.services.security import is_valid_email


class OTPRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255, description="User email address")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        cleaned = v.strip()
        if not is_valid_email(cleaned):
            raise ValueError("Enter a valid email address.")
        return cleaned.lower()


class OTPVerifyRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255, description="User email address")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit verification code")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        cleaned = v.strip()
        if not is_valid_email(cleaned):
            raise ValueError("Enter a valid email address.")
        return cleaned.lower()

    @field_validator("otp")
    @classmethod
    def validate_otp_format(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned.isdigit() or len(cleaned) != 6:
            raise ValueError("Verification code must be exactly 6 digits.")
        return cleaned


class AuthUser(BaseModel):
    authenticated: bool = True
    method: str = "email"
    identifier: str
    loginAt: str


class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[Dict[str, Any]] = None
