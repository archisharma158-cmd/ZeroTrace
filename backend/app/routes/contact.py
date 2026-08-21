"""Contact routes — handle inquiry submissions and email dispatch."""

import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request, status

from app.models.contact import ContactRequest, ContactResponse
from app.services.email_service import (
    send_contact_acknowledgement,
    send_contact_team_notification,
)
from app.services.security import check_rate_limit, normalize_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/contact", tags=["Contact"])


@router.post("", response_model=ContactResponse, status_code=status.HTTP_200_OK)
@router.post("/", response_model=ContactResponse, status_code=status.HTTP_200_OK, include_in_schema=False)
async def submit_contact_form(payload: ContactRequest, request: Request):
    """
    Handle contact form submissions:
    1. Apply spam / rate limiting per client IP and email.
    2. Dispatch notification email to ZeroTrace team.
    3. Dispatch branded acknowledgement receipt to the visitor.
    """
    client_ip = request.client.host if request.client else "unknown"
    rate_key = f"contact:{client_ip}:{normalize_email(payload.email)}"

    # Allow max 5 submissions per 5 minutes (300 seconds)
    allowed, retry_after = check_rate_limit(rate_key, max_requests=5, window_seconds=300)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many contact submissions. Please wait {retry_after} seconds before trying again.",
        )

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    # Send team notification
    team_sent = await send_contact_team_notification(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message,
        timestamp=ts,
    )

    # Send visitor acknowledgement
    ack_sent = await send_contact_acknowledgement(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message,
    )

    if not team_sent and not ack_sent:
        logger.error("Failed to send both team notification and visitor acknowledgement.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to send your message. Please try again.",
        )

    return ContactResponse(
        success=True,
        message="Message sent successfully. We'll get back to you soon.",
    )
