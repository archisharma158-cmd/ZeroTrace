import asyncio
import os
import sys
import unittest
from unittest.mock import AsyncMock, patch

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.services.security import clear_rate_limits
from app.services.email_service import send_contact_team_notification, send_contact_acknowledgement


class TestContactSystem(unittest.TestCase):
    def setUp(self):
        clear_rate_limits()
        self.client = TestClient(app)

    def tearDown(self):
        clear_rate_limits()

    @patch("app.routes.contact.send_contact_team_notification", new_callable=AsyncMock)
    @patch("app.routes.contact.send_contact_acknowledgement", new_callable=AsyncMock)
    def test_valid_contact_submission(self, mock_ack, mock_team):
        mock_team.return_value = True
        mock_ack.return_value = True

        payload = {
            "name": "Jane Researcher",
            "email": "jane.researcher@example.com",
            "subject": "Evaluating Autonomous LLM Agents",
            "message": "We would like to stress-test our multi-agent customer support system with TRASY.",
        }

        response = self.client.post("/api/contact", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertIn("Message sent successfully", data.get("message"))

        # Verify team notification and acknowledgement were both triggered
        mock_team.assert_awaited_once()
        mock_ack.assert_awaited_once()

        # Check call arguments
        team_args = mock_team.await_args.kwargs
        self.assertEqual(team_args["name"], payload["name"])
        self.assertEqual(team_args["email"], payload["email"])
        self.assertEqual(team_args["subject"], payload["subject"])
        self.assertEqual(team_args["message"], payload["message"])

        ack_args = mock_ack.await_args.kwargs
        self.assertEqual(ack_args["name"], payload["name"])
        self.assertEqual(ack_args["email"], payload["email"])

    def test_invalid_email_format(self):
        payload = {
            "name": "Jane Doe",
            "email": "not-an-email",
            "subject": "Test Subject",
            "message": "This is a valid test message with enough length.",
        }
        response = self.client.post("/api/contact", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_missing_required_fields(self):
        # Missing subject
        payload = {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "message": "This is a valid test message with enough length.",
        }
        response = self.client.post("/api/contact", json=payload)
        self.assertEqual(response.status_code, 422)

        # Missing name
        payload = {
            "email": "jane@example.com",
            "subject": "Test Subject",
            "message": "This is a valid test message with enough length.",
        }
        response = self.client.post("/api/contact", json=payload)
        self.assertEqual(response.status_code, 422)

        # Message too short (< 10 chars)
        payload = {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "subject": "Test Subject",
            "message": "Short",
        }
        response = self.client.post("/api/contact", json=payload)
        self.assertEqual(response.status_code, 422)

    def test_oversized_inputs(self):
        # Name > 100 chars
        payload = {
            "name": "A" * 101,
            "email": "jane@example.com",
            "subject": "Subject",
            "message": "Valid message with enough length.",
        }
        response = self.client.post("/api/contact", json=payload)
        self.assertEqual(response.status_code, 422)

        # Subject > 200 chars
        payload = {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "subject": "S" * 201,
            "message": "Valid message with enough length.",
        }
        response = self.client.post("/api/contact", json=payload)
        self.assertEqual(response.status_code, 422)

        # Message > 5000 chars
        payload = {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "subject": "Subject",
            "message": "M" * 5001,
        }
        response = self.client.post("/api/contact", json=payload)
        self.assertEqual(response.status_code, 422)

    @patch("app.routes.contact.send_contact_team_notification", new_callable=AsyncMock)
    @patch("app.routes.contact.send_contact_acknowledgement", new_callable=AsyncMock)
    def test_email_service_failure_handled_gracefully(self, mock_ack, mock_team):
        # When both fail
        mock_team.return_value = False
        mock_ack.return_value = False

        payload = {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "subject": "Inquiry",
            "message": "Testing server failure resilience when SMTP is down.",
        }
        response = self.client.post("/api/contact", json=payload)
        self.assertEqual(response.status_code, 503)
        data = response.json()
        self.assertIn("Unable to send your message", data.get("detail"))

    @patch("app.services.email_service.send_email", new_callable=AsyncMock)
    def test_html_sanitization_in_emails(self, mock_send):
        mock_send.return_value = True

        raw_name = "<script>alert('pwned')</script> Alice"
        raw_msg = "Hello <b>bold</b> & <img src=x onerror=alert(1)>"
        raw_subj = "Subject <iframe src='evil.com'></iframe>"

        async def run_async_test():
            await send_contact_team_notification(
                name=raw_name,
                email="alice@example.com",
                subject=raw_subj,
                message=raw_msg,
            )
            self.assertTrue(mock_send.called)
            kwargs = mock_send.await_args.kwargs
            html_body = kwargs["html_content"]

            # Must NOT contain raw unescaped script or iframe tags
            self.assertNotIn("<script>", html_body)
            self.assertNotIn("<iframe", html_body)
            self.assertNotIn("<img src=x", html_body)
            # Must contain escaped equivalents
            self.assertIn("&lt;script&gt;", html_body)
            self.assertIn("&lt;iframe", html_body)

            # Test visitor acknowledgement sanitization
            mock_send.reset_mock()
            await send_contact_acknowledgement(
                name=raw_name,
                email="alice@example.com",
                subject=raw_subj,
                message=raw_msg,
            )
            self.assertTrue(mock_send.called)
            ack_kwargs = mock_send.await_args.kwargs
            ack_html = ack_kwargs["html_content"]
            self.assertNotIn("<script>", ack_html)
            self.assertIn("&lt;script&gt;", ack_html)

        asyncio.run(run_async_test())

    @patch("app.routes.contact.send_contact_team_notification", new_callable=AsyncMock)
    @patch("app.routes.contact.send_contact_acknowledgement", new_callable=AsyncMock)
    def test_contact_rate_limiting(self, mock_ack, mock_team):
        mock_team.return_value = True
        mock_ack.return_value = True

        payload = {
            "name": "Jane Spammer",
            "email": "spammer@example.com",
            "subject": "Spam inquiry",
            "message": "Testing that rate limit threshold prevents flooding.",
        }

        # 5 allowed submissions
        for _ in range(5):
            resp = self.client.post("/api/contact", json=payload)
            self.assertEqual(resp.status_code, 200)

        # 6th submission should be rate limited (429)
        blocked_resp = self.client.post("/api/contact", json=payload)
        self.assertEqual(blocked_resp.status_code, 429)
        self.assertIn("Too many contact submissions", blocked_resp.json().get("detail"))


if __name__ == "__main__":
    unittest.main()
