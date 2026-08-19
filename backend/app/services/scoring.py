"""
Deterministic reliability scoring — no LLM involved.

Weighted formula + risk-level classification.
"""

from typing import Dict

# ── Weight configuration (easy to tweak) ──────────────────────────────
WEIGHTS: Dict[str, float] = {
    "correctness": 0.30,
    "relevance": 0.20,
    "completeness": 0.20,
    "consistency": 0.20,
    "hallucination": 0.10,  # applied to (100 - hallucination_risk)
}

# ── Risk-level thresholds ─────────────────────────────────────────────
RISK_THRESHOLDS = [
    (80, "LOW"),
    (60, "MEDIUM"),
    # everything below 60
]
DEFAULT_RISK_LEVEL = "HIGH"


def calculate_reliability_score(
    correctness: int,
    relevance: int,
    completeness: int,
    consistency: int,
    hallucination_risk: int,
) -> float:
    """Return a weighted reliability score rounded to 2 decimal places."""
    score = (
        WEIGHTS["correctness"] * correctness
        + WEIGHTS["relevance"] * relevance
        + WEIGHTS["completeness"] * completeness
        + WEIGHTS["consistency"] * consistency
        + WEIGHTS["hallucination"] * (100 - hallucination_risk)
    )
    return round(score, 2)


def classify_risk(reliability_score: float) -> str:
    """Map a reliability score to a human-readable risk level."""
    for threshold, level in RISK_THRESHOLDS:
        if reliability_score >= threshold:
            return level
    return DEFAULT_RISK_LEVEL
