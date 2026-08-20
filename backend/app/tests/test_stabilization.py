import unittest
import sys
import os
from unittest.mock import patch, AsyncMock, MagicMock

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.services.evaluator import evaluate_agent, _DEFAULT_EVALUATION
from app.services.mistral_evaluator import evaluate_agent_mistral
from app.services.agreement import calculate_agreement
from app.services.scoring import aggregate_metrics

class TestStabilizationBehavior(unittest.IsolatedAsyncioTestCase):
    def test_agreement_null_when_gemini_fallback(self):
        # Gemini is in fallback state
        gemini = dict(_DEFAULT_EVALUATION)
        mistral = {"correctness": 80, "relevance": 85, "completeness": 90, "consistency": 90, "hallucination_risk": 10, "is_fallback": False}
        
        res = calculate_agreement(gemini, mistral)
        self.assertIsNone(res, "Agreement must be null if Gemini is in fallback state")

    def test_agreement_null_when_mistral_missing_or_fallback(self):
        gemini = {"correctness": 90, "relevance": 90, "completeness": 90, "consistency": 90, "hallucination_risk": 10, "is_fallback": False}
        
        # Mistral missing
        self.assertIsNone(calculate_agreement(gemini, None))
        
        # Mistral fallback
        mistral_fallback = {"correctness": 50, "is_fallback": True}
        self.assertIsNone(calculate_agreement(gemini, mistral_fallback))

    @patch("app.services.evaluator._get_gemini_client")
    @patch("app.services.evaluator._get_available_gemini_models")
    async def test_gemini_success_sets_is_fallback_false(self, mock_models, mock_client):
        # Mock models discovery
        mock_models.return_value = ["gemini-3.6-flash"]
        
        # Mock generate_content response
        mock_response = AsyncMock()
        mock_response.text = '{"correctness": 95, "relevance": 95, "completeness": 90, "consistency": 100, "hallucination_risk": 0, "failures": [], "recommendations": []}'
        
        mock_genai_client = MagicMock()
        mock_genai_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
        mock_client.return_value = mock_genai_client
        
        res = await evaluate_agent("Task", "Output")
        self.assertEqual(res["correctness"], 95)
        self.assertFalse(res["is_fallback"], "Successful Gemini evaluation must set is_fallback to False")

    @patch("app.services.evaluator._get_gemini_client")
    @patch("app.services.evaluator._get_available_gemini_models")
    async def test_gemini_failure_sets_is_fallback_true(self, mock_models, mock_client):
        mock_models.return_value = ["gemini-3.6-flash"]
        
        # Mock generate_content raising exception
        mock_genai_client = MagicMock()
        mock_genai_client.aio.models.generate_content = AsyncMock(side_effect=Exception("API limit"))
        mock_client.return_value = mock_genai_client
        
        res = await evaluate_agent("Task", "Output")
        self.assertEqual(res["correctness"], 50)
        self.assertTrue(res["is_fallback"], "Failed Gemini evaluation must set is_fallback to True")

    @patch("app.services.mistral_evaluator.httpx.AsyncClient")
    @patch("app.services.mistral_evaluator._get_available_mistral_models")
    async def test_mistral_fallback_sequence(self, mock_models, mock_client_cls):
        # Mock available models on Mistral tier
        mock_models.return_value = ["mistral-small-latest"]
        
        # Mock http response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "choices": [
                {
                    "message": {
                        "content": '{"correctness": 88, "relevance": 90, "completeness": 85, "consistency": 95, "hallucination_risk": 5, "failures": [], "recommendations": []}'
                    }
                }
            ]
        }
        
        # Mock AsyncClient.post context manager
        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response
        mock_client_cls.return_value.__aenter__.return_value = mock_client
        
        res = await evaluate_agent_mistral("Task", "Output")
        self.assertIsNotNone(res)
        self.assertEqual(res["correctness"], 88)
        self.assertFalse(res["is_fallback"])

if __name__ == '__main__':
    unittest.main()
