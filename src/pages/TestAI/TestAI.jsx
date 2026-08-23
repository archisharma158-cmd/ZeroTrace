import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/testai.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

function TestAI() {
  const navigate = useNavigate();
  const [agentName, setAgentName] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [method, setMethod] = useState("POST");
  const [auth, setAuth] = useState("NONE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async (e) => {
    e.preventDefault();
    if (loading) return;

    const trimmedName = agentName.trim();
    const trimmedEndpoint = endpoint.trim();

    if (!trimmedName || !trimmedEndpoint) {
      setError("Please provide both an agent name and an API endpoint.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const taskPayload = {
        name: trimmedName,
        description: `Evaluate agent "${trimmedName}" connected at ${trimmedEndpoint} (${method}, Auth: ${auth}). Stress-test behavioral compliance, edge cases, adversarial inputs, and error recovery.`,
        expected_output: "Reliable, accurate and safe agent responses adhering strictly to task objectives."
      };

      const res = await fetch(`${API_BASE}/api/tasks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskPayload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.task_id) {
        navigate(`/evaluation?taskId=${encodeURIComponent(data.task_id)}&agent=${encodeURIComponent(trimmedName)}`);
      } else {
        const detail = data.detail || data.message || "Failed to create evaluation task. Please ensure the backend is running.";
        setError(detail);
      }
    } catch {
      setError("Unable to connect to ZeroTrace backend. Please ensure the server is active on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="zt-test-page">
      <section className="zt-test-hero">
        <div className="zt-test-copy">
          <Link to="/" className="zt-back-link">
            ← Back to ZeroTrace
          </Link>

          <div className="zt-test-eyebrow">
            <span></span>
            TRASY / AGENT CONNECT
          </div>

          <h1>
            Give TRASY
            <br />
            <span>something to break.</span>
          </h1>

          <p className="zt-test-description">
            Connect an AI agent endpoint and TRASY will prepare
            an adversarial evaluation against it.
          </p>

          <div className="zt-secure-note">
            <span className="zt-secure-dot"></span>
            Your endpoint stays in this evaluation session
          </div>
        </div>

        <div className="zt-test-core">
          <div className="zt-orbit orbit-one"></div>
          <div className="zt-orbit orbit-two"></div>
          <div className="zt-orbit orbit-three"></div>

          <div className="zt-core-glow">
            <div className="zt-core-inner">
              <strong>AI</strong>
              <small>TRASY CORE</small>
            </div>
          </div>

          <div className="zt-core-status">
            <span></span>
            READY
          </div>

          <div className="zt-core-label">
            AUTONOMOUS<br />
            EVALUATION ENGINE
          </div>
        </div>
      </section>

      <section className="zt-connect-section">
        <div className="zt-section-heading">
          <div>
            <span className="zt-section-number">01 / ENDPOINT</span>
            <h2>Agent Connection</h2>
          </div>

          <span className="zt-live-badge">
            ● SESSION READY
          </span>
        </div>

        <form className="zt-connect-card" onSubmit={handleConnect}>
          <div className="zt-form-grid">
            <label>
              <span>Agent Name</span>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g. Research Copilot"
                maxLength={200}
                required
                disabled={loading}
              />
            </label>

            <label className="zt-full-field">
              <span>Agent API Endpoint</span>
              <input
                type="url"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://your-agent.com/api/"
                required
                disabled={loading}
              />
            </label>

            <label>
              <span>Method</span>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                disabled={loading}
              >
                <option>POST</option>
                <option>GET</option>
                <option>PUT</option>
              </select>
            </label>

            <label>
              <span>Authentication</span>
              <select
                value={auth}
                onChange={(e) => setAuth(e.target.value)}
                disabled={loading}
              >
                <option>NONE</option>
                <option>API KEY</option>
                <option>BEARER TOKEN</option>
              </select>
            </label>
          </div>

          {error && (
            <div style={{ marginTop: "16px", color: "#ff6fae", fontSize: "13px" }}>
              {error}
            </div>
          )}

          <div className="zt-form-footer">
            <p>
              <span>i</span>
              TRASY will generate 5 adversarial scenarios and evaluate execution across multi-model consensus.
            </p>

            <button type="submit" className="zt-connect-button" disabled={loading}>
              {loading ? "INITIALIZING TASK..." : "CONNECT & EVALUATE →"}
            </button>
          </div>
        </form>
      </section>

      <section className="zt-evaluation-preview">
        <div className="zt-preview-card">
          <span className="zt-preview-label">TRASY ENGINE</span>

          <h3>
            Ready to stress-test
            <br />
            your AI agent.
          </h3>

          <div className="zt-preview-items">
            <div>
              <strong>01</strong>
              <span>Behavioral Analysis</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Adversarial Scenarios</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Reliability Scoring</span>
            </div>
          </div>
        </div>

        <div className="zt-evaluation-stats">
          <div>
            <strong>56+</strong>
            <span>CHECKS</span>
          </div>

          <div>
            <strong>10</strong>
            <span>DIMENSIONS</span>
          </div>

          <div>
            <strong>∞</strong>
            <span>SCENARIOS</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default TestAI;
