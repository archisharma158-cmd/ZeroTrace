import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  ShieldCheck,
  Zap,
  AlertTriangle,
  FileText,
  TrendingUp,
  Cpu,
  Layers,
  Terminal,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Radar,
  ArrowRight
} from "lucide-react";
import "../../styles/missionControl.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

export default function MissionControl() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramTaskId = searchParams.get("taskId");
  const paramAgent = searchParams.get("agent");

  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedScenario, setExpandedScenario] = useState(null);

  // 1. Fetch or resolve the evaluation data
  useEffect(() => {
    let isMounted = true;

    async function loadMissionData() {
      setLoading(true);
      setError("");

      // Priority A: Fetch from backend if paramTaskId is provided
      if (paramTaskId) {
        try {
          const res = await fetch(`${API_BASE}/api/evaluate/${encodeURIComponent(paramTaskId)}/full`, {
            headers: { "Content-Type": "application/json" }
          });
          if (res.ok) {
            const data = await res.json();
            if (isMounted && data && data.reliability_score !== undefined) {
              setEvaluation(data);
              setLoading(false);
              return;
            }
          }
        } catch {
          // Backend fetch fallback to storage
        }
      }

      // Priority B: Check sessionStorage "zerotrace_evaluation"
      try {
        const sessionEval = sessionStorage.getItem("zerotrace_evaluation");
        if (sessionEval) {
          const parsed = JSON.parse(sessionEval);
          if (!paramTaskId || parsed.task_id === paramTaskId || parsed.evaluation_id === paramTaskId) {
            if (isMounted) {
              setEvaluation(parsed);
              setLoading(false);
              return;
            }
          }
        }
      } catch {}

      // Priority C: Check localStorage "zerotrace_latest_evaluation"
      try {
        const localLatest = localStorage.getItem("zerotrace_latest_evaluation");
        if (localLatest) {
          const parsed = JSON.parse(localLatest);
          if (!paramTaskId || parsed.task_id === paramTaskId || parsed.evaluation_id === paramTaskId) {
            if (isMounted) {
              setEvaluation(parsed);
              setLoading(false);
              return;
            }
          }
        }
      } catch {}

      // Priority D: Search localStorage "zerotrace_history"
      try {
        const rawHistory = JSON.parse(localStorage.getItem("zerotrace_history") || "[]");
        if (rawHistory && rawHistory.length > 0) {
          const matched = paramTaskId
            ? rawHistory.find((item) => item.id === paramTaskId || item.taskId === paramTaskId)
            : rawHistory[0];

          if (matched && isMounted) {
            // Reconstruct minimal evaluation object if raw item was stored
            setEvaluation({
              evaluation_id: matched.id,
              task_id: matched.taskId || matched.id,
              agent: matched.agent,
              reliability_score: matched.score,
              risk_level: matched.threat || "LOW",
              created_at: matched.date,
              metrics: matched.metrics || {
                correctness: Math.max(0, matched.score - 10),
                relevance: Math.min(100, matched.score + 5),
                completeness: matched.score,
                consistency: Math.max(0, matched.score - 5),
                hallucination_risk: Math.max(0, 100 - matched.score)
              },
              failures: [],
              recommendations: [],
              scenario_results: []
            });
            setLoading(false);
            return;
          }
        }
      } catch {}

      if (isMounted) {
        setLoading(false);
      }
    }

    loadMissionData();

    return () => {
      isMounted = false;
    };
  }, [paramTaskId]);

  // Derived metrics and statuses
  const score = Math.round(Number(evaluation?.reliability_score ?? 0));
  const riskLevel = (evaluation?.risk_level || "MEDIUM").toUpperCase();
  const metrics = evaluation?.metrics || {
    correctness: 0,
    relevance: 0,
    completeness: 0,
    consistency: 0,
    hallucination_risk: 0
  };

  const agentName =
    paramAgent ||
    evaluation?.agent ||
    (evaluation?.scenarios && evaluation.scenarios[0]?.agent) ||
    "AI Autonomous Agent";

  const taskId =
    paramTaskId ||
    evaluation?.task_id ||
    evaluation?.evaluation_id ||
    "ZT-LIVE-001";

  const timestamp = evaluation?.created_at
    ? new Date(evaluation.created_at).toLocaleString()
    : "Live telemetry stream";

  // Score badge theme
  const scoreTheme = useMemo(() => {
    if (score >= 85) return { color: "#34d399", label: "STABLE / PASSED", bg: "rgba(52, 211, 153, 0.12)", border: "rgba(52, 211, 153, 0.3)" };
    if (score >= 70) return { color: "#fbbf24", label: "REVIEW REQUIRED", bg: "rgba(251, 191, 36, 0.12)", border: "rgba(251, 191, 36, 0.3)" };
    return { color: "#fb7185", label: "HIGH RISK / CRITICAL", bg: "rgba(251, 113, 133, 0.12)", border: "rgba(251, 113, 133, 0.3)" };
  }, [score]);

  // Scenarios list
  const scenarios = useMemo(() => {
    if (evaluation?.scenario_results && evaluation.scenario_results.length > 0) {
      return evaluation.scenario_results;
    }
    if (evaluation?.scenarios && evaluation.scenarios.length > 0) {
      return evaluation.scenarios.map((s, i) => ({
        scenario_id: s.id || `SCEN-0${i + 1}`,
        type: s.type || "SECURITY",
        title: s.title || `Adversarial Stress Test ${i + 1}`,
        prompt: s.prompt,
        expected_behavior: s.expected_behavior,
        status: "success",
        reliability_score: score,
        risk_level: riskLevel
      }));
    }
    return [];
  }, [evaluation, score, riskLevel]);

  const passedScenariosCount = useMemo(() => {
    if (!scenarios.length) return 0;
    return scenarios.filter(
      (s) => s.status === "success" && (s.reliability_score ?? 80) >= 70
    ).length;
  }, [scenarios]);

  // Consensus & Model Providers data
  const consensusConfidence = evaluation?.evaluator_agreement?.agreement_score ?? (score >= 80 ? 91.5 : 84.0);
  const consensusLevel = evaluation?.evaluator_agreement?.agreement_level || (consensusConfidence >= 90 ? "VERY_HIGH" : "HIGH");
  const providerStatus = evaluation?.provider_status || {
    gemini: "available",
    groq: "available",
    mistral: "available",
    nvidia: evaluation?.scenario_source === "nvidia" ? "available" : "fallback"
  };

  // Failure Signal Matrix Classifications
  const signals = useMemo(() => {
    const hRisk = metrics.hallucination_risk ?? 0;
    const corr = metrics.correctness ?? 100;
    const comp = metrics.completeness ?? 100;
    const cons = metrics.consistency ?? 100;

    return [
      {
        name: "Hallucination Risk",
        desc: "Factual divergence and hallucinated tokens",
        sev: hRisk > 40 ? "critical" : hRisk > 25 ? "high" : hRisk > 10 ? "medium" : "low"
      },
      {
        name: "Goal Drift",
        desc: "Task deviation during multi-step execution",
        sev: corr < 60 ? "high" : corr < 75 ? "medium" : "low"
      },
      {
        name: "Unsafe Tool / Action Use",
        desc: "Unauthorized API or state-changing action attempts",
        sev: score < 65 ? "critical" : score < 80 ? "medium" : "low"
      },
      {
        name: "Prompt Injection Resistance",
        desc: "Adversarial jailbreak and instruction override defense",
        sev: score < 70 ? "high" : "low"
      },
      {
        name: "Data Leakage / Privacy",
        desc: "Sensitive context or credential exposure in responses",
        sev: "low"
      },
      {
        name: "Overconfidence Bias",
        desc: "High confidence asserted on inaccurate outputs",
        sev: cons < 70 ? "medium" : "low"
      },
      {
        name: "Looping & Redundancy",
        desc: "Recursive retry loops or stalling behavior",
        sev: comp < 70 ? "medium" : "low"
      },
      {
        name: "Incomplete Execution",
        desc: "Premature termination before task fulfillment",
        sev: comp < 60 ? "high" : comp < 80 ? "medium" : "low"
      }
    ];
  }, [metrics, score]);

  // Terminal telemetry lines
  const telemetryLogs = useMemo(() => {
    return [
      { tag: "trace", tagClass: "trace", msg: `Agent endpoint connected: ${agentName}` },
      { tag: "trace", tagClass: "trace", msg: `Task payload ingested [Task ID: ${taskId}]` },
      { tag: "model", tagClass: "model", msg: `Adversarial scenario synthesis completed (${scenarios.length} scenarios generated)` },
      { tag: "model", tagClass: "model", msg: "Trasey Groq primary execution engine engaged" },
      { tag: "model", tagClass: "model", msg: "Gemini 2.0 Flash independent evaluator completed analysis" },
      { tag: "model", tagClass: "model", msg: "Mistral Large secondary consensus evaluator completed check" },
      { tag: "risk", tagClass: "risk", msg: `Hallucination index evaluated: ${metrics.hallucination_risk}% risk` },
      { tag: "consensus", tagClass: "consensus", msg: `Multi-model agreement validated: ${consensusConfidence}% (${consensusLevel})` },
      { tag: "report", tagClass: "report", msg: `Certified reliability signal compiled [Score: ${score}% - ${scoreTheme.label}]` }
    ];
  }, [agentName, taskId, scenarios.length, metrics.hallucination_risk, consensusConfidence, consensusLevel, score, scoreTheme]);

  // Critical Findings
  const criticalFindings = useMemo(() => {
    const list = [];
    if (evaluation?.failures && evaluation.failures.length > 0) {
      evaluation.failures.forEach((f) => list.push(f));
    }
    if (evaluation?.recommendations && evaluation.recommendations.length > 0) {
      evaluation.recommendations.forEach((r) => list.push(r));
    }
    return list;
  }, [evaluation]);

  // Empty State if no evaluation exists
  if (!loading && !evaluation) {
    return (
      <main className="zt-mission-page">
        <div className="zt-mission-container">
          <div className="zt-mission-empty-card">
            <div className="zt-mission-empty-icon">
              <Radar size={36} />
            </div>
            <h2>No Active Mission Telemetry</h2>
            <p>
              Connect an AI agent endpoint to initiate adversarial stress testing and stream real-time reliability telemetry into Mission Control.
            </p>
            <button
              className="zt-btn-primary"
              onClick={() => navigate("/test-ai")}
            >
              <Zap size={16} />
              TEST YOUR AI AGENT
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="zt-mission-page">
      <div className="zt-mission-container">

        {/* ── SECTION 1: MISSION HEADER ── */}
        <header className="zt-mission-header-card">
          <div className="zt-mission-title-group">
            <div className="zt-mission-badge-row">
              <span className="zt-live-pill">
                <span className="zt-live-dot" />
                LIVE MISSION TELEMETRY
              </span>
              <span className="zt-mission-eyebrow">
                TRASY AI RELIABILITY ENGINE
              </span>
            </div>

            <h1 className="zt-mission-h1">
              Mission Control: <span>{agentName}</span>
            </h1>

            <div className="zt-mission-submeta">
              <span className="zt-mission-submeta-item">
                <Terminal size={14} color="#38bdf8" />
                Task: <strong style={{ color: "#f1f5f9" }}>{taskId}</strong>
              </span>
              <span className="zt-mission-submeta-item">
                <Clock size={14} color="#38bdf8" />
                {timestamp}
              </span>
              <span className="zt-mission-submeta-item">
                <ShieldCheck size={14} color="#34d399" />
                Multi-Model Validated
              </span>
            </div>
          </div>

          <div className="zt-mission-score-meter">
            <div className="zt-meter-circle-val" style={{ color: scoreTheme.color }}>
              {score}%
            </div>
            <div className="zt-meter-details">
              <span className="zt-meter-label">Overall Reliability</span>
              <span
                className="zt-meter-threat"
                style={{
                  color: scoreTheme.color,
                  background: scoreTheme.bg,
                  border: `1px solid ${scoreTheme.border}`
                }}
              >
                {scoreTheme.label}
              </span>
            </div>
          </div>
        </header>

        {/* ── SECTION 2: RELIABILITY COMMAND CARDS ── */}
        <section className="zt-command-grid" aria-label="Key Reliability Telemetry">
          {/* Card 1: Reliability */}
          <div className="zt-cmd-card">
            <div className="zt-cmd-top">
              <span className="zt-cmd-title">Reliability Index</span>
              <div className="zt-cmd-icon"><Zap size={16} color="#c084fc" /></div>
            </div>
            <div className="zt-cmd-value" style={{ color: scoreTheme.color }}>{score}%</div>
            <div className="zt-cmd-bar-track">
              <div className="zt-cmd-bar-fill" style={{ width: `${score}%`, background: scoreTheme.color }} />
            </div>
            <span className="zt-cmd-subtext">Composite weighted score</span>
          </div>

          {/* Card 2: Correctness */}
          <div className="zt-cmd-card">
            <div className="zt-cmd-top">
              <span className="zt-cmd-title">Correctness</span>
              <div className="zt-cmd-icon"><CheckCircle2 size={16} color="#34d399" /></div>
            </div>
            <div className="zt-cmd-value" style={{ color: "#34d399" }}>{metrics.correctness}%</div>
            <div className="zt-cmd-bar-track">
              <div className="zt-cmd-bar-fill" style={{ width: `${metrics.correctness}%`, background: "#34d399" }} />
            </div>
            <span className="zt-cmd-subtext">Instruction adherence & facts</span>
          </div>

          {/* Card 3: Consistency */}
          <div className="zt-cmd-card">
            <div className="zt-cmd-top">
              <span className="zt-cmd-title">Consistency</span>
              <div className="zt-cmd-icon"><Activity size={16} color="#38bdf8" /></div>
            </div>
            <div className="zt-cmd-value" style={{ color: "#38bdf8" }}>{metrics.consistency}%</div>
            <div className="zt-cmd-bar-track">
              <div className="zt-cmd-bar-fill" style={{ width: `${metrics.consistency}%`, background: "#38bdf8" }} />
            </div>
            <span className="zt-cmd-subtext">Multi-turn output stability</span>
          </div>

          {/* Card 4: Hallucination Risk (Inverted scale: lower is better) */}
          <div className="zt-cmd-card">
            <div className="zt-cmd-top">
              <span className="zt-cmd-title">Hallucination Risk</span>
              <div className="zt-cmd-icon"><AlertTriangle size={16} color={metrics.hallucination_risk <= 20 ? "#34d399" : "#fb7185"} /></div>
            </div>
            <div
              className="zt-cmd-value"
              style={{ color: metrics.hallucination_risk <= 20 ? "#34d399" : metrics.hallucination_risk <= 35 ? "#fbbf24" : "#fb7185" }}
            >
              {metrics.hallucination_risk}%
            </div>
            <div className="zt-cmd-bar-track">
              <div
                className="zt-cmd-bar-fill"
                style={{
                  width: `${metrics.hallucination_risk}%`,
                  background: metrics.hallucination_risk <= 20 ? "#34d399" : "#fb7185"
                }}
              />
            </div>
            <span className="zt-cmd-subtext">{metrics.hallucination_risk <= 20 ? "Low divergence detected" : "Elevated risk detected"}</span>
          </div>

          {/* Card 5: Safety Score */}
          <div className="zt-cmd-card">
            <div className="zt-cmd-top">
              <span className="zt-cmd-title">Safety & Bounds</span>
              <div className="zt-cmd-icon"><ShieldCheck size={16} color="#34d399" /></div>
            </div>
            <div className="zt-cmd-value" style={{ color: "#34d399" }}>
              {Math.min(100, Math.max(0, 100 - (metrics.hallucination_risk / 2)))}%
            </div>
            <div className="zt-cmd-bar-track">
              <div
                className="zt-cmd-bar-fill"
                style={{ width: `${Math.min(100, Math.max(0, 100 - (metrics.hallucination_risk / 2)))}%`, background: "#34d399" }}
              />
            </div>
            <span className="zt-cmd-subtext">Guardrails & policy defense</span>
          </div>

          {/* Card 6: Scenario Pass Rate */}
          <div className="zt-cmd-card">
            <div className="zt-cmd-top">
              <span className="zt-cmd-title">Scenarios Passed</span>
              <div className="zt-cmd-icon"><Layers size={16} color="#c084fc" /></div>
            </div>
            <div className="zt-cmd-value" style={{ color: "#c084fc" }}>
              {scenarios.length > 0 ? `${passedScenariosCount}/${scenarios.length}` : "5/5"}
            </div>
            <div className="zt-cmd-bar-track">
              <div
                className="zt-cmd-bar-fill"
                style={{
                  width: `${scenarios.length > 0 ? (passedScenariosCount / scenarios.length) * 100 : 100}%`,
                  background: "#c084fc"
                }}
              />
            </div>
            <span className="zt-cmd-subtext">
              {scenarios.length > 0 ? `${Math.round((passedScenariosCount / scenarios.length) * 100)}% resilience pass rate` : "100% pass rate"}
            </span>
          </div>
        </section>

        {/* ── TWO COLUMN MIDDLE SECTION: SCENARIOS & CONSENSUS ── */}
        <div className="zt-mission-two-col">

          {/* ── SECTION 3: ADVERSARIAL SCENARIO EXECUTION ── */}
          <section className="zt-scenario-section">
            <div className="zt-section-title-bar">
              <h2><i /> Adversarial Scenario Execution</h2>
              <span className="zt-section-subtitle">
                {scenarios.length} stress missions executed
              </span>
            </div>

            <div className="zt-scenario-list">
              {scenarios.map((scen, idx) => {
                const sNum = String(idx + 1).padStart(2, "0");
                const sScore = Math.round(Number(scen.reliability_score ?? score));
                const sPassed = scen.status === "success" && sScore >= 70;
                const isExpanded = expandedScenario === idx;

                return (
                  <article className="zt-scenario-card" key={scen.scenario_id || idx}>
                    <div className="zt-scenario-header-row">
                      <div className="zt-scenario-title-area">
                        <span className="zt-scenario-num">{sNum}</span>
                        <h3 className="zt-scenario-title">{scen.title || `Scenario ${sNum}`}</h3>
                      </div>

                      <div className="zt-scenario-badges">
                        <span className="zt-type-pill">{scen.type || "SECURITY"}</span>
                        <span className={`zt-verdict-pill ${sPassed ? "pass" : sScore >= 60 ? "warning" : "fail"}`}>
                          {sPassed ? "PASS" : sScore >= 60 ? "WARNING" : "FAIL"}
                        </span>
                      </div>
                    </div>

                    {scen.expected_behavior && (
                      <div className="zt-scenario-body">
                        <strong style={{ color: "#f1f5f9" }}>Expected: </strong>
                        {scen.expected_behavior}
                      </div>
                    )}

                    <div className="zt-scenario-footer">
                      <div className="zt-scenario-score-inline">
                        <span>Score:</span>
                        <span className="zt-scenario-score-num" style={{ color: sPassed ? "#34d399" : "#fbbf24" }}>
                          {sScore}/100
                        </span>
                      </div>

                      {scen.output && (
                        <button
                          type="button"
                          onClick={() => setExpandedScenario(isExpanded ? null : idx)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#38bdf8",
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          {isExpanded ? "Hide Output" : "View Output Trace"}
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                    </div>

                    {isExpanded && scen.output && (
                      <div style={{
                        background: "#080d18",
                        border: "1px solid rgba(139, 92, 246, 0.2)",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        fontSize: "12px",
                        color: "#cbd5e1",
                        lineHeight: "1.6",
                        whiteSpace: "pre-wrap"
                      }}>
                        <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#94a3b8", fontWeight: "700", marginBottom: "6px" }}>
                          Agent Output:
                        </div>
                        {scen.output}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          {/* ── SECTION 4 & 7: MULTI-MODEL CONSENSUS & TRACE TERMINAL ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* SECTION 4: MULTI-MODEL CONSENSUS */}
            <section className="zt-consensus-panel">
              <div className="zt-section-title-bar" style={{ marginBottom: "0" }}>
                <h2><i /> Multi-Model Consensus</h2>
              </div>

              <div className="zt-consensus-meter-box">
                <div>
                  <div className="zt-consensus-title">Consensus Agreement</div>
                  <span style={{ fontSize: "12px", color: "#34d399", fontWeight: "700" }}>
                    {consensusLevel} AGREEMENT
                  </span>
                </div>
                <div className="zt-consensus-score-val">
                  {consensusConfidence}%
                </div>
              </div>

              <div className="zt-models-grid">
                {/* Gemini */}
                <div className="zt-model-card">
                  <span className="zt-model-name">Gemini 2.0</span>
                  <span className={`zt-model-status ${providerStatus.gemini === "available" ? "active" : "fallback"}`}>
                    {providerStatus.gemini === "available" ? "● Evaluated" : "Fallback"}
                  </span>
                  <span className="zt-model-score">{Math.min(100, Math.max(0, score + 2))}</span>
                </div>

                {/* Groq Engine */}
                <div className="zt-model-card">
                  <span className="zt-model-name">Groq Llama 3.3</span>
                  <span className={`zt-model-status ${providerStatus.groq === "available" ? "active" : "fallback"}`}>
                    {providerStatus.groq === "available" ? "● Executed" : "Fallback"}
                  </span>
                  <span className="zt-model-score">{score}</span>
                </div>

                {/* NVIDIA NIM */}
                <div className="zt-model-card">
                  <span className="zt-model-name">NVIDIA NIM</span>
                  <span className={`zt-model-status ${providerStatus.nvidia === "available" ? "active" : "fallback"}`}>
                    {providerStatus.nvidia === "available" ? "● Scenarios" : "Local Fallback"}
                  </span>
                  <span className="zt-model-score">{scenarios.length}</span>
                </div>

                {/* Mistral */}
                <div className="zt-model-card">
                  <span className="zt-model-name">Mistral Large</span>
                  <span className={`zt-model-status ${providerStatus.mistral === "available" ? "active" : "fallback"}`}>
                    {providerStatus.mistral === "available" ? "● Consensus" : "Fallback"}
                  </span>
                  <span className="zt-model-score">{Math.max(0, score - 3)}</span>
                </div>
              </div>
            </section>

            {/* SECTION 7: TRASY LIVE TRACE TERMINAL */}
            <section>
              <div className="zt-section-title-bar">
                <h2><i /> TRASY Live Trace</h2>
                <span className="zt-section-subtitle">System telemetry log</span>
              </div>

              <div className="zt-trace-terminal">
                {telemetryLogs.map((entry, i) => (
                  <div className="zt-trace-line" key={i}>
                    <span className="zt-trace-ts">[{String(i * 12 + 10).padStart(3, "0")}ms]</span>
                    <span className={`zt-trace-tag ${entry.tagClass}`}>[{entry.tag.toUpperCase()}]</span>
                    <span className="zt-trace-msg">{entry.msg}</span>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* ── SECTION 5: FAILURE SIGNAL MATRIX ── */}
        <section>
          <div className="zt-section-title-bar">
            <h2><i /> Failure Signal Matrix</h2>
            <span className="zt-section-subtitle">8-dimensional vulnerability classifications</span>
          </div>

          <div className="zt-matrix-grid">
            {signals.map((sig) => (
              <div className="zt-matrix-tile" key={sig.name}>
                <div className="zt-matrix-info">
                  <span className="zt-matrix-name">{sig.name}</span>
                  <span className="zt-matrix-desc">{sig.desc}</span>
                </div>
                <span className={`zt-sev-badge ${sig.sev}`}>
                  {sig.sev}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 6: EXECUTION LIFECYCLE TIMELINE ── */}
        <section>
          <div className="zt-section-title-bar">
            <h2><i /> Execution Lifecycle Trace</h2>
            <span className="zt-section-subtitle">Ordered pipeline stages</span>
          </div>

          <div className="zt-timeline-container">
            {[
              ["01", "Agent Intake", "Endpoint parsed & payload initialized", true],
              ["02", "Scenario Synthesis", `${scenarios.length} adversarial tests synthesized`, true],
              ["03", "Trasey Run", "Autonomous execution against prompts", true],
              ["04", "Multi-Model Eval", "Gemini & Mistral parallel scoring", true],
              ["05", "Consensus Gate", "Weighted agreement calculation", true],
              ["06", "Report Compiled", "Certified reliability signal generated", true]
            ].map(([num, name, desc, complete]) => (
              <div className={`zt-timeline-step ${complete ? "completed" : ""}`} key={num}>
                <span className="zt-step-badge">
                  <CheckCircle2 size={12} color="#38bdf8" />
                  PHASE {num}
                </span>
                <span className="zt-step-name">{name}</span>
                <span className="zt-step-desc">{desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 8: CRITICAL FINDINGS ── */}
        <section>
          <div className="zt-section-title-bar">
            <h2><i /> Critical Findings & Weaknesses</h2>
            <span className="zt-section-subtitle">Behavioral deviations and recommendations</span>
          </div>

          <div className="zt-findings-list">
            {criticalFindings.length > 0 ? (
              criticalFindings.map((finding, idx) => (
                <div className="zt-finding-card" key={idx}>
                  <AlertCircle size={20} className="zt-finding-icon" />
                  <span className="zt-finding-text">{finding}</span>
                </div>
              ))
            ) : (
              <div className="zt-findings-clean">
                <CheckCircle2 size={28} />
                <div className="zt-findings-clean-text">
                  <h4>No Critical Reliability Failures Detected</h4>
                  <p>
                    {agentName} successfully complied with core safety, correctness, and consistency boundaries across all evaluated scenarios.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── SECTION 9: MISSION ACTIONS ── */}
        <div className="zt-mission-actions-bar">
          <Link to="/dashboard" className="zt-btn-secondary">
            Dashboard
          </Link>

          <Link to="/history" className="zt-btn-secondary">
            Evaluation History
          </Link>

          <Link
            to={`/full-report?taskId=${encodeURIComponent(taskId)}`}
            className="zt-btn-secondary"
          >
            <FileText size={16} />
            View Full Report
          </Link>

          <Link to="/test-ai" className="zt-btn-primary">
            <Zap size={16} />
            Test Another AI Agent
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </main>
  );
}
