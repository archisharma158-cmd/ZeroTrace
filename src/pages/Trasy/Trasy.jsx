import {
  Bot,
  ShieldCheck,
  Activity,
  Search,
  FileCheck2,
  ArrowUpRight,
  Zap
} from "lucide-react";
import "../../styles/trasy.css";

const features = [
  {
    icon: Bot,
    number: "01",
    title: "AI Stress Testing",
    text: "Put autonomous AI agents through controlled adversarial scenarios and unexpected conditions."
  },
  {
    icon: Search,
    number: "02",
    title: "Behavior Analysis",
    text: "Observe decisions, tool usage, reasoning patterns and behavioral inconsistencies."
  },
  {
    icon: Activity,
    number: "03",
    title: "Trace Intelligence",
    text: "Capture execution traces and transform raw agent activity into measurable evidence."
  },
  {
    icon: ShieldCheck,
    number: "04",
    title: "Reliability Scoring",
    text: "Evaluate agent behavior across multiple reliability dimensions instead of a single score."
  },
  {
    icon: FileCheck2,
    number: "05",
    title: "Evidence Reports",
    text: "Generate structured reports containing failures, severity, evidence and recommendations."
  },
  {
    icon: Zap,
    number: "06",
    title: "Failure Simulation",
    text: "Deliberately introduce difficult situations to discover weaknesses before deployment."
  }
];

function Trasy() {
  return (
    <main className="trasy-page">

      <section className="trasy-hero">

        <div className="trasy-hero-copy">

          <span className="trasy-kicker">
            TRASY / AUTONOMOUS AI RELIABILITY ENGINE
          </span>

          <h1>
            Don't just
            <br />
            trust your <em>AI.</em>
            <br />
            <strong>Test it.</strong>
          </h1>

          <p>
            TRASY is the autonomous AI reliability engine inside
            ZeroTrace. It stress-tests AI agents, observes their
            behavior and converts every execution trace into
            measurable reliability evidence.
          </p>

          <div className="trasy-actions">
            <a href="/test-ai" className="trasy-primary">
              TEST YOUR AI
              <ArrowUpRight size={17} />
            </a>

            <a href="/about" className="trasy-secondary">
              LEARN ABOUT TRASY
            </a>
          </div>

        </div>

        <div className="trasy-core">

          <div className="trasy-core-grid"></div>

          <div className="trasy-orbit orbit-one"></div>
          <div className="trasy-orbit orbit-two"></div>
          <div className="trasy-orbit orbit-three"></div>

          <div className="trasy-scan"></div>
          <div className="trasy-ai-node"><div className="trasy-core-radar"><span></span><span></span><span></span></div><div className="trasy-ai-symbol">AI</div></div>

          <div className="trasy-status">
            <span className="status-dot"></span>
            TRASY CORE ONLINE
          </div>

          <div className="trasy-floating floating-threat">
            <small>THREAT LEVEL</small>
            <strong>HIGH</strong>
          </div>

          <div className="trasy-floating floating-analysis">
            <small>AI ANALYSIS</small>
            <strong>RUNNING</strong>
          </div>

          <div className="trasy-floating floating-score">
            <small>RELIABILITY</small>
            <strong>87.4%</strong>
          </div>

          <div className="trasy-core-label">
            <strong>TRASY</strong>
            <span>AUTONOMOUS EVALUATION ENGINE</span>
          </div>

        </div>

      </section>

      <section className="trasy-intro">

        <span>01 / WHAT IS TRASY?</span>

        <div>
          <h2>
            Reliability shouldn't be
            <em> assumed.</em>
            <br />
            It should be <strong>tested.</strong>
          </h2>

          <p>
            Modern AI agents can plan, reason, call external tools and
            operate with increasing autonomy. TRASY is designed to
            challenge these systems before their behavior becomes a
            production problem.
          </p>

          <p>
            Instead of only checking the final answer, TRASY evaluates
            the complete behavioral trace — what the agent attempted,
            how it reacted to failures, whether it followed constraints
            and how consistently it behaved under pressure.
          </p>
        </div>

      </section>

      <section className="trasy-features">

        <div className="trasy-section-heading">
          <span>02 / ENGINE CAPABILITIES</span>
          <h2>Inside the <em>engine.</em></h2>
        </div>

        <div className="trasy-feature-grid">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article className="trasy-feature-card" key={feature.number}>

                <div className="feature-top">
                  <span>{feature.number}</span>
                  <Icon size={23} />
                </div>

                <h3>{feature.title}</h3>

                <p>{feature.text}</p>

              </article>
            );
          })}

        </div>

      </section>

      <section className="trasy-dimensions">
        <div className="trasy-section-heading"><span>03 / RELIABILITY DIMENSIONS</span><h2>Signals that make <em>behavior measurable.</em></h2></div>
        <div className="dimension-grid">
          {[['Behavioral Consistency',91],['Decision Stability',86],['Instruction Following',94],['Safety Boundaries',89],['Adaptation',82],['Failure Recovery',78]].map(([label, score]) => <article key={label}><div><strong>{label}</strong><span>{score}%</span></div><div className="dimension-track"><i style={{width:`${score}%`}} /></div></article>)}
        </div>
        <div className="trasy-evidence-grid"><article><span>MISSION CONTROL</span><h3>Adversarial Scenarios</h3><p>Coordinate controlled missions that surface edge cases and unsafe behavior.</p></article><article><span>BEHAVIORAL EVIDENCE</span><h3>Trace Analysis</h3><p>Inspect decisions, tool calls, constraint adherence and recovery paths.</p></article><article><span>OUTPUT SIGNAL</span><h3>Reliability Score</h3><p>Convert observed evidence into interpretable, comparable reliability measures.</p></article></div>
      </section>

      <section className="trasy-pipeline">

        <span>03 / EVALUATION PIPELINE</span>

        <h2>
          From <em>behavior</em>
          <br />
          to evidence.
        </h2>

        <div className="pipeline-line">

          <div>
            <b>01</b>
            <strong>SCENARIO</strong>
            <span>Adversarial mission</span>
          </div>

          <div>
            <b>02</b>
            <strong>EXECUTE</strong>
            <span>Agent behavior</span>
          </div>

          <div>
            <b>03</b>
            <strong>TRACE</strong>
            <span>Evidence collection</span>
          </div>

          <div>
            <b>04</b>
            <strong>ANALYZE</strong>
            <span>Behavior evaluation</span>
          </div>

          <div>
            <b>05</b>
            <strong>REPORT</strong>
            <span>Reliability result</span>
          </div>

        </div>

      </section>

      <section className="trasy-cta">

        <div>
          <span>ZEROTRACE / TRASY</span>

          <h2>
            Ready to break
            <br />
            your <em>AI?</em>
          </h2>

          <p>
            Run your first reliability evaluation and discover
            what your AI does when things don't go as planned.
          </p>
        </div>

        <a href="/test-ai">
          START EVALUATION
          <ArrowUpRight size={19} />
        </a>

      </section>

    </main>
  );
}

export default Trasy;


