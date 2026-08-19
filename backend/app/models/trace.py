from pydantic import BaseModel
from typing import Optional, List


class TraceStep(BaseModel):
    """A single observable step in Trasey's execution."""
    step: int
    action: str
    input: Optional[str] = None
    output: Optional[str] = None
    status: str = "success"
    duration_ms: Optional[float] = None


class TraceRecord(BaseModel):
    """Full trace stored in MongoDB."""
    task_id: str
    steps: List[TraceStep]
    total_duration_ms: float
    created_at: str
