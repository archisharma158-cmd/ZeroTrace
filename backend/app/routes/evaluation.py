import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException

from app.database import (
    tasks_collection,
    traces_collection,
    evaluations_collection,
    full_evaluations_collection,
)
from app.models.evaluation import EvaluationMetrics, EvaluationResult, EvaluatorAgreement
from app.services.agent import run_trasey
from app.services.evaluator import evaluate_agent
from app.services.mistral_evaluator import evaluate_agent_mistral
from app.services.agreement import calculate_agreement
from app.services.scoring import calculate_reliability_score, classify_risk, aggregate_metrics
from app.services.scenario_generator import generate_scenarios

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Evaluation"])


@router.post("/evaluate/{task_id}", response_model=EvaluationResult)
async def evaluate_task(task_id: str):
    """
    Standard single-task evaluation pipeline:
    1. Validate task ID & fetch task.
    2. Run Trasey agent.
    3. Save execution trace.
    4. AI-evaluate (Gemini & Mistral in parallel).
    5. Calculate evaluator agreement.
    6. Compute aggregated metrics and deterministic reliability score.
    7. Classify risk level.
    8. Persist evaluation to MongoDB.
    9. Return frontend-friendly response.
    """
    # ── 1. Validate & fetch task ──────────────────────────────────────
    try:
        oid = ObjectId(task_id)
    except (InvalidId, Exception):
        raise HTTPException(status_code=400, detail="Invalid task ID format.")

    task = await tasks_collection.find_one({"_id": oid})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    provider_status = {
        "groq": "available",
        "gemini": "available",
        "mistral": "available",
    }

    # ── 2. Run Trasey ─────────────────────────────────────────────────
    agent_result = await run_trasey(task["description"])

    if agent_result.get("error"):
        provider_status["groq"] = "unavailable"
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

    # ── 4. Parallel Evaluator Execution ──────────────────────────────
    gemini_task = evaluate_agent(task["description"], agent_output)
    mistral_task = evaluate_agent_mistral(task["description"], agent_output)

    gemini_scores, mistral_scores = await asyncio.gather(gemini_task, mistral_task)

    # Verify if Gemini failed (indicated by is_fallback)
    if gemini_scores.get("is_fallback"):
        provider_status["gemini"] = "unavailable"
    else:
        provider_status["gemini"] = "available"
        
    if mistral_scores is None or mistral_scores.get("is_fallback"):
        provider_status["mistral"] = "unavailable"
    else:
        provider_status["mistral"] = "available"

    # ── 5. Evaluator Agreement ──────────────────────────────────────
    agreement_data = None
    if provider_status["gemini"] == "available" and provider_status["mistral"] == "available":
        agreement_data = calculate_agreement(gemini_scores, mistral_scores)

    # ── 6. Deterministic Reliability Score ────────────────────────────
    # Only aggregate using Mistral if it was actually available
    if provider_status["gemini"] == "available" and provider_status["mistral"] == "available":
        aggregated_metrics = aggregate_metrics(gemini_scores, mistral_scores)
    elif provider_status["gemini"] == "available":
        aggregated_metrics = {k: v for k, v in gemini_scores.items() if k not in ["is_fallback", "failures", "recommendations"]}
    elif provider_status["mistral"] == "available":
        aggregated_metrics = {k: v for k, v in mistral_scores.items() if k not in ["is_fallback", "failures", "recommendations"]}
    else:
        aggregated_metrics = {k: v for k, v in gemini_scores.items() if k not in ["is_fallback", "failures", "recommendations"]}

    metrics = EvaluationMetrics(
        correctness=aggregated_metrics["correctness"],
        relevance=aggregated_metrics["relevance"],
        completeness=aggregated_metrics["completeness"],
        consistency=aggregated_metrics["consistency"],
        hallucination_risk=aggregated_metrics["hallucination_risk"],
    )

    reliability_score = calculate_reliability_score(
        correctness=metrics.correctness,
        relevance=metrics.relevance,
        completeness=metrics.completeness,
        consistency=metrics.consistency,
        hallucination_risk=metrics.hallucination_risk,
    )

    # ── 7. Risk level ─────────────────────────────────────────────────
    risk_level = classify_risk(reliability_score)

    # Combine failures and recommendations from both evaluators
    failures = list(gemini_scores.get("failures", []))
    recommendations = list(gemini_scores.get("recommendations", []))
    if mistral_scores and not mistral_scores.get("is_fallback"):
        failures.extend(mistral_scores.get("failures", []))
        recommendations.extend(mistral_scores.get("recommendations", []))

    evaluators_payload = {
        "gemini": gemini_scores,
        "mistral": mistral_scores if mistral_scores else {"status": "unavailable"}
    }

    # ── 8. Persist evaluation ─────────────────────────────────────────
    eval_doc = {
        "task_id": task_id,
        "output": agent_output,
        "reliability_score": reliability_score,
        "risk_level": risk_level,
        "failures": failures,
        "recommendations": recommendations,
        "metrics": metrics.model_dump(),
        "trace": trace_steps,
        "evaluators": evaluators_payload,
        "evaluator_agreement": agreement_data,
        "provider_status": provider_status,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await evaluations_collection.insert_one(eval_doc)

    evaluator_agreement_model = None
    if agreement_data:
        evaluator_agreement_model = EvaluatorAgreement(
            agreement_score=agreement_data["agreement_score"],
            agreement_level=agreement_data["agreement_level"],
            metric_differences=agreement_data["metric_differences"]
        )

    # ── 9. Return to frontend ─────────────────────────────────────────
    return EvaluationResult(
        evaluation_id=str(result.inserted_id),
        task_id=task_id,
        output=agent_output,
        reliability_score=reliability_score,
        risk_level=risk_level,
        failures=failures,
        recommendations=recommendations,
        metrics=metrics,
        trace=trace_steps,
        evaluators=evaluators_payload,
        evaluator_agreement=evaluator_agreement_model,
        scenarios=None,
        scenario_source=None,
        provider_status=provider_status,
        scenario_results=None
    )


@router.get("/evaluate/{task_id}/full", response_model=EvaluationResult)
async def get_task_full_evaluation(task_id: str):
    """Retrieve an existing computed full evaluation for a task."""
    try:
        oid = ObjectId(task_id)
    except (InvalidId, Exception):
        raise HTTPException(status_code=400, detail="Invalid task ID format.")

    # 1. Check full_evaluations collection
    existing_doc = await full_evaluations_collection.find_one({"task_id": task_id})
    if not existing_doc:
        # Fallback to standard evaluations
        existing_doc = await evaluations_collection.find_one({"task_id": task_id})
        if not existing_doc:
            raise HTTPException(status_code=404, detail="Evaluation not found for this task.")

    agreement_obj = None
    if existing_doc.get("evaluator_agreement"):
        agreement_obj = EvaluatorAgreement(
            agreement_score=existing_doc["evaluator_agreement"].get("agreement_score", 0),
            agreement_level=existing_doc["evaluator_agreement"].get("agreement_level", "MODERATE"),
            metric_differences=existing_doc["evaluator_agreement"].get("metric_differences", {})
        )

    metrics_data = existing_doc.get("metrics", {})
    metrics_obj = EvaluationMetrics(
        correctness=metrics_data.get("correctness", 0),
        relevance=metrics_data.get("relevance", 0),
        completeness=metrics_data.get("completeness", 0),
        consistency=metrics_data.get("consistency", 0),
        hallucination_risk=metrics_data.get("hallucination_risk", 0),
    )

    return EvaluationResult(
        evaluation_id=str(existing_doc["_id"]),
        task_id=task_id,
        output=existing_doc.get("output", ""),
        reliability_score=existing_doc.get("reliability_score", 0.0),
        risk_level=existing_doc.get("risk_level", "MEDIUM"),
        failures=existing_doc.get("failures", []),
        recommendations=existing_doc.get("recommendations", []),
        metrics=metrics_obj,
        trace=existing_doc.get("trace", []),
        evaluators=existing_doc.get("evaluators", {
            "gemini": {"status": "aggregated"},
            "mistral": {"status": "aggregated"}
        }),
        evaluator_agreement=agreement_obj,
        scenarios=existing_doc.get("scenarios"),
        scenario_source=existing_doc.get("scenario_source"),
        provider_status=existing_doc.get("provider_status"),
        scenario_results=existing_doc.get("scenario_results")
    )


@router.post("/evaluate/{task_id}/full", response_model=EvaluationResult)
async def evaluate_task_full(task_id: str):
    """
    Scenario-based comprehensive evaluation pipeline:
    1. Generate scenarios (attempts NVIDIA NIM, falls back locally).
    2. Sequentially evaluate each scenario (to avoid free-tier rate limits).
    3. Aggregate overall reliability scores, evaluator agreement, and metrics.
    4. Save to MongoDB 'full_evaluations' collection.
    """
    try:
        oid = ObjectId(task_id)
    except (InvalidId, Exception):
        raise HTTPException(status_code=400, detail="Invalid task ID format.")

    task = await tasks_collection.find_one({"_id": oid})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    # ── 0. Return existing evaluation if already computed ─────────────
    existing_doc = await full_evaluations_collection.find_one({"task_id": task_id})
    if existing_doc:
        agreement_obj = None
        if existing_doc.get("evaluator_agreement"):
            agreement_obj = EvaluatorAgreement(
                agreement_score=existing_doc["evaluator_agreement"]["agreement_score"],
                agreement_level=existing_doc["evaluator_agreement"]["agreement_level"],
                metric_differences=existing_doc["evaluator_agreement"].get("metric_differences", {})
            )
        return EvaluationResult(
            evaluation_id=str(existing_doc["_id"]),
            task_id=task_id,
            output=existing_doc.get("output", ""),
            reliability_score=existing_doc.get("reliability_score", 0.0),
            risk_level=existing_doc.get("risk_level", "MEDIUM"),
            failures=existing_doc.get("failures", []),
            recommendations=existing_doc.get("recommendations", []),
            metrics=EvaluationMetrics(**existing_doc.get("metrics", {})),
            trace=existing_doc.get("trace", []),
            evaluators=existing_doc.get("evaluators", {
                "gemini": {"status": "aggregated"},
                "mistral": {"status": "aggregated"}
            }),
            evaluator_agreement=agreement_obj,
            scenarios=existing_doc.get("scenarios"),
            scenario_source=existing_doc.get("scenario_source"),
            provider_status=existing_doc.get("provider_status"),
            scenario_results=existing_doc.get("scenario_results")
        )

    # ── 1. Scenario Generation ────────────────────────────────────────
    start_gen = time.time()
    scenarios, source = await generate_scenarios(task["description"])
    gen_time = time.time() - start_gen
    logger.info(f"Scenario generation completed in {gen_time:.2f}s (Source: {source})")
    
    # ── 2. Concurrent Scenario Evaluation (Bounded) ──────────────────
    MAX_CONCURRENT_SCENARIOS = 3
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_SCENARIOS)
    scenario_evals = [None] * len(scenarios)
    
    async def process_scenario(idx: int, scenario: dict):
        scenario_start = time.time()
        scenario_prompt = scenario["prompt"]
        scenario_type = scenario["type"]
        scenario_title = scenario["title"]
        expected_behavior = scenario["expected_behavior"]

        # Run Trasey against the scenario prompt
        t_start = time.time()
        agent_result = await run_trasey(scenario_prompt)
        t_time = time.time() - t_start
        logger.info(f"Scenario {idx+1} Trasey execution completed in {t_time:.2f}s")

        if agent_result.get("error"):
            scenario_evals[idx] = {
                "scenario_id": scenario["id"],
                "type": scenario_type,
                "title": scenario_title,
                "status": "failed",
                "error": agent_result["error"],
                "metrics": {
                    "correctness": 0, "relevance": 0, "completeness": 0,
                    "consistency": 0, "hallucination_risk": 100
                },
                "reliability_score": 0.0,
                "trace": agent_result.get("steps", []),
                "gemini_ok": False,
                "mistral_ok": False
            }
            return

        out = agent_result["output"]
        steps = agent_result["steps"]

        # Evaluate Trasey's output
        eval_start = time.time()
        gemini_task = evaluate_agent(scenario_prompt, out)
        mistral_task = evaluate_agent_mistral(scenario_prompt, out)
        gemini_scores, mistral_scores = await asyncio.gather(gemini_task, mistral_task)
        eval_time = time.time() - eval_start
        logger.info(f"Scenario {idx+1} Gemini + Mistral evaluation completed in {eval_time:.2f}s")

        gemini_ok = not gemini_scores.get("is_fallback")
        mistral_ok = mistral_scores is not None and not mistral_scores.get("is_fallback")

        # Evaluator Agreement
        agreement_data = None
        if gemini_ok and mistral_ok:
            agreement_data = calculate_agreement(gemini_scores, mistral_scores)

        # Aggregate Metrics:
        if gemini_ok and mistral_ok:
            scen_metrics = aggregate_metrics(gemini_scores, mistral_scores)
        elif gemini_ok:
            scen_metrics = {k: v for k, v in gemini_scores.items() if k not in ["is_fallback", "failures", "recommendations"]}
        elif mistral_ok:
            scen_metrics = {k: v for k, v in mistral_scores.items() if k not in ["is_fallback", "failures", "recommendations"]}
        else:
            scen_metrics = {k: v for k, v in gemini_scores.items() if k not in ["is_fallback", "failures", "recommendations"]}

        scen_reliability = calculate_reliability_score(
            correctness=scen_metrics["correctness"],
            relevance=scen_metrics["relevance"],
            completeness=scen_metrics["completeness"],
            consistency=scen_metrics["consistency"],
            hallucination_risk=scen_metrics["hallucination_risk"],
        )

        failures = list(gemini_scores.get("failures", []))
        recommendations = list(gemini_scores.get("recommendations", []))
        if mistral_ok and mistral_scores:
            failures.extend(mistral_scores.get("failures", []))
            recommendations.extend(mistral_scores.get("recommendations", []))

        scenario_evals[idx] = {
            "scenario_id": scenario["id"],
            "type": scenario_type,
            "title": scenario_title,
            "prompt": scenario_prompt,
            "expected_behavior": expected_behavior,
            "status": "success",
            "output": out,
            "reliability_score": scen_reliability,
            "risk_level": classify_risk(scen_reliability),
            "metrics": scen_metrics,
            "evaluators": {
                "gemini": gemini_scores,
                "mistral": mistral_scores if mistral_scores else {"status": "unavailable", "is_fallback": True}
            },
            "evaluator_agreement": agreement_data,
            "failures": failures,
            "recommendations": recommendations,
            "trace": steps,
            "gemini_ok": gemini_ok,
            "mistral_ok": mistral_ok
        }
        
        scenario_time = time.time() - scenario_start
        logger.info(f"Scenario {idx+1} completed in {scenario_time:.2f}s")

    async def bounded_process(idx: int, scenario: dict):
        async with semaphore:
            try:
                await process_scenario(idx, scenario)
            except Exception as e:
                logger.error(f"Scenario {idx+1} failed with unhandled exception: {e}")
                scenario_evals[idx] = {
                    "scenario_id": scenario.get("id", "unknown"),
                    "type": scenario.get("type", "unknown"),
                    "title": scenario.get("title", "unknown"),
                    "status": "failed",
                    "error": str(e),
                    "metrics": {
                        "correctness": 0, "relevance": 0, "completeness": 0,
                        "consistency": 0, "hallucination_risk": 100
                    },
                    "reliability_score": 0.0,
                    "trace": [],
                    "gemini_ok": False,
                    "mistral_ok": False
                }

    full_start = time.time()
    
    tasks_to_run = [bounded_process(i, s) for i, s in enumerate(scenarios)]
    await asyncio.gather(*tasks_to_run)
    
    full_time = time.time() - full_start
    logger.info(f"Full evaluation completed in {full_time + gen_time:.2f}s")

    gemini_succeeded_at_least_once = any(e.get("gemini_ok", False) for e in scenario_evals if e)
    mistral_succeeded_at_least_once = any(e.get("mistral_ok", False) for e in scenario_evals if e)
    
    # Remove temporary tracking keys
    for e in scenario_evals:
        if e:
            e.pop("gemini_ok", None)
            e.pop("mistral_ok", None)

    # ── 3. Aggregate Results (Pure Local Deterministic Scoring) ───────
    t_agg_start = time.perf_counter()
    successful_evals = [e for e in scenario_evals if e["status"] == "success"]
    if not successful_evals:
        raise HTTPException(
            status_code=502,
            detail="All scenario executions failed during agent run."
        )

    provider_status = {
        "groq": "available" if len(successful_evals) > 0 else "unavailable",
        "gemini": "available" if gemini_succeeded_at_least_once else "unavailable",
        "mistral": "available" if mistral_succeeded_at_least_once else "unavailable",
        "nvidia": "available" if source == "nvidia" else "fallback"
    }

    # Average metrics
    aggregated_metrics = {}
    for key in ["correctness", "relevance", "completeness", "consistency", "hallucination_risk"]:
        avg_val = sum(e["metrics"][key] for e in successful_evals) / len(successful_evals)
        aggregated_metrics[key] = int(round(avg_val))

    metrics = EvaluationMetrics(
        correctness=aggregated_metrics["correctness"],
        relevance=aggregated_metrics["relevance"],
        completeness=aggregated_metrics["completeness"],
        consistency=aggregated_metrics["consistency"],
        hallucination_risk=aggregated_metrics["hallucination_risk"],
    )

    reliability_score = calculate_reliability_score(
        correctness=metrics.correctness,
        relevance=metrics.relevance,
        completeness=metrics.completeness,
        consistency=metrics.consistency,
        hallucination_risk=metrics.hallucination_risk,
    )
    risk_level = classify_risk(reliability_score)

    # Consolidate unique failures and recommendations
    failures_set = set()
    recommendations_set = set()
    all_steps = []
    
    for e in scenario_evals:
        for f in e.get("failures", []):
            failures_set.add(f)
        for r in e.get("recommendations", []):
            recommendations_set.add(r)
        
        # Add summary step for trace response
        all_steps.append({
            "step": len(all_steps) + 1,
            "action": "scenario_execution",
            "input": f"Running scenario {e['scenario_id']} ({e['type']})",
            "output": f"Reliability: {e['reliability_score']} ({e['status']})",
            "status": e["status"],
            "duration_ms": 0.0
        })

    # Average agreement score
    agreements = [e["evaluator_agreement"]["agreement_score"] for e in successful_evals if e["evaluator_agreement"]]
    if agreements:
        avg_agreement_score = round(sum(agreements) / len(agreements), 1)
        evaluator_agreement_payload = {
            "agreement_score": avg_agreement_score,
            "agreement_level": "VERY_HIGH" if avg_agreement_score >= 90 else ("HIGH" if avg_agreement_score >= 75 else ("MODERATE" if avg_agreement_score >= 50 else "LOW")),
            "metric_differences": {}
        }
        evaluator_agreement_model = EvaluatorAgreement(
            agreement_score=evaluator_agreement_payload["agreement_score"],
            agreement_level=evaluator_agreement_payload["agreement_level"],
            metric_differences={}
        )
    else:
        evaluator_agreement_payload = None
        evaluator_agreement_model = None

    consolidated_output = (
        f"Scenario-based evaluation completed successfully. "
        f"Evaluated {len(successful_evals)} scenarios."
    )

    t_agg_total = (time.perf_counter() - t_agg_start) * 1000
    logger.info(f"PERF RELIABILITY: Local aggregation completed in {t_agg_total:.3f}ms (Score: {reliability_score}, Risk: {risk_level})")

    # ── 4. Save Results to MongoDB ─────────────────────────────────────
    doc = {
        "task_id": task_id,
        "reliability_score": reliability_score,
        "risk_level": risk_level,
        "metrics": metrics.model_dump(),
        "failures": list(failures_set),
        "recommendations": list(recommendations_set),
        "scenarios": scenarios,
        "scenario_source": source,
        "provider_status": provider_status,
        "scenario_results": scenario_evals,
        "trace": all_steps,
        "output": consolidated_output,
        "evaluator_agreement": evaluator_agreement_payload,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    
    result = await full_evaluations_collection.insert_one(doc)

    return EvaluationResult(
        evaluation_id=str(result.inserted_id),
        task_id=task_id,
        output=consolidated_output,
        reliability_score=reliability_score,
        risk_level=risk_level,
        failures=list(failures_set),
        recommendations=list(recommendations_set),
        metrics=metrics,
        trace=all_steps,
        evaluators={
            "gemini": {"status": "aggregated"},
            "mistral": {"status": "aggregated"}
        },
        evaluator_agreement=evaluator_agreement_model,
        scenarios=scenarios,
        scenario_source=source,
        provider_status=provider_status,
        scenario_results=scenario_evals
    )
