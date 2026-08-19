import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/testai.css";

function TestAI() {
  const [agentName, setAgentName] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [method, setMethod] = useState("POST");
  const [auth, setAuth] = useState("NONE");
  const [connected, setConnected] = useState(false);

  const handleConnect = (e) => {
    e.preventDefault();

    if (!agentName.trim() || !endpoint.trim()) {
      return;
    }

    setConnected(true);
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
              />
            </label>


            <label className="zt-full-field">
              <span>Agent API Endpoint</span>
              <input
                type="url"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://your-agent.com/api/"
              />
            </label>


            <label>
              <span>Method</span>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
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
              >
                <option>NONE</option>
                <option>API KEY</option>
                <option>BEARER TOKEN</option>
              </select>
            </label>

          </div>


          <div className="zt-form-footer">

            <p>
              <span>i</span>
              TRASY will use this endpoint when the evaluation
              backend is connected.
            </p>

            <button type="submit" className="zt-connect-button">
              {connected ? "AGENT CONNECTED ✓" : "CONNECT AGENT →"}
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
