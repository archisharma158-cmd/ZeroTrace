"""
Unit tests for ZeroTrace Resend Email Service integration.
"""

import asyncio
import os
import sys
import unittest
from unittest.mock import MagicMock, patch

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import resend
from app.services.email_service import (
    _send_resend_sync,
    send_contact_acknowledgement,
    send_contact_team_notification,
    send_email,
    send_otp_verification_email,
)


class TestResendEmailService(unittest.TestCase):
    @patch("resend.Emails.send")
    def test_resend_send_success(self, mock_send):
        """Verify successful Resend API call returns True and passes correct parameters."""
        mock_send.return_value = {"id": "re_test_success_123"}

        with patch("app.services.email_service.RESEND_API_KEY", "re_mock_valid_key"):
            result = asyncio.run(
                send_email(
                    to_email="user@example.com",
                    subject="Test Subject",
                    html_content="<p>Test HTML</p>",
                    text_content="Test Text",
                    reply_to="reply@example.com",
                )
            )

        self.assertTrue(result)
        mock_send.assert_called_once()
        call_params = mock_send.call_args[0][0]
        self.assertEqual(call_params["to"], ["user@example.com"])
        self.assertEqual(call_params["subject"], "Test Subject")
        self.assertEqual(call_params["html"], "<p>Test HTML</p>")
        self.assertEqual(call_params["text"], "Test Text")
        self.assertEqual(call_params["reply_to"], "reply@example.com")

    @patch("resend.Emails.send")
    def test_resend_api_failure_handled_gracefully(self, mock_send):
        """Verify Resend API errors return False without unhandled exceptions."""
        mock_send.side_effect = resend.exceptions.ResendError(
            code=422,
            error_type="validation_error",
            message="Invalid API key format",
            suggested_action="Check your API key in the Resend dashboard.",
        )

        with patch("app.services.email_service.RESEND_API_KEY", "re_mock_key"):
            result = asyncio.run(
                send_email(
                    to_email="fail@example.com",
                    subject="Test Failure",
                    html_content="<p>Test</p>",
                    text_content="Test",
                )
            )

        self.assertFalse(result)

    def test_resend_missing_api_key_fails_safely(self):
        """When RESEND_API_KEY is not configured, email sending aborts safely."""
        with patch("app.services.email_service.RESEND_API_KEY", ""), patch.object(resend, "api_key", None):
            result = _send_resend_sync(
                to_email="nokey@example.com",
                subject="Test No Key",
                html_content="<p>Test</p>",
                text_content="Test",
            )
            self.assertFalse(result)

    @patch("app.services.email_service.send_email")
    def test_otp_email_layout_and_parameters(self, mock_send):
        """Verify OTP verification email structure, branding, expiration, and code."""
        mock_send.return_value = True

        otp_code = "839201"
        email = "analyst@zerotrace.ai"

        result = asyncio.run(send_otp_verification_email(email, otp_code))
        self.assertTrue(result)
        mock_send.assert_awaited_once()

        kwargs = mock_send.await_args.kwargs
        self.assertEqual(kwargs["to_email"], email)
        self.assertIn("ZeroTrace", kwargs["subject"])

        html_body = kwargs["html_content"]
        text_body = kwargs["text_content"]

        # Verify OTP code is in body
        self.assertIn(otp_code, html_body)
        self.assertIn(otp_code, text_body)

        # Verify security notices
        self.assertIn("5 minutes", html_body)
        self.assertIn("ignore this email", html_body.lower())
        self.assertNotIn("http://", html_body)  # No unencrypted external assets


if __name__ == "__main__":
    unittest.main()
