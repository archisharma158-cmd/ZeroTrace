import asyncio
import os
import sys
import time
import unittest
from unittest.mock import AsyncMock, patch

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.database import otps_collection
from app.services.security import (
    clear_rate_limits,
    generate_otp,
    hash_otp,
    mask_email,
    verify_otp_hash,
)


class TestOTPAuthentication(unittest.TestCase):
    def setUp(self):
        clear_rate_limits()
        # Clean OTP database table
        asyncio.run(otps_collection.delete_many({}))
        self.client = TestClient(app)

    def tearDown(self):
        clear_rate_limits()
        asyncio.run(otps_collection.delete_many({}))

    @patch("app.routes.auth.send_otp_verification_email", new_callable=AsyncMock)
    def test_request_otp_success_and_never_exposes_code(self, mock_email):
        mock_email.return_value = True

        email = "agent.tester@zerotrace.ai"
        response = self.client.post("/api/auth/request-otp", json={"email": email})
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertEqual(data.get("message"), "Verification code sent.")

        # SECURITY CRITICAL: OTP must NOT be returned in API response
        self.assertNotIn("otp", data)
        self.assertNotIn("code", data)
        self.assertNotIn("otp_hash", data)

        # Email service was called with the 6-digit numeric OTP
        mock_email.assert_awaited_once()
        call_args = mock_email.await_args.args
        sent_email, sent_otp = call_args
        self.assertEqual(sent_email, email)
        self.assertEqual(len(sent_otp), 6)
        self.assertTrue(sent_otp.isdigit())

    @patch("app.routes.auth.send_otp_verification_email", new_callable=AsyncMock)
    def test_verify_valid_otp_succeeds(self, mock_email):
        mock_email.return_value = True

        email = "researcher@zerotrace.ai"
        req_resp = self.client.post("/api/auth/request-otp", json={"email": email})
        self.assertEqual(req_resp.status_code, 200)

        # Extract generated OTP from mock
        sent_otp = mock_email.await_args.args[1]

        # Verify OTP
        verify_resp = self.client.post(
            "/api/auth/verify-otp",
            json={"email": email, "otp": sent_otp},
        )
        self.assertEqual(verify_resp.status_code, 200)
        verify_data = verify_resp.json()
        self.assertTrue(verify_data.get("success"))
        self.assertIn("user", verify_data)
        user = verify_data["user"]
        self.assertTrue(user["authenticated"])
        self.assertEqual(user["identifier"], email)
        self.assertEqual(user["method"], "email")

    @patch("app.routes.auth.send_otp_verification_email", new_callable=AsyncMock)
    def test_verify_incorrect_otp_increments_attempts(self, mock_email):
        mock_email.return_value = True

        email = "security@zerotrace.ai"
        self.client.post("/api/auth/request-otp", json={"email": email})

        # Submit wrong OTP
        wrong_otp = "000000"
        resp = self.client.post(
            "/api/auth/verify-otp",
            json={"email": email, "otp": wrong_otp},
        )
        self.assertEqual(resp.status_code, 400)
        data = resp.json()
        self.assertIn("Invalid verification code", data["detail"])
        self.assertIn("4 attempt(s) remaining", data["detail"])

    @patch("app.routes.auth.send_otp_verification_email", new_callable=AsyncMock)
    def test_max_attempts_exceeded_locks_otp(self, mock_email):
        mock_email.return_value = True

        email = "attacker@target.com"
        self.client.post("/api/auth/request-otp", json={"email": email})

        # Submit 5 wrong OTP attempts
        for attempt in range(1, 5):
            resp = self.client.post(
                "/api/auth/verify-otp",
                json={"email": email, "otp": f"{attempt:06d}"},
            )
            self.assertEqual(resp.status_code, 400)
            self.assertIn("remaining", resp.json()["detail"])

        # 5th attempt reaches max
        fifth_resp = self.client.post(
            "/api/auth/verify-otp",
            json={"email": email, "otp": "999999"},
        )
        self.assertEqual(fifth_resp.status_code, 400)
        self.assertIn("Maximum attempts exceeded", fifth_resp.json()["detail"])

        # Subsequent attempts fail because record was invalidated
        subsequent_resp = self.client.post(
            "/api/auth/verify-otp",
            json={"email": email, "otp": "999999"},
        )
        self.assertEqual(subsequent_resp.status_code, 400)
        self.assertIn("No active verification code found", subsequent_resp.json()["detail"])

    @patch("app.routes.auth.send_otp_verification_email", new_callable=AsyncMock)
    def test_expired_otp_fails_verification(self, mock_email):
        mock_email.return_value = True

        email = "delayed@example.com"
        self.client.post("/api/auth/request-otp", json={"email": email})
        sent_otp = mock_email.await_args.args[1]

        # Artificially expire the OTP record in the database
        async def expire_record():
            doc = await otps_collection.find_one({"email": email})
            await otps_collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"expires_at": time.time() - 10}},
            )

        asyncio.run(expire_record())

        # Attempt verification with expired OTP
        resp = self.client.post(
            "/api/auth/verify-otp",
            json={"email": email, "otp": sent_otp},
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn("expired", resp.json()["detail"].lower())

    @patch("app.routes.auth.send_otp_verification_email", new_callable=AsyncMock)
    def test_successful_otp_cannot_be_reused(self, mock_email):
        mock_email.return_value = True

        email = "reuser@example.com"
        self.client.post("/api/auth/request-otp", json={"email": email})
        sent_otp = mock_email.await_args.args[1]

        # First verification succeeds
        first_resp = self.client.post(
            "/api/auth/verify-otp",
            json={"email": email, "otp": sent_otp},
        )
        self.assertEqual(first_resp.status_code, 200)

        # Second verification with same OTP MUST fail
        second_resp = self.client.post(
            "/api/auth/verify-otp",
            json={"email": email, "otp": sent_otp},
        )
        self.assertEqual(second_resp.status_code, 400)
        self.assertIn("No active verification code found", second_resp.json()["detail"])

    @patch("app.routes.auth.send_otp_verification_email", new_callable=AsyncMock)
    def test_resend_cooldown_enforced(self, mock_email):
        mock_email.return_value = True

        email = "cooldown@example.com"
        # First request succeeds
        resp1 = self.client.post("/api/auth/request-otp", json={"email": email})
        self.assertEqual(resp1.status_code, 200)

        # Immediate second request should be blocked by 60s cooldown
        resp2 = self.client.post("/api/auth/request-otp", json={"email": email})
        self.assertEqual(resp2.status_code, 429)
        self.assertIn("Please wait", resp2.json()["detail"])

    @patch("app.routes.auth.send_otp_verification_email", new_callable=AsyncMock)
    def test_new_otp_invalidates_previous_otp(self, mock_email):
        mock_email.return_value = True

        email = "invalidation@example.com"
        # First request
        self.client.post("/api/auth/request-otp", json={"email": email})
        first_otp = mock_email.await_args.args[1]

        # Simulate cooldown elapsed
        async def bypass_cooldown():
            doc = await otps_collection.find_one({"email": email})
            await otps_collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"last_sent_at": time.time() - 70}},
            )

        asyncio.run(bypass_cooldown())

        # Second request
        self.client.post("/api/auth/request-otp", json={"email": email})
        second_otp = mock_email.await_args.args[1]

        # First OTP should no longer work
        old_resp = self.client.post(
            "/api/auth/verify-otp",
            json={"email": email, "otp": first_otp},
        )
        self.assertEqual(old_resp.status_code, 400)

        # Second OTP works
        new_resp = self.client.post(
            "/api/auth/verify-otp",
            json={"email": email, "otp": second_otp},
        )
        self.assertEqual(new_resp.status_code, 200)

    @patch("app.routes.auth.send_otp_verification_email", new_callable=AsyncMock)
    def test_email_sending_failure_returns_502_and_rolls_back(self, mock_email):
        mock_email.return_value = False

        email = "failmail@example.com"
        resp = self.client.post("/api/auth/request-otp", json={"email": email})
        self.assertEqual(resp.status_code, 502)
        self.assertIn("Failed to send verification email", resp.json()["detail"])

        # Confirm no orphaned valid OTP record was left in database
        async def check_no_otp():
            doc = await otps_collection.find_one({"email": email})
            self.assertIsNone(doc)

        asyncio.run(check_no_otp())

    def test_security_helpers(self):
        otp = generate_otp(6)
        self.assertEqual(len(otp), 6)
        self.assertTrue(otp.isdigit())

        email = "Tester@ZeroTrace.AI"
        hashed = hash_otp(email, otp)
        self.assertTrue(verify_otp_hash(email, otp, hashed))
        self.assertFalse(verify_otp_hash(email, "000000", hashed))
        self.assertFalse(verify_otp_hash("other@zerotrace.ai", otp, hashed))

        self.assertEqual(mask_email("parth@zerotrace.ai"), "pa***@zerotrace.ai")
        self.assertEqual(mask_email("a@b.com"), "a***@b.com")


if __name__ == "__main__":
    unittest.main()
