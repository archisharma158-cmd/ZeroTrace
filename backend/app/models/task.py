from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone


class TaskCreate(BaseModel):
    """Payload for creating a new task."""
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=5000)
    expected_output: Optional[str] = None


class TaskResponse(BaseModel):
    """Single task returned to the frontend."""
    id: str
    name: str
    description: str
    expected_output: Optional[str] = None
    created_at: str
