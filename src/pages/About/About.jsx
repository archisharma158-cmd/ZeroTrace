import {
  Radar,
  ShieldCheck,
  Activity,
  FileCheck2,
  Target,
  Eye,
  ArrowUpRight
} from "lucide-react";
import "../../styles/about.css";

const capabilities = [
  {
    icon: Radar,
    title: "Adversarial Testing",
    text: "TRASY evaluates autonomous AI agents under controlled and challenging scenarios."
  },
  {
    icon: ShieldCheck,
    title: "Safety & Reliability",
    text: "Identify unsafe, inconsistent and unreliable agent behavior before deployment."
  },
  {
    icon: Activity,
    title: "Behavioral Analysis",
    text: "Analyze how an AI agent behaves throughout an entire execution trace."
  },
  {
    icon: FileCheck2,
    title: "Trace Collection",
    text: "Turn execution traces into structured reliability reports and actionable findings."
  },
  { icon: Target, title: "Failure Simulation", text: "Reproduce controlled failures and reveal weak recovery paths." },
  { icon: ShieldCheck, title: "AI Safety Monitoring", text: "Monitor constraint adherence and safety boundaries across each run." }
];

function About() {
  return (
    <main className="zt-about">

      <section className="about-hero">
        <div>
          <span className="about-kicker">
            ZEROTRACE / ABOUT THE PLATFORM
          </span>

          <h1>
            About <em>ZeroTrace</em>
          </h1>

          <p>
            Making autonomous AI systems measurable, testable and trustworthy.
          </p>
        </div>

        <div className="about-visual">
          <div className="about-orbit orbit-a"></div>
          <div className="about-orbit orbit-b"></div>

          <div className="about-core"><div className="about-scan-line"></div><div className="about-core-symbol">ZT</div>
            
          </div>

          <span className="about-node node-one">TRACE</span>
          <span className="about-node node-two">ANALYZE</span>
          <span className="about-node node-three">VERIFY</span>

          <div className="about-core-label">
            <strong>ZEROTRACE</strong>
            <span>AI RELIABILITY INFRASTRUCTURE</span>
          </div>
        </div>
      </section>

      <section className="about-story">
        <span>01 / OUR PURPOSE</span>

        <div>
          <h2>
            AI is becoming
            <br />
            <em>autonomous.</em>
          </h2>

          <p>
            AI agents are moving beyond simple conversations. They can
            reason, make decisions, use tools, interact with systems and
            complete multi-step tasks.
          </p>

          <p>
            But capability alone does not guarantee reliability.
            An agent can produce a correct answer in one situation and
            behave unexpectedly in another.
          </p>

          <p>
            ZeroTrace exists to make that behavior visible, measurable
            and testable.
          </p>
        </div>
      </section>

      <section className="about-trasy">

        <div className="about-section-heading">
          <span>02 / THE CORE ENGINE</span>

          <h2>
            Meet <em>TRASY.</em>
          </h2>

          <p>
            TRASY — the Autonomous AI Reliability Engine — is the
            evaluation system at the heart of ZeroTrace.
          </p>
        </div>

        <div className="trasy-flow">

          <div className="flow-card">
            <b>01</b>
            <Eye />
            <strong>OBSERVE</strong>
            <span>Collect behavior and traces</span>
          </div>

          <div className="flow-line"></div>

          <div className="flow-card">
            <b>02</b>
            <Radar />
            <strong>STRESS TEST</strong>
            <span>Run adversarial missions</span>
          </div>

          <div className="flow-line"></div>

          <div className="flow-card">
            <b>03</b>
            <Activity />
            <strong>ANALYZE</strong>
            <span>Find behavioral signals</span>
          </div>

          <div className="flow-line"></div>

          <div className="flow-card">
            <b>04</b>
            <FileCheck2 />
            <strong>SCORE</strong>
            <span>Measure reliability signals</span>
          </div>

        </div>
      </section>

      <section className="about-capabilities">

        <div className="about-section-heading">
          <span>03 / WHAT WE DO</span>

          <h2>
            Reliability by
            <br />
            <em>design.</em>
          </h2>
        </div>

        <div className="capability-grid">
          {capabilities.map((item) => {
            const Icon = item.icon;

            return (
              <article className="capability-card" key={item.title}>
                <Icon size={28} />

                <h3>{item.title}</h3>

                <p>{item.text}</p>

                <span>ZERO TRACE / VERIFIED</span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="about-mission">

        <div className="mission-card">
          <Target size={30} />

          <span>OUR MISSION</span>

          <h2>
            Make autonomous AI
            <br />
            <em>measurably reliable.</em>
          </h2>

          <p>
            We believe AI reliability should not be based only on
            assumptions, demos or final outputs. It should be supported
            by traces, evidence, testing and measurable signals.
          </p>
        </div>

        <div className="mission-side">
          <div>
            <strong>TRACE</strong>
            <span>Observe what happened.</span>
          </div>

          <div>
            <strong>TEST</strong>
            <span>Challenge what could happen.</span>
          </div>

          <div>
            <strong>TRUST</strong>
            <span>Measure what can be trusted.</span>
          </div>
        </div>

      </section>

      <section className="about-university">
        <span>05 / BUILT TOGETHER</span>
        <h2>ZERO TRACE</h2>
        <p>Built by:</p>
        <div><strong>Parth Goyal</strong><strong>Archi Sharma</strong><strong>Annu Sharma</strong></div>
        <p>Quantum University, Roorkee</p>
      </section>

      <section className="about-cta">

        <div>
          <span>ZEROTRACE / NEXT STEP</span>

          <h2>
            Ready to test an
            <br />
            <em>AI system?</em>
          </h2>

          <p>
            Put your AI agent through a real reliability evaluation
            with TRASY.
          </p>
        </div>

        <div className="about-cta-actions"><a href="/test-ai">TEST YOUR AI <ArrowUpRight size={18} /></a><a className="about-cta-secondary" href="/trasy">EXPLORE TRASY</a></div>

      </section>

    </main>
  );
}

export default About;


