from typing import Any, Dict, Optional

def calculate_agreement(
    gemini_metrics: Optional[Dict[str, int]],
    mistral_metrics: Optional[Dict[str, int]],
) -> Optional[Dict[str, Any]]:
    """
    Compare Gemini and Mistral evaluation scores and compute agreement.
    Returns:
        A dictionary containing agreement_score, agreement_level, and metric_differences,
        or None if one of the evaluations is missing.
    """
    if not gemini_metrics or not mistral_metrics:
        return None

    metrics_to_compare = [
        "correctness",
        "relevance",
        "completeness",
        "consistency",
        "hallucination_risk",
    ]

    # Verify that all required metrics exist in both dictionaries
    for metric in metrics_to_compare:
        if metric not in gemini_metrics or metric not in mistral_metrics:
            return None

    differences: Dict[str, int] = {}
    for metric in metrics_to_compare:
        differences[metric] = abs(gemini_metrics[metric] - mistral_metrics[metric])

    avg_difference = sum(differences.values()) / len(metrics_to_compare)
    agreement_score = round(100.0 - avg_difference, 1)

    # Determine agreement level based on thresholds
    if agreement_score >= 90.0:
        agreement_level = "VERY_HIGH"
    elif agreement_score >= 75.0:
        agreement_level = "HIGH"
    elif agreement_score >= 50.0:
        agreement_level = "MODERATE"
    else:
        agreement_level = "LOW"

    return {
        "agreement_score": agreement_score,
        "agreement_level": agreement_level,
        "metric_differences": differences,
    }
