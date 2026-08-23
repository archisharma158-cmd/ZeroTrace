"""
Unit tests for ZeroTrace Brevo Transactional Email Service integration.
All outbound HTTP requests are mocked — no real emails are sent during test execution.
"""

import asyncio
import os
import sys
import time
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import httpx
from fastapi.testclient import TestClient

from app.main import app
from app.database import otps_collection
from app.services.email_service import (
    BREVO_API_URL,
    send_contact_acknowledgement,
    send_contact_team_notification,
    send_email,
    send_otp_verification_email,
)
from app.services.security import clear_rate_limits


class TestBrevoEmailService(unittest.TestCase):
    def setUp(self):
        clear_rate_limits()
        asyncio.run(otps_collection.delete_many({}))
        self.client = TestClient(app)

    def tearDown(self):
        clear_rate_limits()
        asyncio.run(otps_collection.delete_many({}))

    # 1. Successful Brevo API response
    @patch("httpx.AsyncClient.post")
    def test_brevo_send_success(self, mock_post):
        """Verify successful Brevo API call (HTTP 201/200) returns True with correct endpoint, headers, and payload."""
        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_response.is_success = True
        mock_post.return_value = mock_response

        with patch("app.services.email_service.BREVO_API_KEY", "mock-brevo-key-12345"), \
             patch("app.services.email_service.BREVO_SENDER_EMAIL", "auth@zerotrace.ai"), \
             patch("app.services.email_service.BREVO_SENDER_NAME", "ZeroTrace"):
            result = asyncio.run(
                send_email(
                    to_email="user@example.com",
                    subject="Test Subject",
                    html_content="<p>Test HTML</p>",
                    text_content="Test Text",
                    reply_to="support@zerotrace.ai",
                )
            )

        self.assertTrue(result)
        mock_post.assert_called_once()
        call_args = mock_post.call_args
        target_url = call_args[0][0] if call_args[0] else call_args.kwargs.get("url")
        headers = call_args.kwargs.get("headers", {})
        payload = call_args.kwargs.get("json", {})

        self.assertEqual(target_url, "https://api.brevo.com/v3/smtp/email")
        self.assertEqual(headers.get("api-key"), "mock-brevo-key-12345")
        self.assertEqual(headers.get("accept"), "application/json")
        self.assertEqual(headers.get("content-type"), "application/json")

        self.assertEqual(payload["sender"]["name"], "ZeroTrace")
        self.assertEqual(payload["sender"]["email"], "auth@zerotrace.ai")
        self.assertEqual(payload["to"], [{"email": "user@example.com"}])
        self.assertEqual(payload["subject"], "Test Subject")
        self.assertEqual(payload["htmlContent"], "<p>Test HTML</p>")
        self.assertEqual(payload["textContent"], "Test Text")
        self.assertEqual(payload["replyTo"], {"email": "support@zerotrace.ai"})

    # 2. Brevo 400 response
    @patch("httpx.AsyncClient.post")
    def test_brevo_http_400_failure(self, mock_post):
        """Verify Brevo HTTP 400 Bad Request returns False gracefully."""
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.is_success = False
        mock_post.return_value = mock_response

        with patch("app.services.email_service.BREVO_API_KEY", "mock-key"), \
             patch("app.services.email_service.BREVO_SENDER_EMAIL", "auth@zerotrace.ai"):
            result = asyncio.run(
                send_email(
                    to_email="invalid@example.com",
                    subject="Test Subject",
                    html_content="<p>Test</p>",
                    text_content="Test",
                )
            )

        self.assertFalse(result)

    # 3. Brevo 401/403 response
    @patch("httpx.AsyncClient.post")
    def test_brevo_http_401_403_unauthorized(self, mock_post):
        """Verify Brevo HTTP 401 Unauthorized / 403 Forbidden returns False gracefully."""
        for code in (401, 403):
            mock_response = MagicMock()
            mock_response.status_code = code
            mock_response.is_success = False
            mock_post.return_value = mock_response

            with patch("app.services.email_service.BREVO_API_KEY", "invalid-key"), \
                 patch("app.services.email_service.BREVO_SENDER_EMAIL", "auth@zerotrace.ai"):
                result = asyncio.run(
                    send_email(
                        to_email="unauth@example.com",
                        subject="Auth Test",
                        html_content="<p>Test</p>",
                        text_content="Test",
                    )
                )

            self.assertFalse(result)

    # 4. Brevo 429 response
    @patch("httpx.AsyncClient.post")
    def test_brevo_http_429_rate_limited(self, mock_post):
        """Verify Brevo HTTP 429 Too Many Requests returns False gracefully."""
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.is_success = False
        mock_post.return_value = mock_response

        with patch("app.services.email_service.BREVO_API_KEY", "mock-key"), \
             patch("app.services.email_service.BREVO_SENDER_EMAIL", "auth@zerotrace.ai"):
            result = asyncio.run(
                send_email(
                    to_email="ratelimited@example.com",
                    subject="Rate Limit Test",
                    html_content="<p>Test</p>",
                    text_content="Test",
                )
            )

        self.assertFalse(result)

    # 5. Brevo 500 response
    @patch("httpx.AsyncClient.post")
    def test_brevo_http_500_server_error(self, mock_post):
        """Verify Brevo HTTP 500 Internal Server Error returns False gracefully."""
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.is_success = False
        mock_post.return_value = mock_response

        with patch("app.services.email_service.BREVO_API_KEY", "mock-key"), \
             patch("app.services.email_service.BREVO_SENDER_EMAIL", "auth@zerotrace.ai"):
            result = asyncio.run(
                send_email(
                    to_email="servererror@example.com",
                    subject="500 Test",
                    html_content="<p>Test</p>",
                    text_content="Test",
                )
            )

        self.assertFalse(result)

    # 6. Network exception
    @patch("httpx.AsyncClient.post")
    def test_brevo_network_exception_handled(self, mock_post):
        """Verify network connection errors (httpx.ConnectError) return False gracefully."""
        mock_post.side_effect = httpx.ConnectError("Connection refused by gateway")

        with patch("app.services.email_service.BREVO_API_KEY", "mock-key"), \
             patch("app.services.email_service.BREVO_SENDER_EMAIL", "auth@zerotrace.ai"):
            result = asyncio.run(
                send_email(
                    to_email="neterr@example.com",
                    subject="Network Error Test",
                    html_content="<p>Test</p>",
                    text_content="Test",
                )
            )

        self.assertFalse(result)

    # 7. Timeout exception
    @patch("httpx.AsyncClient.post")
    def test_brevo_timeout_exception_handled(self, mock_post):
        """Verify HTTP timeout errors (httpx.TimeoutException) return False gracefully."""
        mock_post.side_effect = httpx.TimeoutException("Read timed out after 15.0s")

        with patch("app.services.email_service.BREVO_API_KEY", "mock-key"), \
             patch("app.services.email_service.BREVO_SENDER_EMAIL", "auth@zerotrace.ai"):
            result = asyncio.run(
                send_email(
                    to_email="timeout@example.com",
                    subject="Timeout Test",
                    html_content="<p>Test</p>",
                    text_content="Test",
                )
            )

        self.assertFalse(result)

    # 8. Missing BREVO_API_KEY
    def test_missing_brevo_api_key_fails_safely(self):
        """Verify missing BREVO_API_KEY safely aborts email delivery without making HTTP calls."""
        with patch("app.services.email_service.BREVO_API_KEY", ""), \
             patch("app.services.email_service.BREVO_SENDER_EMAIL", "auth@zerotrace.ai"):
            result = asyncio.run(
                send_email(
                    to_email="nokey@example.com",
                    subject="No Key Test",
                    html_content="<p>Test</p>",
                    text_content="Test",
                )
            )

        self.assertFalse(result)

    # 9. Missing BREVO_SENDER_EMAIL
    def test_missing_brevo_sender_email_fails_safely(self):
        """Verify missing BREVO_SENDER_EMAIL safely aborts email delivery without making HTTP calls."""
        with patch("app.services.email_service.BREVO_API_KEY", "mock-key"), \
             patch("app.services.email_service.BREVO_SENDER_EMAIL", ""):
            result = asyncio.run(
                send_email(
                    to_email="nosender@example.com",
                    subject="No Sender Test",
                    html_content="<p>Test</p>",
                    text_content="Test",
                )
            )

        self.assertFalse(result)

    # 10. OTP request returns 200 only when Brevo succeeds
    @patch("app.routes.auth.send_otp_verification_email", new_callable=AsyncMock)
    def test_otp_request_returns_200_on_success(self, mock_send_otp):
        """Verify POST /api/auth/request-otp returns 200 OK and success response when Brevo succeeds."""
        mock_send_otp.return_value = True

        email = "analyst@zerotrace.ai"
        resp = self.client.post("/api/auth/request-otp", json={"email": email})
        self.assertEqual(resp.status_code, 200)

        data = resp.json()
        self.assertTrue(data.get("success"))
        self.assertEqual(data.get("message"), "Verification code sent.")

        # Ensure OTP code is never exposed in response
        self.assertNotIn("otp", data)
        self.assertNotIn("code", data)
        self.assertNotIn("otp_hash", data)

        mock_send_otp.assert_awaited_once()

    # 11. OTP request returns 502 when Brevo fails
    @patch("app.routes.auth.send_otp_verification_email", new_callable=AsyncMock)
    def test_otp_request_returns_502_on_brevo_failure(self, mock_send_otp):
        """Verify POST /api/auth/request-otp returns 502 Bad Gateway when Brevo delivery fails."""
        mock_send_otp.return_value = False

        email = "faildelivery@zerotrace.ai"
        resp = self.client.post("/api/auth/request-otp", json={"email": email})
        self.assertEqual(resp.status_code, 502)
        data = resp.json()
        self.assertIn("Failed to send verification email", data.get("detail", ""))

    # 12. Failed delivery removes pending OTP
    @patch("app.routes.auth.send_otp_verification_email", new_callable=AsyncMock)
    def test_failed_delivery_removes_pending_otp(self, mock_send_otp):
        """Verify no orphaned OTP record remains stored in database if Brevo dispatch fails."""
        mock_send_otp.return_value = False

        email = "cleanup@zerotrace.ai"
        resp = self.client.post("/api/auth/request-otp", json={"email": email})
        self.assertEqual(resp.status_code, 502)

        async def check_db():
            doc = await otps_collection.find_one({"email": email})
            self.assertIsNone(doc)

        asyncio.run(check_db())

    # 13. OTP verification behavior remains unchanged
    @patch("app.routes.auth.send_otp_verification_email", new_callable=AsyncMock)
    def test_otp_verification_flow_remains_unchanged(self, mock_send_otp):
        """Verify OTP verification verifies valid code, blocks invalid code, and handles single-use consumption."""
        mock_send_otp.return_value = True

        email = "engineer@zerotrace.ai"
        req_resp = self.client.post("/api/auth/request-otp", json={"email": email})
        self.assertEqual(req_resp.status_code, 200)

        # Extract generated OTP passed to email service
        sent_otp = mock_send_otp.await_args.args[1]
        self.assertEqual(len(sent_otp), 6)
        self.assertTrue(sent_otp.isdigit())

        # Invalid OTP attempt
        bad_resp = self.client.post("/api/auth/verify-otp", json={"email": email, "otp": "000000"})
        self.assertEqual(bad_resp.status_code, 400)
        self.assertIn("Invalid verification code", bad_resp.json().get("detail", ""))

        # Valid OTP attempt succeeds
        good_resp = self.client.post("/api/auth/verify-otp", json={"email": email, "otp": sent_otp})
        self.assertEqual(good_resp.status_code, 200)
        good_data = good_resp.json()
        self.assertTrue(good_data.get("success"))
        self.assertEqual(good_data["user"]["identifier"], email)

        # Cannot reuse consumed OTP
        reuse_resp = self.client.post("/api/auth/verify-otp", json={"email": email, "otp": sent_otp})
        self.assertEqual(reuse_resp.status_code, 400)
        self.assertIn("No active verification code found", reuse_resp.json().get("detail", ""))

    # 14. Contact email works via Brevo
    @patch("app.services.email_service.send_email", new_callable=AsyncMock)
    def test_contact_email_dispatches_via_brevo(self, mock_send_email):
        """Verify contact form dispatches team notification and visitor receipt via send_email."""
        mock_send_email.return_value = True

        payload = {
            "name": "Sarah Connor",
            "email": "sarah@cyberdyne.com",
            "subject": "Inquiry about Trasey reliability testing",
            "message": "We need to evaluate autonomous agent guardrails.",
        }

        resp = self.client.post("/api/contact", json=payload)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json().get("success"))

        # Verify send_email was called twice (team notification + acknowledgement)
        self.assertEqual(mock_send_email.await_count, 2)

    # OTP layout and branding test
    @patch("app.services.email_service.send_email", new_callable=AsyncMock)
    def test_otp_email_layout_and_parameters(self, mock_send):
        """Verify OTP verification email structure, branding, expiration, and code."""
        mock_send.return_value = True

        otp_code = "482910"
        email = "agent@zerotrace.ai"

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
