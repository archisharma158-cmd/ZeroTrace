from pydantic import BaseModel
from typing import List, Optional


class EvaluationMetrics(BaseModel):
    """Raw AI-evaluator scores (0-100)."""
    correctness: int = 0
    relevance: int = 0
    completeness: int = 0
    consistency: int = 0
    hallucination_risk: int = 0


class EvaluationResult(BaseModel):
    """Full evaluation returned to the frontend."""
    evaluation_id: str
    task_id: str
    output: str
    reliability_score: float
    risk_level: str
    failures: List[str]
    recommendations: List[str]
    metrics: EvaluationMetrics
    trace: list
