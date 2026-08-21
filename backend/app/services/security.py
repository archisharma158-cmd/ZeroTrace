"""
ZeroTrace Security & Rate Limiting Utilities.

Provides:
- Cryptographically secure 6-digit OTP generation
- Keyed HMAC-SHA256 OTP hashing and constant-time verification
- Sliding window in-memory rate limiting
- Safe email normalization and masking
"""

import hashlib
import hmac
import re
import secrets
import time
from collections import defaultdict
from typing import Dict, List, Tuple

from app.config import SECRET_KEY

# In-memory sliding window rate limiter: key -> list of timestamp floats
_rate_limit_records: Dict[str, List[float]] = defaultdict(list)


def normalize_email(email: str) -> str:
    """Normalize email address to lowercase and strip outer whitespace."""
    return email.strip().lower()


def is_valid_email(email: str) -> bool:
    """Check if the string is a valid email format."""
    email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(email_regex, email.strip()))


def mask_email(email: str) -> str:
    """Mask email for safe client presentation, e.g. ar***@gmail.com."""
    try:
        parts = email.split("@")
        if len(parts) != 2:
            return email
        name, domain = parts
        if len(name) <= 2:
            masked_name = name[0] + "***" if len(name) > 0 else "***"
        else:
            masked_name = name[:2] + "***"
        return f"{masked_name}@{domain}"
    except Exception:
        return email


def generate_otp(length: int = 6) -> str:
    """Generate a cryptographically secure numeric OTP."""
    digits = "0123456789"
    return "".join(secrets.choice(digits) for _ in range(length))


def hash_otp(email: str, otp: str) -> str:
    """Generate a keyed HMAC-SHA256 hash of the OTP tied to the normalized email."""
    norm_email = normalize_email(email)
    msg = f"{norm_email}:{otp}".encode("utf-8")
    key = SECRET_KEY.encode("utf-8")
    return hmac.new(key, msg, hashlib.sha256).hexdigest()


def verify_otp_hash(email: str, otp: str, stored_hash: str) -> bool:
    """Constant-time verification of submitted OTP against stored HMAC-SHA256 hash."""
    expected_hash = hash_otp(email, otp)
    return hmac.compare_digest(expected_hash, stored_hash)


def check_rate_limit(key: str, max_requests: int, window_seconds: int) -> Tuple[bool, int]:
    """
    Sliding window in-memory rate limiter.
    Returns (is_allowed, retry_after_seconds).
    """
    now = time.time()
    timestamps = _rate_limit_records[key]

    # Remove timestamps older than the current window
    valid_cutoff = now - window_seconds
    _rate_limit_records[key] = [t for t in timestamps if t > valid_cutoff]
    timestamps = _rate_limit_records[key]

    if len(timestamps) >= max_requests:
        oldest_ts = timestamps[0]
        retry_after = max(1, int(oldest_ts + window_seconds - now))
        return False, retry_after

    _rate_limit_records[key].append(now)
    return True, 0


def clear_rate_limits():
    """Clear in-memory rate limit table (useful for test isolation)."""
    _rate_limit_records.clear()
