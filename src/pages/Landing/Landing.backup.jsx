import { Link } from "react-router-dom";
import "../../styles/landing.css";

import zeroTraceLogo from "../../assets/branding/zerotrace-main-logo.png";

function Landing() {
  return (
    <main className="zt-home">

      {/* HERO */}
      <section className="zt-hero">

        <div className="zt-hero-copy">

          <div className="zt-eyebrow">
            <span className="zt-live-dot"></span>
            TRASY / AUTONOMOUS AI EVALUATION ENGINE
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
              <span>✦</span>
              BREAK MY AI
              <span>↗</span>
            </Link>

            <Link to="/trasy" className="zt-secondary-cta">
              Explore TRASY
              <span>↗</span>
            </Link>
          </div>

          <div className="zt-hero-stats">
            <div>
              <strong>56+</strong>
              <span>EVALUATION CHECKS</span>
            </div>

            <div>
              <strong>10</strong>
              <span>RELIABILITY DIMENSIONS</span>
            </div>

            <div>
              <strong>LIVE</strong>
              <span>BEHAVIORAL TRACE</span>
            </div>
          </div>

        </div>

        {/* AI CORE */}
        <div className="zt-ai-stage">

          <div className="zt-orbit orbit-one"></div>
          <div className="zt-orbit orbit-two"></div>
          <div className="zt-orbit orbit-three"></div>

          <div className="zt-scan-line"></div>

          <div className="zt-ai-core">

            <div className="zt-core-status">
              <span></span>
              TRASY CORE
              <b>ONLINE</b>
            </div>

            <div className="zt-neural">
              <div className="zt-node node-top">AI</div>
              <div className="zt-node node-left">S</div>
              <div className="zt-node node-right">R</div>
              <div className="zt-node node-bottom">T</div>

              <div className="zt-core-circle">
                <div className="zt-core-z">Z</div>
                <small>TRASY</small>
              </div>
            </div>

            <div className="zt-core-footer">
              <span>LIVE TRACE</span>
              <strong>COLLECTING</strong>
            </div>

          </div>

          <div className="zt-floating-card card-scenario">
            <span>◉</span>
            <div>
              <small>SCENARIOS</small>
              <strong>ADVERSARIAL</strong>
            </div>
          </div>

          <div className="zt-floating-card card-safety">
            <span>⌁</span>
            <div>
              <small>SAFETY</small>
              <strong>MONITORED</strong>
            </div>
          </div>

          <div className="zt-floating-card card-trace">
            <span>⌁</span>
            <div>
              <small>TRACE</small>
              <strong>STREAMING</strong>
            </div>
          </div>

        </div>
      </section>

      {/* TRUST BAR */}
      <section className="zt-trust-bar">
        <div>
          <span className="zt-bar-number">01</span>
          <strong>CONNECT</strong>
          <small>Agent endpoint</small>
        </div>

        <i></i>

        <div>
          <span className="zt-bar-number">02</span>
          <strong>ATTACK</strong>
          <small>Adversarial missions</small>
        </div>

        <i></i>

        <div>
          <span className="zt-bar-number">03</span>
          <strong>OBSERVE</strong>
          <small>Behavioral traces</small>
        </div>

        <i></i>

        <div>
          <span className="zt-bar-number">04</span>
          <strong>SCORE</strong>
          <small>Reliability signal</small>
        </div>

        <i></i>

        <div>
          <span className="zt-bar-number">05</span>
          <strong>REPORT</strong>
          <small>Evidence & findings</small>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="zt-section zt-how">

        <div className="zt-section-heading">
          <div>
            <span>TRASY / EVALUATION PIPELINE</span>
            <h2>Know exactly<br /><em>where AI breaks.</em></h2>
          </div>

          <p>
            TRASY doesn't just ask questions. It observes how an agent behaves
            under pressure and converts that behavior into measurable evidence.
          </p>
        </div>

        <div className="zt-process-grid">

          <article>
            <span>01</span>
            <div className="zt-process-icon">◎</div>
            <h3>Agent Intake</h3>
            <p>Connect an AI agent and understand its capabilities, tools and goals.</p>
          </article>

          <article>
            <span>02</span>
            <div className="zt-process-icon">⌁</div>
            <h3>Adversarial Missions</h3>
            <p>Generate controlled scenarios designed to expose behavioral weaknesses.</p>
          </article>

          <article>
            <span>03</span>
            <div className="zt-process-icon">◌</div>
            <h3>Trace Analysis</h3>
            <p>Capture decisions, tool calls, failures, recovery and consistency.</p>
          </article>

          <article>
            <span>04</span>
            <div className="zt-process-icon">✓</div>
            <h3>Reliability Score</h3>
            <p>Transform evidence into a transparent multi-dimensional score.</p>
          </article>

        </div>
      </section>

      {/* DIMENSIONS */}
      <section className="zt-section zt-dimensions">

        <div className="zt-section-heading compact">
          <div>
            <span>56+ SIGNALS / 10 DIMENSIONS</span>
            <h2>One score is never<br /><em>the whole story.</em></h2>
          </div>
        </div>

        <div className="zt-dimension-grid">
          {[
            ["01", "Goal Alignment"],
            ["02", "Instruction Following"],
            ["03", "Safety"],
            ["04", "Tool Reliability"],
            ["05", "Reasoning & Decision"],
            ["06", "Robustness"],
            ["07", "Failure Recovery"],
            ["08", "Consistency"],
            ["09", "Efficiency"],
            ["10", "Observability"]
          ].map(([number, title]) => (
            <div className="zt-dimension" key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <div className="zt-mini-line">
                <i></i>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* FINAL CTA */}
      <section className="zt-final-cta">

        <div className="zt-final-glow"></div>

        <img
          src={zeroTraceLogo}
          alt="ZeroTrace"
          className="zt-home-logo"
        />

        <span>ZERO TRACE / TRASY</span>

        <h2>
          Don't trust your AI.
          <br />
          <em>Test it.</em>
        </h2>

        <p>
          Put your agent through controlled adversarial evaluation and
          discover its real reliability before your users do.
        </p>

        <Link to="/test-ai" className="zt-primary-cta">
          START EVALUATION
          <span>↗</span>
        </Link>

      </section>

    </main>
  );
}

export default Landing;
