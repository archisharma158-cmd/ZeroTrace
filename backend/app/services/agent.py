import time
from typing import Any, Dict, List

from openai import AsyncOpenAI

from app.config import GROQ_API_KEY, GROQ_MODEL
from app.models.trace import TraceStep


_groq_client = AsyncOpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)


async def run_trasey(task_description: str) -> Dict[str, Any]:
    """
    Run Trasey using Groq and return:
      - output
      - steps
      - duration_ms
    """

    steps: List[TraceStep] = []
    overall_start = time.perf_counter()

    # Step 1: Planning
    plan_start = time.perf_counter()

    steps.append(
        TraceStep(
            step=1,
            action="planning",
            input=task_description,
            output="Analysing task and preparing execution plan.",
            status="success",
            duration_ms=_elapsed_ms(plan_start),
        )
    )

    # Step 2: Groq execution
    reason_start = time.perf_counter()

    try:
        response = await _groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Trasey, the AI reliability agent inside ZeroTrace. "
                        "Complete the user's task accurately and clearly. "
                        "Do not expose private chain-of-thought. "
                        "Return only the useful final response."
                    ),
                },
                {
                    "role": "user",
                    "content": task_description,
                },
            ],
            temperature=0.3,
            max_tokens=2048,
        )

        agent_output = response.choices[0].message.content or ""

        completion_tokens = None

        if response.usage:
            completion_tokens = response.usage.completion_tokens

        steps.append(
            TraceStep(
                step=2,
                action="reasoning",
                input="Sending task to Groq model.",
                output=(
                    f"Groq response received "
                    f"({completion_tokens if completion_tokens is not None else '?'} tokens)."
                ),
                status="success",
                duration_ms=_elapsed_ms(reason_start),
            )
        )

    except Exception as exc:
        steps.append(
            TraceStep(
                step=2,
                action="reasoning",
                input="Sending task to Groq model.",
                output=f"Groq error: {type(exc).__name__}",
                status="error",
                duration_ms=_elapsed_ms(reason_start),
            )
        )

        return {
            "output": "",
            "steps": [step.model_dump() for step in steps],
            "duration_ms": _elapsed_ms(overall_start),
            "error": str(exc),
        }

    # Step 3: Final answer
    answer_start = time.perf_counter()

    steps.append(
        TraceStep(
            step=3,
            action="final_answer",
            input="Preparing final Trasey response.",
            output=(
                agent_output[:200] + "..."
                if len(agent_output) > 200
                else agent_output
            ),
            status="success",
            duration_ms=_elapsed_ms(answer_start),
        )
    )

    return {
        "output": agent_output,
        "steps": [step.model_dump() for step in steps],
        "duration_ms": _elapsed_ms(overall_start),
    }


def _elapsed_ms(start: float) -> float:
    return round((time.perf_counter() - start) * 1000, 2)