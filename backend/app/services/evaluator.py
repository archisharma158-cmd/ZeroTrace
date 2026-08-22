import json
import logging
from typing import Any, Dict, List

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from app.config import GEMINI_API_KEY, GEMINI_MODEL
from app.services.scenario_generator import robust_json_parse

logger = logging.getLogger(__name__)

class GeminiEvaluationSchema(BaseModel):
    correctness: int = Field(description="Score from 0 to 100")
    relevance: int = Field(description="Score from 0 to 100")
    completeness: int = Field(description="Score from 0 to 100")
    consistency: int = Field(description="Score from 0 to 100")
    hallucination_risk: int = Field(description="Score from 0 to 100")
    failures: List[str] = Field(description="Specific issues found")
    recommendations: List[str] = Field(description="Actionable improvement suggestions")

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
    "is_fallback": True,
}

_gemini_client = None
_available_gemini_models = None

def _get_gemini_client() -> genai.Client:
    """Lazily load genai Client to prevent startup errors if key is missing."""
    global _gemini_client
    if _gemini_client is None:
        if not GEMINI_API_KEY or not GEMINI_API_KEY.strip():
            raise ValueError("GEMINI_API_KEY is not configured or is empty.")
        _gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    return _gemini_client

_DEFAULT_GEMINI_MODELS = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]

def _get_available_gemini_models() -> List[str]:
    """Return cached available Gemini model names without blocking evaluation."""
    global _available_gemini_models
    if _available_gemini_models is not None:
        return _available_gemini_models

    _available_gemini_models = list(_DEFAULT_GEMINI_MODELS)
    return _available_gemini_models

async def prewarm_gemini_models():
    """Optional safe background prewarming of Gemini client and model list."""
    global _available_gemini_models
    if not GEMINI_API_KEY or not GEMINI_API_KEY.strip():
        return
    try:
        client = _get_gemini_client()
        discovered = []
        for m in client.models.list():
            name = m.name
            if name.startswith("models/"):
                name = name[len("models/"):]
            discovered.append(name)
        if discovered:
            _available_gemini_models = discovered
    except Exception as e:
        logger.debug("Background Gemini prewarm skipped: %s", type(e).__name__)

def _extract_response_text(response: Any) -> str:
    """Extract text from the response object safely."""
    if hasattr(response, 'text') and response.text:
        return response.text
    try:
        if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
            part = response.candidates[0].content.parts[0]
            if hasattr(part, 'text') and part.text:
                return part.text
    except Exception:
        pass
    return ""

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
            "is_fallback": False,
        }

    prompt = (
        f"TASK:\n{task_description}\n\n"
        f"AGENT OUTPUT:\n{agent_output}"
    )

    # 1. Build list of models to try
    models_to_try = []
    env_model = GEMINI_MODEL
    if env_model:
        if env_model.startswith("models/"):
            env_model = env_model[len("models/"):]
        models_to_try.append(env_model)

    available_models = _get_available_gemini_models()
    fallbacks = ["gemini-3.7-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.6-flash"]
    for f in fallbacks:
        if f in available_models and f not in models_to_try:
            models_to_try.append(f)

    for m in available_models:
        if m.startswith("gemini-") and m not in models_to_try:
            if "embedding" not in m and "tts" not in m and "image" not in m and "robotics" not in m and "audio" not in m:
                models_to_try.append(m)

    if not models_to_try:
        models_to_try = ["gemini-3.7-flash", "gemini-3.5-flash", "gemini-flash-latest"]

    # 2. Iterate models sequentially
    last_error = None
    for model_name in models_to_try:
        try:
            client = _get_gemini_client()
            response = await client.aio.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=_EVALUATOR_PROMPT,
                    temperature=0.0,
                    response_mime_type="application/json",
                    response_schema=GeminiEvaluationSchema
                )
            )
            raw = _extract_response_text(response)
            if not raw:
                raise ValueError(f"Empty content response text from model {model_name}.")

            result = _parse_evaluation(raw)
            result["is_fallback"] = False
            return result
        except Exception as e:
            last_error = e
            logger.warning(
                "Gemini evaluation failed on model '%s': %s (HTTP/status-like code if applicable: %s)",
                model_name,
                type(e).__name__,
                getattr(e, 'code', 'N/A')
            )

    logger.error("All Gemini evaluation models failed. Last error: %s", repr(last_error))
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