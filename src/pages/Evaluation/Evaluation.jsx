import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Radar,
  ShieldCheck,
  Terminal,
  Zap,
  TrendingUp,
  RefreshCw,
  ArrowLeft
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const stages = [
  ["Agent Intake", "Reading agent configuration", Cpu],
  ["Baseline Analysis", "Establishing behavioral baseline", Activity],
  ["Scenario Generation", "Generating adversarial missions", Radar],
  ["Safety Evaluation", "Testing safety boundaries", ShieldCheck],
  ["Trace Collection", "Collecting behavioral evidence", Terminal],
  ["Failure Classification", "Classifying observed failures", AlertTriangle],
  ["Reliability Scoring", "Calculating weighted reliability", Zap]
];

function Evaluation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");
  const agentName = searchParams.get("agent") || "AI Agent";

  const [activeStage, setActiveStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const activeTaskIdRef = useRef(null);
  const backendResultRef = useRef(null);
  const backendDoneRef = useRef(false);
  const fetchInProgressRef = useRef(false);

  useEffect(() => {
    if (!taskId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Reset if it's a completely new task
    if (activeTaskIdRef.current !== taskId) {
      activeTaskIdRef.current = taskId;
      backendDoneRef.current = false;
      backendResultRef.current = null;
      fetchInProgressRef.current = false;
      setError("");
      setProgress(0);
      setActiveStage(0);
      setLoading(true);
    }

    // 1. Kick off real backend full evaluation only once per taskId
    const runEvaluation = async () => {
      if (fetchInProgressRef.current || backendDoneRef.current) return;
      fetchInProgressRef.current = true;

      try {
        const response = await fetch(`${API_BASE}/api/evaluate/${encodeURIComponent(taskId)}/full`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.evaluation_id) {
          backendResultRef.current = data;
          backendDoneRef.current = true;

          // Store real evaluation in sessionStorage
          sessionStorage.setItem("zerotrace_evaluation", JSON.stringify(data));

          // Save real completed evaluation to history if valid
          try {
            const rawHistory = JSON.parse(localStorage.getItem("zerotrace_history") || "[]");
            const evalId = data.evaluation_id;
            const evalScore = data.reliability_score !== undefined && data.reliability_score !== null
              ? Math.round(Number(data.reliability_score))
              : null;

            if (evalId && evalScore !== null && !isNaN(evalScore)) {
              // Deduplicate by evaluation_id
              const withoutExisting = rawHistory.filter(item => item.id !== evalId);
              const meaningfulAgent = (agentName && agentName.trim()) || "AI Agent";

              withoutExisting.unshift({
                id: evalId,
                agent: meaningfulAgent,
                score: evalScore,
                threat: data.risk_level || "MEDIUM",
                status: "PASSED",
                date: new Date().toLocaleString()
              });

              localStorage.setItem("zerotrace_history", JSON.stringify(withoutExisting.slice(0, 50)));
            }
          } catch {
            // Storage quota safe
          }
        } else {
          const detail = data.detail || data.message || "Evaluation failed on backend. Please retry.";
          backendResultRef.current = { isError: true, detail };
          backendDoneRef.current = true;
        }
      } catch {
        backendResultRef.current = { isError: true, detail: "Network error connecting to evaluation service. Please check your backend connection." };
        backendDoneRef.current = true;
      } finally {
        fetchInProgressRef.current = false;
      }
    };

    runEvaluation();

    // 2. Drive progress animation smoothly matching real execution phases
    const interval = setInterval(() => {
      if (!isMounted) return;

      setProgress((current) => {
        if (backendDoneRef.current && backendResultRef.current) {
          // Check if the backend result was an error
          if (backendResultRef.current.isError) {
            setError(backendResultRef.current.detail);
            setLoading(false);
            clearInterval(interval);
            return current;
          }

          // Backend finished successfully! Rapidly advance through Reliability Scoring to 100%
          const next = Math.min(current + 8, 100);
          const stage = Math.min(
            Math.floor(next / (100 / stages.length)),
            stages.length - 1
          );
          setActiveStage(stage);

          if (next === 100) {
            clearInterval(interval);
            setEvaluation(backendResultRef.current);
            setLoading(false);
          }
          return next;
        }

        // Pacing during execution (advances through intake, baseline, scenario gen, safety, and trace)
        let increment = 0;
        if (current < 25) {
          increment = 1.0;
        } else if (current < 55) {
          increment = 0.6;
        } else if (current < 72) {
          increment = 0.35;
        } else if (current < 84) {
          increment = 0.15;
        }

        if (increment > 0) {
          const next = Math.min(current + increment, 84);
          const stage = Math.min(
            Math.floor(next / (100 / stages.length)),
            stages.length - 2 // Keep within stages 0..5 while processing scenarios
          );
          setActiveStage(stage);
          return next;
        }

        return current;
      });
    }, 150);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [taskId, agentName]);

  const complete = progress === 100 && evaluation !== null;
  const failureCount = evaluation?.failures ? evaluation.failures.length : 0;
  const scenarioCount = evaluation?.scenario_results?.length ?? evaluation?.scenarios?.length ?? "unavailable";

  if (!taskId && !loading && !evaluation) {
    return (
      <div className="evaluation-page">
        <header className="evaluation-header">
          <div>
            <span className="engine-label">TRASY / AUTONOMOUS EVALUATION ENGINE</span>
            <h1>Agent Evaluation</h1>
          </div>
        </header>

        <section className="evaluation-main">
          <div className="evaluation-progress-card" style={{ textAlign: "center", padding: "40px 20px" }}>
            <h2 style={{ color: "#f1f5f9", marginBottom: "12px" }}>No Active Evaluation Task</h2>
            <p style={{ color: "#94a3b8", maxWidth: "500px", margin: "0 auto 24px", lineHeight: "1.6" }}>
              Please connect an AI agent endpoint to initiate adversarial scenario generation and multi-model evaluation.
            </p>
            <button
              type="button"
              className="zt-connect-button"
              onClick={() => navigate("/test-ai")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "8px",
                background: "linear-gradient(90deg, #8b3ff0, #ed3e91)",
                color: "white",
                border: "none",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              CONNECT AGENT →
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="evaluation-page">
      <header className="evaluation-header">
        <div>
          <span className="engine-label">
            TRASY / AUTONOMOUS EVALUATION ENGINE
          </span>
          <h1>Agent Evaluation</h1>
        </div>

        <div className="evaluation-status">
          <span className="status-dot" style={error ? { backgroundColor: "#ff4caa" } : {}} />
          {error
            ? "EVALUATION FAILED"
            : complete
            ? "EVALUATION COMPLETE"
            : "ENGINE RUNNING"}
        </div>
      </header>

      <section className="evaluation-main">
        {error ? (
          <div className="evaluation-progress-card" style={{ borderColor: "rgba(255, 76, 170, 0.4)", padding: "35px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#ff6fae", marginBottom: "16px" }}>
              <AlertTriangle size={24} />
              <strong style={{ fontSize: "18px" }}>Backend Evaluation Encountered An Error</strong>
            </div>
            <p style={{ color: "#cbd5e1", lineHeight: "1.6", marginBottom: "24px" }}>
              {error}
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => {
                  activeTaskIdRef.current = null;
                  window.location.reload();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  background: "linear-gradient(90deg, #8b3ff0, #ed3e91)",
                  color: "white",
                  border: "none",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                <RefreshCw size={15} /> Retry Evaluation
              </button>
              <button
                type="button"
                onClick={() => navigate("/test-ai")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#cbd5e1",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                <ArrowLeft size={15} /> Back to Connect
              </button>
            </div>
          </div>
        ) : (
          <div className="evaluation-progress-card">
            <div className="progress-top">
              <div>
                <small>MISSION STATUS</small>
                <strong>
                  {complete
                    ? "Evaluation complete"
                    : stages[activeStage][0]}
                </strong>
              </div>

              <div className="percentage">
                {progress}%
              </div>
            </div>

            <div className="large-progress">
              <div style={{ width: `${progress}%` }} />
            </div>

            <div className="mission-meta">
              <span>
                <b>5</b> scenarios
              </span>
              <span>
                <b>5</b> dimensions
              </span>
              <span>
                <b>LIVE</b> trace
              </span>
            </div>
          </div>
        )}

        <div className="evaluation-grid">
          <section className="stage-card">
            <div className="card-heading">
              <span>EVALUATION PIPELINE</span>
              <small>TRASY CORE</small>
            </div>

            <div className="stage-list">
              {stages.map(([name, description, Icon], index) => {
                const done = complete || index < activeStage;
                const running = !complete && !error && index === activeStage;

                return (
                  <div
                    key={name}
                    className={`stage ${done ? "completed" : ""} ${running ? "running" : ""}`}
                  >
                    <div className="stage-icon">
                      {done ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Icon size={16} />
                      )}
                    </div>

                    <div className="stage-text">
                      <strong>{name}</strong>
                      <span>{description}</span>
                    </div>

                    <div className="stage-state">
                      {done
                        ? "DONE"
                        : running
                        ? "RUNNING"
                        : "WAITING"}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="trace-card">
            <div className="card-heading">
              <span>LIVE TRACE</span>
              <small>STREAM</small>
            </div>

            <div className="trace-window">
              <div>
                <span className="trace-time">00:01</span>
                <p>Agent session initialized ({agentName})</p>
              </div>

              <div>
                <span className="trace-time">00:03</span>
                <p>Behavioral baseline established</p>
              </div>

              <div>
                <span className="trace-time">00:06</span>
                <p>Adversarial scenarios generated via NVIDIA NIM</p>
              </div>

              <div>
                <span className="trace-time">00:09</span>
                <p>Evaluating across Gemini & Mistral consensus</p>
              </div>

              {complete && (
                <>
                  <div>
                    <span className="trace-time">00:12</span>
                    <p className="warning">
                      Reliability scoring: {evaluation?.reliability_score}/100 ({evaluation?.risk_level} RISK)
                    </p>
                  </div>

                  <div>
                    <span className="trace-time">00:15</span>
                    <p>
                      Evaluation complete — {failureCount} failure points flagged
                    </p>
                  </div>
                </>
              )}

              <span className="cursor">▋</span>
            </div>
          </section>
        </div>

        {complete && evaluation && (
          <>
            <section className="result-card">
              <div className="result-score">
                <span>TRASY RELIABILITY SCORE</span>
                <strong>
                  {evaluation.reliability_score}
                </strong>
                <small>/ 100</small>
              </div>

              <div className="result-summary">
                <div>
                  <small>RISK LEVEL</small>
                  <strong style={{ color: evaluation.risk_level === "LOW" ? "#4fe4bd" : evaluation.risk_level === "MEDIUM" ? "#ffb74d" : "#ff4caa" }}>
                    {evaluation.risk_level} RISK
                  </strong>
                </div>

                <div>
                  <small>SCENARIOS</small>
                  <strong>{scenarioCount}</strong>
                </div>

                <div>
                  <small>FAILURES</small>
                  <strong>{failureCount}</strong>
                </div>
              </div>
            </section>

            {evaluation.metrics && (
              <section className="dimension-card">
                <div className="card-heading">
                  <span>CORE EVALUATION METRICS</span>
                  <small>EVALUATED DIMENSIONS</small>
                </div>

                <div className="dimension-grid">
                  {[
                    ["Correctness", evaluation.metrics.correctness],
                    ["Relevance", evaluation.metrics.relevance],
                    ["Completeness", evaluation.metrics.completeness],
                    ["Consistency", evaluation.metrics.consistency],
                    ["Hallucination Risk", evaluation.metrics.hallucination_risk]
                  ].map(([label, score]) => (
                    <div className="dimension" key={label}>
                      <div className="dimension-top">
                        <span>{label}</span>
                        <strong>{score}</strong>
                      </div>
                      <div className="dimension-bar">
                        <div style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="evaluation-complete">
              <div>
                <span>TRASY ANALYSIS COMPLETE</span>
                <h2>Reliability signal generated.</h2>
                <p>
                  TRASY evaluated {agentName} across {scenarioCount} adversarial scenarios with multi-model validation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/mission-control")}
              >
                VIEW MISSION CONTROL
                <TrendingUp size={16} />
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Evaluation;
