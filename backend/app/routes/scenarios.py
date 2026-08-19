from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException

from app.database import tasks_collection, scenarios_collection
from app.services.scenario_generator import generate_scenarios

router = APIRouter(prefix="/api/scenarios", tags=["Scenarios"])


@router.post("/{task_id}")
async def create_scenarios_for_task(task_id: str):
    """
    Generate testing scenarios based on the task description.
    Attempts NVIDIA NIM, falls back to local fallback scenarios if unavailable.
    Saves and returns scenarios.
    """
    try:
        oid = ObjectId(task_id)
    except (InvalidId, Exception):
        raise HTTPException(status_code=400, detail="Invalid task ID format.")

    task = await tasks_collection.find_one({"_id": oid})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    # Generate scenarios (automatically runs robust parsing, retry, and local fallback)
    scenarios, source = await generate_scenarios(task["description"])
    nvidia_available = (source == "nvidia")

    # Persist scenarios to database
    doc = {
        "task_id": task_id,
        "scenarios": scenarios,
        "scenario_source": source,
        "nvidia_available": nvidia_available,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    
    # Store or update the scenarios for this task
    await scenarios_collection.update_one(
        {"task_id": task_id},
        {"$set": doc},
        upsert=True
    )

    return {
        "task_id": task_id,
        "scenario_source": source,
        "nvidia_available": nvidia_available,
        "scenarios": scenarios,
        "count": len(scenarios)
    }
