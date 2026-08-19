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
    """Check if Mistral API key and model are properly configured."""
    return bool(MISTRAL_API_KEY and MISTRAL_API_KEY.strip() and MISTRAL_MODEL and MISTRAL_MODEL.strip())

async def evaluate_agent_mistral(
    task_description: str,
    agent_output: str,
) -> Optional[Dict[str, Any]]:
    """
    Use Mistral to evaluate Trasey's output.
    Returns the evaluation dictionary if successful, or None if it fails.
    """
    if not is_mistral_configured():
        logger.warning("Mistral is not configured. Skipping Mistral evaluation.")
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
    payload = {
        "model": MISTRAL_MODEL,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.0,
        # Standard chat completion without forcing specific JSON formatting features
    }

    try:
        async with httpx.AsyncClient(timeout=35.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            choices = data.get("choices", [])
            if not choices:
                logger.error("Mistral API returned empty choices list.")
                return None
                
            raw_content = choices[0].get("message", {}).get("content")
            if not raw_content:
                logger.error("Mistral API returned empty content.")
                return None
                
            return _parse_mistral_evaluation(raw_content)

    except Exception as e:
        logger.error("Mistral evaluation API call failed safely: %s", type(e).__name__)
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
            # Enforce 0-100 bounding
            result[key] = max(0, min(100, int(value)))
        else:
            logger.warning(f"Mistral output missing or invalid score key '{key}': {value}. Defaulting to 50.")
            result[key] = 50

    failures = data.get("failures", [])
    recommendations = data.get("recommendations", [])

    result["failures"] = failures if isinstance(failures, list) else []
    result["recommendations"] = recommendations if isinstance(recommendations, list) else []

    return result
