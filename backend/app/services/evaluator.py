import json
import logging
from typing import Any, Dict

from google import genai
from google.genai import types

from app.config import GEMINI_API_KEY, GEMINI_MODEL
from app.services.scenario_generator import robust_json_parse

logger = logging.getLogger(__name__)

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

_gemini_client = None

def _get_gemini_client() -> genai.Client:
    """Lazily load genai Client to prevent startup errors if key is missing."""
    global _gemini_client
    if _gemini_client is None:
        if not GEMINI_API_KEY or not GEMINI_API_KEY.strip():
            raise ValueError("GEMINI_API_KEY is not configured or is empty.")
        _gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    return _gemini_client


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

    try:
        client = _get_gemini_client()
        response = await client.aio.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.0,
                response_mime_type="application/json"
            )
        )
        raw = response.text
        if not raw:
            raise ValueError("Empty content response text from Gemini.")
            
        return _parse_evaluation(raw)

    except Exception as e:
        logger.error("Gemini evaluation failed safely: %s", repr(e))
        return dict(_DEFAULT_EVALUATION)



def _parse_evaluation(raw: str) -> Dict[str, Any]:
    try:
        data = robust_json_parse(raw)
    except Exception as e:
        logger.error("Malformed JSON returned by Gemini. Error: %s", e)
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