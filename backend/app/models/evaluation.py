from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class EvaluationMetrics(BaseModel):
    """Raw AI-evaluator scores (0-100)."""
    correctness: int = 0
    relevance: int = 0
    completeness: int = 0
    consistency: int = 0
    hallucination_risk: int = 0


class EvaluatorAgreement(BaseModel):
    """Agreement details between Gemini and Mistral."""
    agreement_score: float
    agreement_level: str
    metric_differences: Dict[str, int]


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
    evaluators: Optional[Dict[str, Any]] = None
    evaluator_agreement: Optional[EvaluatorAgreement] = None
    scenarios: Optional[List[Any]] = None
    scenario_source: Optional[str] = None
    provider_status: Optional[Dict[str, str]] = None
    scenario_results: Optional[List[Any]] = None


