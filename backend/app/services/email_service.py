"""
ZeroTrace Central Email Service.

Handles Gmail SMTP with STARTTLS for:
- Contact team notifications
- Contact visitor acknowledgement
- Secure OTP verification emails
"""

import asyncio
import html
import logging
import smtplib
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from app.config import (
    CONTACT_RECEIVER_EMAIL,
    OTP_EXPIRE_MINUTES,
    SMTP_APP_PASSWORD,
    SMTP_EMAIL,
    SMTP_HOST,
    SMTP_PORT,
)

logger = logging.getLogger(__name__)


def _send_smtp_sync(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: str,
    reply_to: Optional[str] = None,
) -> bool:
    """Synchronous SMTP email delivery using Gmail STARTTLS."""
    if not SMTP_EMAIL or not SMTP_APP_PASSWORD:
        logger.warning(
            "SMTP credentials not fully configured (SMTP_EMAIL or SMTP_APP_PASSWORD missing). Email to %s skipped.",
            to_email,
        )
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"ZeroTrace <{SMTP_EMAIL}>"
    msg["To"] = to_email
    if reply_to:
        msg["Reply-To"] = reply_to

    # Attach plain text fallback first, then HTML
    part_text = MIMEText(text_content, "plain", "utf-8")
    part_html = MIMEText(html_content, "html", "utf-8")
    msg.attach(part_text)
    msg.attach(part_html)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_EMAIL, SMTP_APP_PASSWORD)
            server.sendmail(SMTP_EMAIL, [to_email], msg.as_string())
        logger.info("Email successfully sent to %s with subject '%s'", to_email, subject)
        return True
    except smtplib.SMTPAuthenticationError:
        logger.error("SMTP Authentication Error while attempting to send email to %s.", to_email)
        return False
    except smtplib.SMTPException as exc:
        logger.error("SMTP Error sending email to %s: %s", to_email, type(exc).__name__)
        return False
    except Exception as exc:
        logger.error("Unexpected error sending email to %s: %s", to_email, type(exc).__name__)
        return False


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: str,
    reply_to: Optional[str] = None,
) -> bool:
    """Asynchronously send an email without blocking the FastAPI event loop."""
    return await asyncio.to_thread(
        _send_smtp_sync,
        to_email=to_email,
        subject=subject,
        html_content=html_content,
        text_content=text_content,
        reply_to=reply_to,
    )


