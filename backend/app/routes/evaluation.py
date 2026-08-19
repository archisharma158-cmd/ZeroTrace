"""
Evaluation endpoint — the core pipeline.

Task → Trasey → Trace → AI Evaluator → Deterministic Score → MongoDB → Response
"""

from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException

from app.database import tasks_collection, traces_collection, evaluations_collection
from app.models.evaluation import EvaluationMetrics, EvaluationResult
from app.services.agent import run_trasey
from app.services.evaluator import evaluate_agent
from app.services.scoring import calculate_reliability_score, classify_risk

router = APIRouter(prefix="/api", tags=["Evaluation"])


@router.post("/evaluate/{task_id}", response_model=EvaluationResult)
async def evaluate_task(task_id: str):
    """
    Full evaluation pipeline:
    1. Validate task ID & fetch task
    2. Run Trasey agent
    3. Save execution trace
    4. AI-evaluate the agent output
    5. Compute deterministic reliability score
    6. Classify risk level
    7. Persist evaluation to MongoDB
    8. Return frontend-friendly response
    """

    # ── 1. Validate & fetch task ──────────────────────────────────────
    try:
        oid = ObjectId(task_id)
    except (InvalidId, Exception):
        raise HTTPException(status_code=400, detail="Invalid task ID format.")

    task = await tasks_collection.find_one({"_id": oid})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    # ── 2. Run Trasey ─────────────────────────────────────────────────
    agent_result = await run_trasey(task["description"])

    if agent_result.get("error"):
        raise HTTPException(
            status_code=502,
            detail=f"Agent execution failed: {agent_result['error']}",
        )

    agent_output: str = agent_result["output"]
    trace_steps: list = agent_result["steps"]
    total_duration: float = agent_result["duration_ms"]

    if not agent_output.strip():
        raise HTTPException(status_code=502, detail="Agent returned empty output.")

    # ── 3. Save trace ─────────────────────────────────────────────────
    trace_doc = {
        "task_id": task_id,
        "steps": trace_steps,
        "total_duration_ms": total_duration,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await traces_collection.insert_one(trace_doc)

    # ── 4. AI evaluation ─────────────────────────────────────────────
    eval_scores = await evaluate_agent(task["description"], agent_output)

    metrics = EvaluationMetrics(
        correctness=eval_scores["correctness"],
        relevance=eval_scores["relevance"],
        completeness=eval_scores["completeness"],
        consistency=eval_scores["consistency"],
        hallucination_risk=eval_scores["hallucination_risk"],
    )

    # ── 5. Deterministic reliability score ────────────────────────────
    reliability_score = calculate_reliability_score(
        correctness=metrics.correctness,
        relevance=metrics.relevance,
        completeness=metrics.completeness,
        consistency=metrics.consistency,
        hallucination_risk=metrics.hallucination_risk,
    )

    # ── 6. Risk level ─────────────────────────────────────────────────
    risk_level = classify_risk(reliability_score)

    # ── 7. Persist evaluation ─────────────────────────────────────────
    eval_doc = {
        "task_id": task_id,
        "output": agent_output,
        "reliability_score": reliability_score,
        "risk_level": risk_level,
        "failures": eval_scores.get("failures", []),
        "recommendations": eval_scores.get("recommendations", []),
        "metrics": metrics.model_dump(),
        "trace": trace_steps,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await evaluations_collection.insert_one(eval_doc)

    # ── 8. Return to frontend ─────────────────────────────────────────
    return EvaluationResult(
        evaluation_id=str(result.inserted_id),
        task_id=task_id,
        output=agent_output,
        reliability_score=reliability_score,
        risk_level=risk_level,
        failures=eval_scores.get("failures", []),
        recommendations=eval_scores.get("recommendations", []),
        metrics=metrics,
        trace=trace_steps,
    )
