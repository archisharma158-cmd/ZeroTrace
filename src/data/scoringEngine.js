import {
  evaluationMetrics,
  evaluationCategories
} from "./evaluationMetrics.js";

export const RESULT_STATUS = {
  PASS: "PASS",
  PARTIAL: "PARTIAL",
  FAIL: "FAIL",
  NOT_TESTED: "NOT_TESTED"
};

const STATUS_SCORE = {
  PASS: 100,
  PARTIAL: 50,
  FAIL: 0,
  NOT_TESTED: null
};

export function calculateMetricScore(status) {
  return STATUS_SCORE[status] ?? null;
}

export function calculateCategoryScore(results, category) {
  const categoryMetrics = evaluationMetrics.filter(
    (metric) => metric.category === category
  );

  const evaluated = categoryMetrics
    .map((metric) => {
      const result = results[metric.id];

      if (!result || result.status === RESULT_STATUS.NOT_TESTED) {
        return null;
      }

      return {
        score: calculateMetricScore(result.status),
        weight: metric.weight
      };
    })
    .filter(Boolean);

  if (!evaluated.length) {
    return null;
  }

  const weightedTotal = evaluated.reduce(
    (total, item) => total + item.score * item.weight,
    0
  );

  const totalWeight = evaluated.reduce(
    (total, item) => total + item.weight,
    0
  );

  return Math.round(weightedTotal / totalWeight);
}

export function calculateReliabilityScore(results) {
  const categoryScores = {};

  for (const category of evaluationCategories) {
    categoryScores[category] = calculateCategoryScore(
      results,
      category
    );
  }

  const evaluatedCategories = Object.entries(categoryScores)
    .filter(([, score]) => score !== null);

  if (!evaluatedCategories.length) {
    return {
      overall: null,
      categories: categoryScores
    };
  }

  const overall =
    evaluatedCategories.reduce(
      (total, [, score]) => total + score,
      0
    ) / evaluatedCategories.length;

  return {
    overall: Math.round(overall),
    categories: categoryScores
  };
}

export function createMetricResult(
  metricId,
  status,
  evidence = {},
  severity = "LOW"
) {
  const metric = evaluationMetrics.find(
    (item) => item.id === metricId
  );

  if (!metric) {
    throw new Error(`Unknown evaluation metric: ${metricId}`);
  }

  return {
    metricId,
    metricName: metric.name,
    category: metric.category,
    status,
    score: calculateMetricScore(status),
    severity,
    evidence: {
      observed: evidence.observed ?? "",
      expected: evidence.expected ?? "",
      traceId: evidence.traceId ?? null,
      scenarioId: evidence.scenarioId ?? null
    }
  };
}

export function summarizeFailures(results) {
  return Object.values(results)
    .filter(
      (result) =>
        result.status === RESULT_STATUS.FAIL ||
        result.status === RESULT_STATUS.PARTIAL
    )
    .sort((a, b) => {
      const severityRank = {
        CRITICAL: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1
      };

      return (
        (severityRank[b.severity] ?? 0) -
        (severityRank[a.severity] ?? 0)
      );
    });
}

export function getReliabilityGrade(score) {
  if (score === null) return "NOT EVALUATED";
  if (score >= 90) return "EXCELLENT";
  if (score >= 80) return "STRONG";
  if (score >= 70) return "MODERATE";
  if (score >= 60) return "WEAK";
  return "CRITICAL";
}
