import logging
from typing import Any, Dict, Optional
import httpx

from app.config import MISTRAL_API_KEY, MISTRAL_MODEL
from app.services.scenario_generator import robust_json_parse

logger = logging.getLogger(__name__)

_EVALUATOR_PROMPT = """You are a strict secondary AI evaluator for an AI agent reliability engine called ZeroTrace.

Given a TASK and the AGENT OUTPUT, evaluate the output on these five dimensions, each scored from 0 to 100:

1. correctness: accuracy and correctness compared to the task description.
2. relevance: how direct and relevant the output is to the task.
3. completeness: whether all required aspects of the task are satisfied.
4. consistency: logical flow and formatting consistency.
5. hallucination_risk: probability/presence of untruthful or fabricated claims (0 means no hallucination risk, 100 means high risk).

Also return:
- failures: list of specific issues found.
- recommendations: list of actionable improvement suggestions.

Return ONLY valid JSON in exactly this structure:
{
  "correctness": 90,
  "relevance": 95,
  "completeness": 85,
  "consistency": 92,
  "hallucination_risk": 10,
  "failures": [],
  "recommendations": []
}
"""

def is_mistral_configured() -> bool:
    """Check if Mistral API key is properly configured."""
    return bool(MISTRAL_API_KEY and MISTRAL_API_KEY.strip())

_available_mistral_models = None

async def _get_available_mistral_models() -> list:
    """Lazily query and cache available Mistral models using the configured API key."""
    global _available_mistral_models
    if _available_mistral_models is not None:
        return _available_mistral_models

    if not MISTRAL_API_KEY or not MISTRAL_API_KEY.strip():
        _available_mistral_models = []
        return _available_mistral_models

    _available_mistral_models = []
    url = "https://api.mistral.ai/v1/models"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                _available_mistral_models = [m["id"] for m in data.get("data", [])]
            else:
                logger.warning("Mistral models listing returned status %s: %s", response.status_code, response.text[:200])
    except Exception as e:
        logger.warning("Failed to query Mistral models dynamically: %s", type(e).__name__)

    return _available_mistral_models

async def evaluate_agent_mistral(
    task_description: str,
    agent_output: str,
) -> Optional[Dict[str, Any]]:
    """
    Use Mistral to evaluate Trasey's output.
    Returns the evaluation dictionary if successful, or None if it fails.
    """
    if not is_mistral_configured():
        logger.warning("Mistral API key is not configured. Skipping Mistral evaluation.")
        return None

    if not agent_output or not agent_output.strip():
        return {
            "correctness": 0,
            "relevance": 0,
            "completeness": 0,
            "consistency": 0,
            "hallucination_risk": 100,
            "failures": ["Agent produced empty output."],
            "recommendations": ["Investigate why the agent returned no content."],
            "is_fallback": False,
        }

    prompt = (
        f"{_EVALUATOR_PROMPT}\n\n"
        f"TASK:\n{task_description}\n\n"
        f"AGENT OUTPUT:\n{agent_output}"
    )

    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json",
    }

    # 1. Build list of models to try
    models_to_try = []
    env_model = MISTRAL_MODEL
    if env_model:
        models_to_try.append(env_model)

    available = await _get_available_mistral_models()
    fallbacks = ["mistral-large-latest", "mistral-small-latest", "ministral-8b-latest", "codestral-latest"]
    for f in fallbacks:
        if f in available and f not in models_to_try:
            models_to_try.append(f)

    for m in available:
        if m not in models_to_try and (m.startswith("mistral-") or m.startswith("ministral-") or m.startswith("codestral-")):
            if "embed" not in m and "moderation" not in m and "ocr" not in m:
                models_to_try.append(m)

    if not models_to_try and available:
        generative_available = [m for m in available if "embed" not in m]
        if generative_available:
            models_to_try.append(generative_available[0])

    if not models_to_try:
        models_to_try = ["mistral-large-latest"]

    # 2. Iterate models sequentially
    last_error = None
    for model_name in models_to_try:
        if available and model_name not in available:
            continue

        payload = {
            "model": model_name,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.0,
        }

        try:
            async with httpx.AsyncClient(timeout=35.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()

                choices = data.get("choices", [])
                if not choices:
                    raise ValueError(f"Mistral API returned empty choices for model {model_name}.")

                raw_content = choices[0].get("message", {}).get("content")
                if not raw_content:
                    raise ValueError(f"Mistral API returned empty content for model {model_name}.")

                parsed_res = _parse_mistral_evaluation(raw_content)
                if parsed_res is not None:
                    parsed_res["is_fallback"] = False
                    return parsed_res
        except Exception as e:
            last_error = e
            logger.warning(
                "Mistral evaluation failed on model '%s': %s (HTTP/status-like code if applicable: %s)",
                model_name,
                type(e).__name__,
                getattr(getattr(e, 'response', None), 'status_code', 'N/A')
            )

    logger.warning("All Mistral evaluation models failed or returned malformed content. Last error: %s", repr(last_error))
    return None

def _parse_mistral_evaluation(raw: str) -> Optional[Dict[str, Any]]:
    """Parse and clean JSON from Mistral output using robust JSON parsing."""
    try:
        data = robust_json_parse(raw)
    except Exception as e:
        logger.error(f"Malformed JSON returned by Mistral. Error: {e}")
        return None

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
            result[key] = max(0, min(100, int(value)))
        else:
            logger.warning(f"Mistral output missing or invalid score key '{key}': {value}. Defaulting to 50.")
            result[key] = 50

    failures = data.get("failures", [])
    recommendations = data.get("recommendations", [])

    result["failures"] = failures if isinstance(failures, list) else []
    result["recommendations"] = recommendations if isinstance(recommendations, list) else []

    return result

