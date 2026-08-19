import json
from typing import Any, Dict

import httpx

from app.config import GEMINI_API_KEY, GEMINI_MODEL


_EVALUATOR_PROMPT = """You are a strict AI evaluator for an AI agent reliability engine called ZeroTrace.

Given a TASK and the AGENT OUTPUT, evaluate the output on these five dimensions, each scored from 0 to 100:

1. correctness
2. relevance
3. completeness
4. consistency
5. hallucination_risk

For hallucination_risk:
0 means no apparent hallucination risk.
100 means extremely high hallucination risk.

Also return:
- failures: specific issues found
- recommendations: actionable improvement suggestions

Return ONLY valid JSON in exactly this structure:

{
  "correctness": 0,
  "relevance": 0,
  "completeness": 0,
  "consistency": 0,
  "hallucination_risk": 0,
  "failures": [],
  "recommendations": []
}
"""


_DEFAULT_EVALUATION: Dict[str, Any] = {
    "correctness": 50,
    "relevance": 50,
    "completeness": 50,
    "consistency": 50,
    "hallucination_risk": 50,
    "failures": ["Gemini evaluator failed; default scores were applied."],
    "recommendations": ["Re-run the evaluation."],
}


async def evaluate_agent(
    task_description: str,
    agent_output: str,
) -> Dict[str, Any]:

    if not agent_output or not agent_output.strip():
        return {
            "correctness": 0,
            "relevance": 0,
            "completeness": 0,
            "consistency": 0,
            "hallucination_risk": 100,
            "failures": ["Agent produced empty output."],
            "recommendations": [
                "Investigate why the agent returned no content."
            ],
        }

    prompt = (
        f"{_EVALUATOR_PROMPT}\n\n"
        f"TASK:\n{task_description}\n\n"
        f"AGENT OUTPUT:\n{agent_output}"
    )

    url = (
        "https://generativelanguage.googleapis.com/v1beta/"
        f"models/{GEMINI_MODEL}:generateContent"
    )

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0,
            "responseMimeType": "application/json"
        }
    }

    headers = {
        "x-goog-api-key": GEMINI_API_KEY,
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url,
                headers=headers,
                json=payload,
            )

        response.raise_for_status()

        data = response.json()

        raw = (
            data["candidates"][0]["content"]["parts"][0]["text"]
        )

        return _parse_evaluation(raw)

    except Exception:
        return dict(_DEFAULT_EVALUATION)


def _parse_evaluation(raw: str) -> Dict[str, Any]:

    cleaned = raw.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]

    if cleaned.endswith("```"):
        cleaned = cleaned.rsplit("```", 1)[0]

    cleaned = cleaned.strip()

    try:
        data = json.loads(cleaned)

    except json.JSONDecodeError:
        return dict(_DEFAULT_EVALUATION)

    result: Dict[str, Any] = {}

    score_keys = (
        "correctness",
        "relevance",
        "completeness",
        "consistency",
        "hallucination_risk",
    )

    for key in score_keys:
        value = data.get(key)

        if isinstance(value, (int, float)):
            result[key] = max(
                0,
                min(100, int(value))
            )
        else:
            result[key] = 50

    failures = data.get("failures", [])

    recommendations = data.get(
        "recommendations",
        []
    )

    result["failures"] = (
        failures
        if isinstance(failures, list)
        else []
    )

    result["recommendations"] = (
        recommendations
        if isinstance(recommendations, list)
        else []
    )

    return result