/**
 * Utility functions for validating and deduplicating completed evaluation records.
 */

export function isValidCompletedEvaluation(item) {
  if (!item || typeof item !== "object") return false;

  // Exclude authentication/session records incorrectly stored in history
  if (item.type === "LOGIN" || (item.id && String(item.id).startsWith("LOGIN-"))) {
    return false;
  }

  // Validate Score: Must be a finite number between 0 and 100
  if (item.score === null || item.score === undefined || item.score === "" || item.score === "--") {
    return false;
  }
  const numericScore = Number(item.score);
  if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
    return false;
  }

  // Validate Status if status field exists
  if (item.status) {
    const statusStr = String(item.status).toUpperCase();
    const invalidStatuses = ["INITIALIZING", "PENDING", "RUNNING", "FAILED", "CANCELLED", "INCOMPLETE"];
    if (invalidStatuses.includes(statusStr)) {
      return false;
    }
  }

  // Validate Agent Name: Must exist and have non-whitespace content
  const agentName = item.agent || item.agentName || item.name;
  if (!agentName || typeof agentName !== "string" || !agentName.trim()) {
    return false;
  }

  return true;
}

/**
 * Filter a list of raw history items down to valid completed evaluations,
 * deduplicating by stable evaluation_id / task_id / id while preserving
 * multiple distinct runs of the same agent.
 */
export function getValidCompletedEvaluations(rawList = []) {
  if (!Array.isArray(rawList)) return [];

  const seenIds = new Set();
  const validEvaluations = [];

  for (const item of rawList) {
    if (!isValidCompletedEvaluation(item)) {
      continue;
    }

    const uniqueId = item.id || item.evaluation_id || item.task_id;
    if (uniqueId) {
      if (seenIds.has(uniqueId)) {
        continue;
      }
      seenIds.add(uniqueId);
    }

    validEvaluations.push(item);
  }

  return validEvaluations;
}
