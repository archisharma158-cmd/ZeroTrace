"""Authentication routes — handle OTP request, delivery, and verification."""

import logging
import time
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request, status

from app.config import (
    OTP_EXPIRE_MINUTES,
    OTP_MAX_ATTEMPTS,
    OTP_RESEND_COOLDOWN_SECONDS,
)
from app.database import otps_collection
from app.models.auth import AuthResponse, OTPRequest, OTPVerifyRequest
from app.services.email_service import send_otp_verification_email
from app.services.security import (
    check_rate_limit,
    generate_otp,
    hash_otp,
    mask_email,
    normalize_email,
    verify_otp_hash,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/request-otp", status_code=status.HTTP_200_OK)
async def request_otp(
    payload: OTPRequest,
    request: Request,
):
    """
    Request a 6-digit verification code:
    1. Check rate limits & resend cooldown.
    2. Invalidate older OTPs for this email.
    3. Generate cryptographically secure 6-digit OTP & HMAC-SHA256 hash.
    4. Persist hashed OTP record immediately.
    5. Deliver OTP email via Brevo HTTPS REST API.
    6. Return success ONLY if Brevo accepts the email; rollback on failure.
    """
    client_ip = request.client.host if request.client else "unknown"
    norm_email = normalize_email(payload.email)

    # Rate limiting: max 5 requests per 15 minutes (900 seconds)
    rate_key = f"otp_req:{client_ip}:{norm_email}"
    allowed, retry_after = check_rate_limit(rate_key, max_requests=5, window_seconds=900)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many OTP requests. Please wait {retry_after} seconds.",
        )

    # Check resend cooldown on existing active record
    now = time.time()
    existing_otp = await otps_collection.find_one({"email": norm_email})
    if existing_otp:
        last_sent = existing_otp.get("last_sent_at", 0)
        time_elapsed = now - last_sent
        if time_elapsed < OTP_RESEND_COOLDOWN_SECONDS:
            remaining = int(OTP_RESEND_COOLDOWN_SECONDS - time_elapsed)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {remaining} seconds before requesting a new verification code.",
            )

    # Invalidate previous OTPs
    await otps_collection.delete_many({"email": norm_email})

    # Generate secure 6-digit OTP
    otp_code = generate_otp(6)
    hashed = hash_otp(norm_email, otp_code)

    # Persist hashed OTP record immediately
    doc = {
        "email": norm_email,
        "otp_hash": hashed,
        "expires_at": now + (OTP_EXPIRE_MINUTES * 60),
        "attempts": 0,
        "last_sent_at": now,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await otps_collection.insert_one(doc)

    # Await email delivery via Brevo HTTPS REST API
    email_sent = await send_otp_verification_email(norm_email, otp_code)
    if not email_sent:
        # Roll back stored OTP so no orphaned un-sent code remains
        await otps_collection.delete_many({"email": norm_email})
        logger.error("OTP email delivery failed for %s", mask_email(norm_email))
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send verification email. Please try again later.",
        )

    return {
        "success": True,
        "message": "Verification code sent.",
    }


@router.post("/verify-otp", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def verify_otp(payload: OTPVerifyRequest):
    """
    Verify submitted 6-digit code:
    1. Locate active OTP record.
    2. Check expiration and attempt limits.
    3. Validate keyed HMAC-SHA256 hash using constant-time comparison.
    4. Invalidate/consume OTP on success and return authenticated user state.
    """
    norm_email = normalize_email(payload.email)
    doc = await otps_collection.find_one({"email": norm_email})

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active verification code found. Please request a new one.",
        )

    now = time.time()

    # Check expiration
    if now > doc.get("expires_at", 0):
        await otps_collection.delete_one({"_id": doc["_id"]})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new one.",
        )

    # Check max attempts limit
    current_attempts = doc.get("attempts", 0)
    if current_attempts >= OTP_MAX_ATTEMPTS:
        await otps_collection.delete_one({"_id": doc["_id"]})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum verification attempts exceeded. Please request a new code.",
        )

    # Secure HMAC-SHA256 comparison
    is_valid = verify_otp_hash(norm_email, payload.otp, doc.get("otp_hash", ""))

    if not is_valid:
        new_attempts = current_attempts + 1
        await otps_collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"attempts": new_attempts}},
        )
        remaining = max(0, OTP_MAX_ATTEMPTS - new_attempts)
        if remaining == 0:
            await otps_collection.delete_one({"_id": doc["_id"]})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code. Maximum attempts exceeded. Please request a new code.",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid verification code. {remaining} attempt(s) remaining.",
        )

    # Consume OTP immediately so it cannot be reused
    await otps_collection.delete_one({"_id": doc["_id"]})

    # Successful authentication payload
    user_state = {
        "authenticated": True,
        "method": "email",
        "identifier": norm_email,
        "loginAt": datetime.now(timezone.utc).isoformat(),
    }

    return AuthResponse(
        success=True,
        message="Authentication successful.",
        user=user_state,
    )
