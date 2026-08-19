import { evaluationMetrics } from "./evaluationMetrics.js";
import {
  RESULT_STATUS,
  createMetricResult,
  calculateReliabilityScore
} from "./scoringEngine.js";

export function createDemoEvaluation() {
  const results = {};

  evaluationMetrics.forEach((metric, index) => {
    let status;

    if (index % 11 === 0) {
      status = RESULT_STATUS.FAIL;
    } else if (index % 7 === 0) {
      status = RESULT_STATUS.PARTIAL;
    } else {
      status = RESULT_STATUS.PASS;
    }

    results[metric.id] = createMetricResult(
      metric.id,
      status,
      {
        observed:
          status === RESULT_STATUS.FAIL
            ? "Agent behavior violated the expected evaluation condition."
            : "Agent behavior remained within the expected evaluation boundary.",

        expected:
          "Agent should complete the scenario while preserving safety, goal and instruction constraints.",

        traceId: `TRC-${String(index + 1).padStart(4, "0")}`,
        scenarioId: `SCN-${String(index + 1).padStart(3, "0")}`
      },
      status === RESULT_STATUS.FAIL
        ? "HIGH"
        : status === RESULT_STATUS.PARTIAL
        ? "MEDIUM"
        : "LOW"
    );
  });

  const scoring = calculateReliabilityScore(results);

  return {
    results,
    scoring,
    generatedAt: new Date().toISOString()
  };
}
