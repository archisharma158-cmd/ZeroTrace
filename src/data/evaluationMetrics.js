export const evaluationMetrics = [
  {
    id: "goal_task_completion",
    category: "Goal Alignment",
    name: "Task Completion",
    weight: 1.2
  },
  {
    id: "goal_objective_preservation",
    category: "Goal Alignment",
    name: "Objective Preservation",
    weight: 1.2
  },
  {
    id: "goal_irrelevant_action_rate",
    category: "Goal Alignment",
    name: "Irrelevant Action Rate",
    weight: 1
  },
  {
    id: "goal_outcome_quality",
    category: "Goal Alignment",
    name: "Final Outcome Quality",
    weight: 1.2
  },
  {
    id: "goal_subgoal_completion",
    category: "Goal Alignment",
    name: "Sub-goal Completion",
    weight: 1
  },
  {
    id: "goal_success_rate",
    category: "Goal Alignment",
    name: "Goal Success Rate",
    weight: 1.3
  },

  {
    id: "instruction_explicit",
    category: "Instruction Following",
    name: "Explicit Instruction Following",
    weight: 1.1
  },
  {
    id: "instruction_priority",
    category: "Instruction Following",
    name: "Instruction Priority Handling",
    weight: 1.1
  },
  {
    id: "instruction_constraints",
    category: "Instruction Following",
    name: "Constraint Adherence",
    weight: 1
  },
  {
    id: "instruction_format",
    category: "Instruction Following",
    name: "Output Format Compliance",
    weight: 0.8
  },
  {
    id: "instruction_prohibited",
    category: "Instruction Following",
    name: "Prohibited Action Adherence",
    weight: 1.2
  },

  {
    id: "safety_unsafe_request",
    category: "Safety",
    name: "Unsafe Request Resistance",
    weight: 1.5
  },
  {
    id: "safety_sensitive_data",
    category: "Safety",
    name: "Sensitive Data Handling",
    weight: 1.4
  },
  {
    id: "safety_privilege",
    category: "Safety",
    name: "Privilege Boundary Protection",
    weight: 1.5
  },
  {
    id: "safety_malicious_input",
    category: "Safety",
    name: "Malicious Input Resistance",
    weight: 1.5
  },
  {
    id: "safety_tool_usage",
    category: "Safety",
    name: "Safe Tool Usage",
    weight: 1.4
  },
  {
    id: "safety_policy_consistency",
    category: "Safety",
    name: "Safety Policy Consistency",
    weight: 1.2
  },
  {
    id: "safety_escalation",
    category: "Safety",
    name: "Escalation Behavior",
    weight: 1
  },

  {
    id: "tool_selection",
    category: "Tool Reliability",
    name: "Correct Tool Selection",
    weight: 1
  },
  {
    id: "tool_arguments",
    category: "Tool Reliability",
    name: "Tool Argument Accuracy",
    weight: 1.1
  },
  {
    id: "tool_invalid_handling",
    category: "Tool Reliability",
    name: "Invalid Tool Handling",
    weight: 1
  },
  {
    id: "tool_error_handling",
    category: "Tool Reliability",
    name: "Tool Error Handling",
    weight: 1.2
  },
  {
    id: "tool_timeout",
    category: "Tool Reliability",
    name: "Timeout Handling",
    weight: 0.9
  },
  {
    id: "tool_redundancy",
    category: "Tool Reliability",
    name: "Redundant Tool Call Rate",
    weight: 0.8
  },

  {
    id: "reasoning_decision_quality",
    category: "Reasoning & Decision",
    name: "Decision Quality",
    weight: 1.2
  },
  {
    id: "reasoning_action_order",
    category: "Reasoning & Decision",
    name: "Action Ordering",
    weight: 1
  },
  {
    id: "reasoning_unnecessary_actions",
    category: "Reasoning & Decision",
    name: "Unnecessary Action Rate",
    weight: 0.9
  },
  {
    id: "reasoning_ambiguity",
    category: "Reasoning & Decision",
    name: "Ambiguity Handling",
    weight: 1.1
  },
  {
    id: "reasoning_confidence",
    category: "Reasoning & Decision",
    name: "Confidence Calibration",
    weight: 1
  },

  {
    id: "robust_prompt_injection",
    category: "Robustness",
    name: "Prompt Injection Resistance",
    weight: 1.5
  },
  {
    id: "robust_conflicting_instructions",
    category: "Robustness",
    name: "Conflicting Instruction Handling",
    weight: 1.3
  },
  {
    id: "robust_malformed_input",
    category: "Robustness",
    name: "Malformed Input Handling",
    weight: 1
  },
  {
    id: "robust_adversarial_wording",
    category: "Robustness",
    name: "Adversarial Wording Resistance",
    weight: 1.2
  },
  {
    id: "robust_context_noise",
    category: "Robustness",
    name: "Context Noise Resistance",
    weight: 1
  },
  {
    id: "robust_unexpected_state",
    category: "Robustness",
    name: "Unexpected State Handling",
    weight: 1.1
  },

  {
    id: "recovery_error_detection",
    category: "Failure Recovery",
    name: "Failure Detection",
    weight: 1.2
  },
  {
    id: "recovery_retry",
    category: "Failure Recovery",
    name: "Retry Quality",
    weight: 1
  },
  {
    id: "recovery_success",
    category: "Failure Recovery",
    name: "Recovery Success Rate",
    weight: 1.4
  },
  {
    id: "recovery_rollback",
    category: "Failure Recovery",
    name: "Rollback Behavior",
    weight: 1.2
  },
  {
    id: "recovery_alternative",
    category: "Failure Recovery",
    name: "Alternative Strategy Selection",
    weight: 1
  },
  {
    id: "recovery_propagation",
    category: "Failure Recovery",
    name: "Failure Propagation Control",
    weight: 1.3
  },

  {
    id: "consistency_repeated_tasks",
    category: "Consistency",
    name: "Repeated Task Consistency",
    weight: 1
  },
  {
    id: "consistency_output",
    category: "Consistency",
    name: "Output Consistency",
    weight: 0.9
  },
  {
    id: "consistency_decision",
    category: "Consistency",
    name: "Decision Consistency",
    weight: 1
  },
  {
    id: "consistency_instruction",
    category: "Consistency",
    name: "Instruction Consistency",
    weight: 1
  },
  {
    id: "consistency_variance",
    category: "Consistency",
    name: "Behavior Variance",
    weight: 1.1
  },

  {
    id: "efficiency_latency",
    category: "Efficiency",
    name: "Response Latency",
    weight: 0.8
  },
  {
    id: "efficiency_tokens",
    category: "Efficiency",
    name: "Token Efficiency",
    weight: 0.7
  },
  {
    id: "efficiency_tool_calls",
    category: "Efficiency",
    name: "Tool Call Efficiency",
    weight: 0.8
  },
  {
    id: "efficiency_redundancy",
    category: "Efficiency",
    name: "Computation Redundancy",
    weight: 0.7
  },
  {
    id: "efficiency_completion",
    category: "Efficiency",
    name: "Completion Efficiency",
    weight: 0.9
  },

  {
    id: "observability_trace",
    category: "Reliability & Observability",
    name: "Trace Completeness",
    weight: 1
  },
  {
    id: "observability_attribution",
    category: "Reliability & Observability",
    name: "Action Attribution",
    weight: 1
  },
  {
    id: "observability_state",
    category: "Reliability & Observability",
    name: "State Preservation",
    weight: 1
  },
  {
    id: "observability_reproducibility",
    category: "Reliability & Observability",
    name: "Reproducibility",
    weight: 1.1
  },
  {
    id: "observability_audit",
    category: "Reliability & Observability",
    name: "Auditability",
    weight: 1
  }
];

export const evaluationCategories = [
  "Goal Alignment",
  "Instruction Following",
  "Safety",
  "Tool Reliability",
  "Reasoning & Decision",
  "Robustness",
  "Failure Recovery",
  "Consistency",
  "Efficiency",
  "Reliability & Observability"
];

export const TOTAL_METRICS = evaluationMetrics.length;
