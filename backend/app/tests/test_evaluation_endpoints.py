"""
Unit tests for evaluation endpoints including GET /api/evaluate/{task_id}/full.
"""

import asyncio
import os
import sys
import unittest
from bson import ObjectId

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.database import full_evaluations_collection, tasks_collection


class TestEvaluationEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_get_full_evaluation_existing(self):
        """Verify GET /api/evaluate/{task_id}/full retrieves an existing cached evaluation."""
        fake_task_id = str(ObjectId())
        doc = {
            "task_id": fake_task_id,
            "reliability_score": 88.5,
            "risk_level": "LOW",
            "metrics": {
                "correctness": 90,
                "relevance": 92,
                "completeness": 85,
                "consistency": 88,
                "hallucination_risk": 12,
            },
            "failures": ["Minor tool latency"],
            "recommendations": ["Optimize payload"],
            "scenarios": [{"id": "SCEN-01", "title": "Security Check", "type": "SECURITY"}],
            "scenario_source": "nvidia",
            "provider_status": {
                "groq": "available",
                "gemini": "available",
                "mistral": "available",
                "nvidia": "available",
            },
            "scenario_results": [],
            "trace": [],
            "output": "Evaluation successful.",
            "evaluator_agreement": {
                "agreement_score": 92.0,
                "agreement_level": "VERY_HIGH",
                "metric_differences": {},
            },
            "created_at": "2026-08-23T09:00:00Z",
        }

        async def insert_doc():
            await full_evaluations_collection.insert_one(doc)

        asyncio.run(insert_doc())

        try:
            resp = self.client.get(f"/api/evaluate/{fake_task_id}/full")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["task_id"], fake_task_id)
            self.assertEqual(data["reliability_score"], 88.5)
            self.assertEqual(data["risk_level"], "LOW")
            self.assertEqual(data["metrics"]["correctness"], 90)
            self.assertEqual(data["metrics"]["hallucination_risk"], 12)
        finally:
            async def clean_doc():
                await full_evaluations_collection.delete_many({"task_id": fake_task_id})

            asyncio.run(clean_doc())

    def test_get_full_evaluation_not_found(self):
        """Verify GET /api/evaluate/{task_id}/full returns 404 for unknown task ID."""
        fake_task_id = str(ObjectId())
        resp = self.client.get(f"/api/evaluate/{fake_task_id}/full")
        self.assertEqual(resp.status_code, 404)

    def test_get_full_evaluation_invalid_id(self):
        """Verify GET /api/evaluate/{task_id}/full returns 400 for malformed ID."""
        resp = self.client.get("/api/evaluate/invalid-non-object-id/full")
        self.assertEqual(resp.status_code, 400)


if __name__ == "__main__":
    unittest.main()
