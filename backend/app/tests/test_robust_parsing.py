import unittest
import sys
import os
from unittest.mock import patch, AsyncMock

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.services.scenario_generator import (
    robust_json_parse,
    generate_local_fallbacks,
    generate_scenarios,
    ScenarioGenerationError
)
from app.services.scoring import aggregate_metrics
from app.services.agreement import calculate_agreement


class TestRobustParsingAndFallback(unittest.IsolatedAsyncioTestCase):
    def test_robust_json_parse_valid(self):
        text = '{"scenarios": [{"id": "1", "type": "normal", "title": "A", "prompt": "P", "expected_behavior": "E", "severity": "low"}]}'
        res = robust_json_parse(text)
        self.assertIn("scenarios", res)
        self.assertEqual(res["scenarios"][0]["id"], "1")

    def test_robust_json_parse_fenced(self):
        text = '```json\n{"scenarios": [{"id": "2"}]}\n```'
        res = robust_json_parse(text)
        self.assertEqual(res["scenarios"][0]["id"], "2")

    def test_robust_json_parse_text_around(self):
        text = 'Here is the results:\n```json\n{"scenarios": [{"id": "3"}]}\n```\nHope it helps!'
        res = robust_json_parse(text)
        self.assertEqual(res["scenarios"][0]["id"], "3")

    def test_robust_json_parse_trailing_comma(self):
        text = '{"scenarios": [{"id": "4", "type": "normal",},],}'
        res = robust_json_parse(text)
        self.assertEqual(res["scenarios"][0]["id"], "4")

    def test_robust_json_parse_single_quotes(self):
        text = "{'scenarios': [{'id': '5', 'type': 'normal'}]}"
        res = robust_json_parse(text)
        self.assertEqual(res["scenarios"][0]["id"], "5")

    def test_robust_json_parse_empty(self):
        with self.assertRaises(ValueError):
            robust_json_parse("")
        with self.assertRaises(ValueError):
            robust_json_parse("   \n   ")

    def test_local_fallback_generation(self):
        fallbacks = generate_local_fallbacks("Test Agent Task")
        self.assertEqual(len(fallbacks), 5)
        for f in fallbacks:
            self.assertIn("id", f)
            self.assertIn("type", f)
            self.assertIn("title", f)
            self.assertIn("prompt", f)
            self.assertIn("expected_behavior", f)
            self.assertIn("severity", f)
            self.assertTrue(f["type"] in [
                "normal", "edge_case", "adversarial", "conflicting_instruction",
                "missing_context", "hallucination_trap", "unsafe_action", "tool_failure", "goal_drift"
            ])
            self.assertTrue(f["severity"] in ["low", "medium", "high", "critical"])

    @patch("app.services.scenario_generator.validate_nvidia_config")
    @patch("app.services.scenario_generator._call_nvidia_api")
    async def test_generate_scenarios_success(self, mock_call, mock_val):
        mock_val.return_value = None
        mock_call.return_value = '{"scenarios": [{"id": "1", "type": "normal", "title": "A", "prompt": "P", "expected_behavior": "E", "severity": "low"}]}'
        
        scenarios, source = await generate_scenarios("Task")
        self.assertEqual(source, "nvidia")
        self.assertEqual(scenarios[0]["id"], "1")

    @patch("app.services.scenario_generator.validate_nvidia_config")
    @patch("app.services.scenario_generator._call_nvidia_api")
    async def test_generate_scenarios_failure_fallback(self, mock_call, mock_val):
        mock_val.return_value = None
        mock_call.side_effect = Exception("API timeout")
        
        scenarios, source = await generate_scenarios("Task")
        self.assertEqual(source, "fallback")
        self.assertEqual(len(scenarios), 5)

    def test_mistral_failure_gemini_only_scoring(self):
        gemini = {"correctness": 90, "relevance": 90, "completeness": 90, "consistency": 90, "hallucination_risk": 10}
        res = aggregate_metrics(gemini, None)
        self.assertEqual(res, gemini)

    def test_agreement_identical(self):
        gemini = {"correctness": 90, "relevance": 90, "completeness": 90, "consistency": 90, "hallucination_risk": 10}
        mistral = {"correctness": 90, "relevance": 90, "completeness": 90, "consistency": 90, "hallucination_risk": 10}
        res = calculate_agreement(gemini, mistral)
        self.assertEqual(res["agreement_score"], 100.0)
        self.assertEqual(res["agreement_level"], "VERY_HIGH")


if __name__ == '__main__':
    unittest.main()