async def send_contact_team_notification(
    name: str,
    email: str,
    subject: str,
    message: str,
    timestamp: Optional[str] = None,
) -> bool:
    """Send contact submission notification to the ZeroTrace team with Reply-To set to the visitor."""
    target_email = CONTACT_RECEIVER_EMAIL or SMTP_EMAIL
    if not target_email:
        logger.warning("No receiver email configured for contact submission.")
        return False

    ts = timestamp or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    mail_subject = f"[ZeroTrace Contact] {subject}"

    # Escaped safe content for HTML
    safe_name = html.escape(name)
    safe_email = html.escape(email)
    safe_subject = html.escape(subject)
    safe_message = html.escape(message).replace("\n", "<br/>")
    safe_ts = html.escape(ts)

    text_content = f"""ZeroTrace — New Contact Form Submission

From: {name} ({email})
Date/Time: {ts}
Subject: {subject}

Message:
{message}

--------------------------------------------------
Reply directly to this email to respond to the visitor.
"""

    html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }}
  .container {{ max-width: 600px; margin: 30px auto; background-color: #121826; border: 1px solid #1f293d; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
  .header {{ background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 24px 30px; border-bottom: 1px solid #2e384d; }}
  .header h1 {{ margin: 0; font-size: 20px; color: #f8fafc; font-weight: 700; letter-spacing: 0.05em; }}
  .header span {{ color: #f97316; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }}
  .content {{ padding: 30px; }}
  .field {{ margin-bottom: 20px; }}
  .label {{ font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 4px; font-weight: 600; }}
  .value {{ font-size: 15px; color: #f1f5f9; background-color: #0d121f; padding: 12px 16px; border-radius: 8px; border: 1px solid #1e293b; }}
  .message-box {{ line-height: 1.6; white-space: pre-wrap; font-size: 14px; color: #e2e8f0; }}
  .footer {{ padding: 20px 30px; background-color: #0d121f; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; text-align: center; }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <span>ZeroTrace / Incoming Lead</span>
    <h1>New Contact Submission</h1>
  </div>
  <div class="content">
    <div class="field">
      <div class="label">Visitor Name</div>
      <div class="value">{safe_name}</div>
    </div>
    <div class="field">
      <div class="label">Visitor Email (Reply-To)</div>
      <div class="value"><a href="mailto:{safe_email}" style="color: #38bdf8; text-decoration: none;">{safe_email}</a></div>
    </div>
    <div class="field">
      <div class="label">Subject</div>
      <div class="value">{safe_subject}</div>
    </div>
    <div class="field">
      <div class="label">Timestamp</div>
      <div class="value">{safe_ts}</div>
    </div>
    <div class="field">
      <div class="label">Message</div>
      <div class="value message-box">{safe_message}</div>
    </div>
  </div>
  <div class="footer">
    ZeroTrace Autonomous AI Agent Evaluation & Reliability Platform
  </div>
</div>
</body>
</html>"""

    return await send_email(
        to_email=target_email,
        subject=mail_subject,
        html_content=html_content,
        text_content=text_content,
        reply_to=email,
    )


async def send_contact_acknowledgement(
    name: str,
    email: str,
    subject: str,
    message: str,
) -> bool:
    """Send branded acknowledgement receipt to the visitor."""
    mail_subject = "We've received your message — ZeroTrace"

    safe_name = html.escape(name)
    safe_subject = html.escape(subject)
    safe_message = html.escape(message).replace("\n", "<br/>")

    text_content = f"""Hello {name},

Thank you for reaching out to ZeroTrace.

We have received your message regarding "{subject}". Our team will review your inquiry and get back to you shortly.

Summary of your message:
--------------------------------------------------
{message}
--------------------------------------------------

Best regards,
The ZeroTrace Team
AI Agent Evaluation and Reliability Engine
https://zerotrace.ai
"""

    html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ margin: 0; padding: 0; background-color: #080c14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #cbd5e1; }}
  .container {{ max-width: 580px; margin: 35px auto; background-color: #0f1523; border: 1px solid #1e2738; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }}
  .header {{ background: radial-gradient(circle at top right, rgba(249, 115, 22, 0.15), transparent 70%), linear-gradient(180deg, #131b2e 0%, #0f1523 100%); padding: 32px 36px 24px; border-bottom: 1px solid #1e2738; text-align: left; }}
  .brand-badge {{ display: inline-block; padding: 4px 10px; background: rgba(249, 115, 22, 0.12); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 6px; color: #f97316; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px; }}
  .header h1 {{ margin: 0; font-size: 22px; color: #f8fafc; font-weight: 700; }}
  .content {{ padding: 32px 36px; line-height: 1.7; font-size: 15px; color: #cbd5e1; }}
  .content p {{ margin: 0 0 18px; }}
  .highlight {{ color: #f97316; font-weight: 600; }}
  .summary-card {{ background-color: #080d16; border: 1px solid #1a2233; border-radius: 10px; padding: 18px 20px; margin: 24px 0; }}
  .summary-title {{ font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 700; margin-bottom: 8px; }}
  .summary-subject {{ font-size: 14px; color: #f1f5f9; font-weight: 600; margin-bottom: 10px; }}
  .summary-body {{ font-size: 13px; color: #94a3b8; line-height: 1.5; }}
  .footer {{ padding: 24px 36px; background-color: #090d17; border-top: 1px solid #161e2e; font-size: 12px; color: #64748b; line-height: 1.6; }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="brand-badge">ZeroTrace / TRASY Engine</div>
    <h1>Message Received</h1>
  </div>
  <div class="content">
    <p>Hello <strong style="color: #f1f5f9;">{safe_name}</strong>,</p>
    <p>Thank you for connecting with <strong>ZeroTrace</strong>. We have successfully received your message regarding <span class="highlight">"{safe_subject}"</span>.</p>
    <p>Our engineering and research team will review your inquiry and follow up with you as soon as possible.</p>
    <div class="summary-card">
      <div class="summary-title">Summary of your submission</div>
      <div class="summary-subject">{safe_subject}</div>
      <div class="summary-body">{safe_message}</div>
    </div>
    <p style="margin-bottom: 0;">In the meantime, feel free to explore our autonomous reliability engine and adversarial evaluation benchmarks.</p>
  </div>
  <div class="footer">
    <strong>ZeroTrace</strong> — Break your AI before it breaks.<br/>
    Autonomous AI Agent Evaluation & Reliability Engine.
  </div>
</div>
</body>
</html>"""

    return await send_email(
        to_email=email,
        subject=mail_subject,
        html_content=html_content,
        text_content=text_content,
    )


async def send_otp_verification_email(
    email: str,
    otp_code: str,
) -> bool:
    """Send branded 6-digit OTP verification email to the user."""
    mail_subject = "Your ZeroTrace verification code"

    text_content = f"""ZeroTrace — Verify Your Email

Your 6-digit verification code is: {otp_code}

This code will expire in {OTP_EXPIRE_MINUTES} minutes.
For security reasons, never share this code with anyone.

If you did not request this verification code, please ignore this email.

— ZeroTrace Security Team
"""

    html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {{ margin: 0; padding: 0; background-color: #080c14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #cbd5e1; }}
  .container {{ max-width: 520px; margin: 40px auto; background-color: #0f1523; border: 1px solid #1e2738; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.6); }}
  .header {{ background: radial-gradient(circle at top right, rgba(249, 115, 22, 0.15), transparent 70%), linear-gradient(180deg, #131b2e 0%, #0f1523 100%); padding: 32px 36px 20px; border-bottom: 1px solid #1e2738; text-align: center; }}
  .brand {{ font-size: 20px; font-weight: 800; letter-spacing: 0.1em; color: #f8fafc; text-transform: uppercase; }}
  .brand span {{ color: #f97316; }}
  .subhead {{ font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-top: 4px; font-weight: 600; }}
  .content {{ padding: 36px; text-align: center; }}
  .heading {{ font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 12px; }}
  .desc {{ font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px; }}
  .otp-box {{ background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%); border: 1px solid rgba(249, 115, 22, 0.35); border-radius: 12px; padding: 22px 10px; margin: 0 auto 28px; max-width: 320px; }}
  .otp-code {{ font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace; font-size: 38px; font-weight: 800; letter-spacing: 0.28em; color: #f97316; margin-left: 0.28em; }}
  .notice {{ font-size: 12px; color: #64748b; line-height: 1.6; margin-bottom: 10px; }}
  .footer {{ padding: 20px 36px; background-color: #090d17; border-top: 1px solid #161e2e; font-size: 11px; color: #475569; text-align: center; line-height: 1.5; }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="brand">Zero<span>Trace</span></div>
    <div class="subhead">TRASY / Secure Access</div>
  </div>
  <div class="content">
    <div class="heading">Verify your email</div>
    <div class="desc">Enter the verification code below to securely sign in to your ZeroTrace dashboard and evaluation engine.</div>
    <div class="otp-box">
      <div class="otp-code">{otp_code}</div>
    </div>
    <div class="notice">
      This code is valid for <strong>{OTP_EXPIRE_MINUTES} minutes</strong> and can only be used once.<br/>
      Never share this verification code with anyone.
    </div>
  </div>
  <div class="footer">
    If you did not request this verification code, you can safely ignore this email.<br/>
    &copy; ZeroTrace Autonomous AI Reliability Platform.
  </div>
</div>
</body>
</html>"""

    return await send_email(
        to_email=email,
        subject=mail_subject,
        html_content=html_content,
        text_content=text_content,
    )
