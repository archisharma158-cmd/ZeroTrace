"""Trace endpoints — retrieve execution traces."""

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException

from app.database import traces_collection

router = APIRouter(prefix="/api/traces", tags=["Traces"])


@router.get("/{task_id}")
async def get_trace(task_id: str):
    """Return the execution trace for a given task."""
    try:
        ObjectId(task_id)  # validate format
    except (InvalidId, Exception):
        raise HTTPException(status_code=400, detail="Invalid task ID format.")

    doc = await traces_collection.find_one({"task_id": task_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Trace not found for this task.")

    return {
        "trace_id": str(doc["_id"]),
        "task_id": doc["task_id"],
        "steps": doc["steps"],
        "total_duration_ms": doc["total_duration_ms"],
        "created_at": doc["created_at"],
    }
