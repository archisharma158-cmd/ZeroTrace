"""Task endpoints — create and retrieve tasks."""

from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException

from app.database import tasks_collection
from app.models.task import TaskCreate, TaskResponse

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.post("/", status_code=201)
async def create_task(payload: TaskCreate):
    """Create a new task in MongoDB."""
    doc = {
        "name": payload.name,
        "description": payload.description,
        "expected_output": payload.expected_output,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await tasks_collection.insert_one(doc)
    return {
        "task_id": str(result.inserted_id),
        "message": "Task created successfully",
    }


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str):
    """Return a single task by ID."""
    try:
        oid = ObjectId(task_id)
    except (InvalidId, Exception):
        raise HTTPException(status_code=400, detail="Invalid task ID format.")

    doc = await tasks_collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Task not found.")

    return TaskResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        description=doc["description"],
        expected_output=doc.get("expected_output"),
        created_at=doc["created_at"],
    )
