"""
Unit tests for CORS configuration and preflight OPTIONS handling in ZeroTrace.
"""

import os
import sys
import unittest

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from fastapi.testclient import TestClient
from app.main import app


class TestCORSConfiguration(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_preflight_production_vercel_url(self):
        """Preflight OPTIONS from https://zero-trace-nine.vercel.app should return 200 with CORS headers."""
        origin = "https://zero-trace-nine.vercel.app"
        response = self.client.options(
            "/api/auth/request-otp",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("access-control-allow-origin"), origin)
        self.assertEqual(response.headers.get("access-control-allow-credentials"), "true")
        self.assertIn("POST", response.headers.get("access-control-allow-methods", ""))
        self.assertIn("content-type", response.headers.get("access-control-allow-headers", "").lower())

    def test_preflight_vercel_preview_url(self):
        """Preflight OPTIONS from Vercel preview URLs (e.g. branch deployments) should return 200."""
        origin = "https://zero-trace-git-main-example.vercel.app"
        response = self.client.options(
            "/api/auth/request-otp",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("access-control-allow-origin"), origin)
        self.assertEqual(response.headers.get("access-control-allow-credentials"), "true")

    def test_preflight_localhost_5173(self):
        """Preflight OPTIONS from http://localhost:5173 should return 200."""
        origin = "http://localhost:5173"
        response = self.client.options(
            "/api/auth/request-otp",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("access-control-allow-origin"), origin)

    def test_preflight_127_0_0_1_5173(self):
        """Preflight OPTIONS from http://127.0.0.1:5173 should return 200."""
        origin = "http://127.0.0.1:5173"
        response = self.client.options(
            "/api/auth/request-otp",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("access-control-allow-origin"), origin)

    def test_preflight_contact_endpoint(self):
        """Preflight OPTIONS on /api/contact should return 200."""
        origin = "https://zero-trace-nine.vercel.app"
        response = self.client.options(
            "/api/contact",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("access-control-allow-origin"), origin)

    def test_preflight_disallowed_origin_returns_400(self):
        """Preflight OPTIONS from untrusted origin should return 400."""
        origin = "https://unauthorized-malicious-domain.com"
        response = self.client.options(
            "/api/auth/request-otp",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertNotIn("access-control-allow-origin", response.headers)


if __name__ == "__main__":
    unittest.main()
