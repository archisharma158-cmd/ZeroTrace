"""Pydantic schemas for Contact / Start a Conversation."""

from pydantic import BaseModel, Field, field_validator
from app.services.security import is_valid_email


class ContactRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Visitor full name")
    email: str = Field(..., min_length=3, max_length=255, description="Visitor contact email")
    subject: str = Field(..., min_length=1, max_length=200, description="Inquiry subject")
    message: str = Field(..., min_length=10, max_length=5000, description="Inquiry message content")

    @field_validator("name", "subject", "message", mode="before")
    @classmethod
    def strip_text(cls, v: str) -> str:
        if isinstance(v, str):
            val = v.strip()
            if not val:
                raise ValueError("Field cannot be blank or whitespace-only.")
            return val
        return v

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        cleaned = v.strip()
        if not is_valid_email(cleaned):
            raise ValueError("Enter a valid email address.")
        return cleaned


class ContactResponse(BaseModel):
    success: bool
    message: str
