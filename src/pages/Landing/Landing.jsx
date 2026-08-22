import { ArrowUpRight, Activity, ShieldCheck, Bot, Radar, Zap, ScanSearch } from "lucide-react";
import zerotraceLogo from "../../../logo.jpeg";
import trasyLogo from "../../assets/branding/trasy-logo.jpeg";
import { Link } from "react-router-dom";
import "../../styles/landing.css";

function Landing() {
  return (
    <main className="zt-home">

      <section className="zt-hero">

        <div className="zt-hero-copy">
          <div className="zt-brand-lockup">
            <img src={zerotraceLogo} alt="ZeroTrace" />
            <span>ZEROTRACE</span>
          </div>
          <div className="zt-eyebrow">
            <span className="zt-pulse"></span>
            TRASY / AUTONOMOUS AI RELIABILITY ENGINE
          </div>

          <h1>
            Break your AI
            <br />
            <span>before it breaks.</span>
          </h1>

          <p className="zt-hero-description">
            ZeroTrace stress-tests autonomous AI agents through adversarial
            missions, behavioral analysis and failure simulation — turning
            every trace into a measurable reliability signal.
          </p>

          <div className="zt-hero-actions">
            <Link to="/test-ai" className="zt-primary-cta">
              <Zap size={18} />
              BREAK MY AI
              <ArrowUpRight size={17} />
            </Link>

            <Link to="/trasy" className="zt-secondary-cta">
              Explore TRASY
              <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="zt-hero-meta">
            <div>
              <strong>56+</strong>
              <span>evaluation checks</span>
            </div>
            <div>
              <strong>10</strong>
              <span>reliability dimensions</span>
            </div>
            <div>
              <strong>LIVE</strong>
              <span>behavioral trace</span>
            </div>
          </div>
        </div>

        <div className="zt-ai-stage">

          <div className="zt-orbit orbit-one"></div>
          <div className="zt-orbit orbit-two"></div>
          <div className="zt-orbit orbit-three"></div>

          <div className="zt-scan-line"></div>

          <div className="zt-ai-card">
            <div className="zt-card-top">
              <span>TRASY AI CORE</span>
              <span className="zt-online">
                <i></i> ONLINE
              </span>
            </div>

            <div className="zt-ai-entity premium-ai-core">
<div className="ai-core-header"><span>TRASY AI CORE</span><b><i></i> ONLINE</b></div>
<div className="ai-brain-stage">
<div className="brain-orbit orbit-a"></div>
<div className="brain-orbit orbit-b"></div>
<div className="brain-orbit orbit-c"></div>
<div className="neural-brain">
<span className="brain-node bn1"></span><span className="brain-node bn2"></span><span className="brain-node bn3"></span><span className="brain-node bn4"></span><span className="brain-node bn5"></span><span className="brain-node bn6"></span>
<div className="brain-lines"></div>
<div className="brain-center"></div>
</div>
<div className="ai-status-panel"><small>AI CORE STATUS</small><strong>ANALYZING</strong></div>
<div className="ai-capabilities"><span>● Perception</span><span>● Reasoning</span><span>● Memory</span><span>● Planning</span><span>● Adaptation</span></div>
</div>
<div className="ai-threat-panel"><small>THREAT LEVEL</small><strong>HIGH</strong><div className="threat-bars"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
<div className="ai-signal-panel"><small>SIGNAL STREAM</small><div className="signal-wave">〰〰╱╲〰╱╲〰〰</div></div>
<div className="ai-mission"><small>MISSION STATUS</small><strong>ANALYZING AGENT BEHAVIOR</strong><span>78%</span><div><i></i></div></div>
</div>

            <h2>TRASY</h2>
            <p>AUTONOMOUS EVALUATION ENGINE</p>

            <div className="zt-core-status">
              <span>MISSION STATUS</span>
              <strong>READY</strong>
            </div>

            <div className="zt-core-bar">
              <span></span>
            </div>

            <div className="zt-core-grid">
              <div>
                <strong>56</strong>
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
          </div>

          <div className="zt-floating-card trace-card">
            <Activity size={17} />
            <div>
              <span>TRACE</span>
              <strong>COLLECTING</strong>
            </div>
          </div>

          <div className="zt-floating-card safety-card">
            <ShieldCheck size={17} />
            <div>
              <span>SAFETY</span>
              <strong>MONITORED</strong>
            </div>
          </div>

          <div className="zt-floating-card scenario-card">
            <Radar size={17} />
            <div>
              <span>SCENARIOS</span>
              <strong>ADVERSARIAL</strong>
            </div>
          </div>

          <div className="zt-neural-dot dot-one"></div>
          <div className="zt-neural-dot dot-two"></div>
          <div className="zt-neural-dot dot-three"></div>
        </div>

      </section>

      <section className="zt-proof-strip">
        <div>
          <span>ENGINE</span>
          <strong>TRASY v0.1</strong>
        </div>
        <div>
          <span>MODE</span>
          <strong>ADVERSARIAL</strong>
        </div>
        <div>
          <span>TRACE</span>
          <strong>LIVE</strong>
        </div>
        <div>
          <span>STATUS</span>
          <strong className="status-ready">● READY</strong>
        </div>
      </section>

      <section className="zt-how">
        <div className="zt-section-heading">
          <span>01 / EVALUATION PIPELINE</span>
          <h2>From agent to<br /><em>evidence.</em></h2>
          <p>
            TRASY doesn't just ask questions. It observes how an AI agent
            behaves under pressure and converts that behavior into evidence.
          </p>
        </div>

        <div className="zt-pipeline">

          <div className="zt-step">
            <div className="zt-step-icon"><ScanSearch /></div>
            <span>01</span>
            <h3>Connect</h3>
            <p>Connect your AI agent endpoint securely.</p>
          </div>

          <div className="zt-step">
            <div className="zt-step-icon"><Radar /></div>
            <span>02</span>
            <h3>Attack</h3>
            <p>Generate adversarial missions and edge cases.</p>
          </div>

          <div className="zt-step">
            <div className="zt-step-icon"><Activity /></div>
            <span>03</span>
            <h3>Observe</h3>
            <p>Capture actions, decisions, failures and traces.</p>
          </div>

          <div className="zt-step">
            <div className="zt-step-icon"><Bot /></div>
            <span>04</span>
            <h3>Score</h3>
            <p>Convert behavioral evidence into reliability signals.</p>
          </div>

        </div>
      </section>

      <section className="zt-dimensions">
        <div className="zt-dimension-copy">
          <span>02 / RELIABILITY INTELLIGENCE</span>
          <h2>Don't trust the<br /><em>demo.</em></h2>
          <p>
            Measure what happens when your AI encounters ambiguous,
            adversarial and unexpected situations.
          </p>

          <Link to="/test-ai" className="zt-outline-cta">
            Start an evaluation <ArrowUpRight size={17} />
          </Link>
        </div>

        <div className="zt-dimension-grid">
          {[
            ["GOAL ALIGNMENT", "83"],
            ["INSTRUCTION FOLLOWING", "89"],
            ["SAFETY", "76"],
            ["TOOL RELIABILITY", "75"],
            ["REASONING", "90"],
            ["ROBUSTNESS", "86"],
            ["FAILURE RECOVERY", "92"],
            ["CONSISTENCY", "71"],
          ].map(([name, score]) => (
            <div className="zt-dimension" key={name}>
              <div>
                <span>{name}</span>
                <strong>{score}</strong>
              </div>
              <div className="zt-mini-bar">
                <i style={{ width: `${score}%` }}></i>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="zt-final-cta">
        <div className="zt-final-glow"></div>
        <span>TRASY / READY</span>
        <h2>Find out where<br /><em>your AI breaks.</em></h2>
        <p>Run your first adversarial evaluation with ZeroTrace.</p>
        <Link to="/test-ai" className="zt-primary-cta">
          Test Your AI
          <ArrowUpRight size={18} />
        </Link>
      </section>

    </main>
  );
}

export default Landing;











