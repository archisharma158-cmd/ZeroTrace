import unittest
import sys
import os

# Add backend directory to sys.path so we can import app modules directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.services.agreement import calculate_agreement
from app.services.scoring import aggregate_metrics, calculate_reliability_score, classify_risk

class TestAgreementAndScoring(unittest.TestCase):
    def test_calculate_agreement_identical(self):
        gemini = {"correctness": 90, "relevance": 90, "completeness": 90, "consistency": 90, "hallucination_risk": 10}
        mistral = {"correctness": 90, "relevance": 90, "completeness": 90, "consistency": 90, "hallucination_risk": 10}
        res = calculate_agreement(gemini, mistral)
        self.assertIsNotNone(res)
        self.assertEqual(res["agreement_score"], 100.0)
        self.assertEqual(res["agreement_level"], "VERY_HIGH")

    def test_calculate_agreement_differing(self):
        gemini = {"correctness": 90, "relevance": 90, "completeness": 90, "consistency": 90, "hallucination_risk": 10}
        mistral = {"correctness": 80, "relevance": 95, "completeness": 85, "consistency": 90, "hallucination_risk": 20}
        # diffs: correctness: 10, relevance: 5, completeness: 5, consistency: 0, hallucination_risk: 10
        # sum of diffs: 30. average diff: 30 / 5 = 6.0. agreement_score: 100.0 - 6.0 = 94.0
        res = calculate_agreement(gemini, mistral)
        self.assertIsNotNone(res)
        self.assertEqual(res["agreement_score"], 94.0)
        self.assertEqual(res["agreement_level"], "VERY_HIGH")
        self.assertEqual(res["metric_differences"]["correctness"], 10)

    def test_calculate_agreement_one_missing(self):
        gemini = {"correctness": 90}
        res = calculate_agreement(gemini, None)
        self.assertIsNone(res)

    def test_aggregate_metrics_both_available(self):
        gemini = {"correctness": 90, "relevance": 90, "completeness": 90, "consistency": 90, "hallucination_risk": 10}
        mistral = {"correctness": 80, "relevance": 96, "completeness": 85, "consistency": 90, "hallucination_risk": 20}
        # averages: correctness: 85, relevance: 93, completeness: 88, consistency: 90, hallucination_risk: 15
        res = aggregate_metrics(gemini, mistral)
        self.assertEqual(res["correctness"], 85)
        self.assertEqual(res["relevance"], 93)
        self.assertEqual(res["completeness"], 88)
        self.assertEqual(res["consistency"], 90)
        self.assertEqual(res["hallucination_risk"], 15)

    def test_aggregate_metrics_only_gemini(self):
        gemini = {"correctness": 90, "relevance": 90, "completeness": 90, "consistency": 90, "hallucination_risk": 10}
        res = aggregate_metrics(gemini, None)
        self.assertEqual(res, gemini)

if __name__ == '__main__':
    unittest.main()
