import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Radar,
  ShieldCheck,
  Terminal,
  Zap,
  TrendingUp
} from "lucide-react";

import { createDemoEvaluation } from "../../data/demoEvaluation";

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

  const [activeStage, setActiveStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 2, 100);

        const stage = Math.min(
          Math.floor(next / (100 / stages.length)),
          stages.length - 1
        );

        setActiveStage(stage);

        if (next === 100) {
          clearInterval(interval);

          setTimeout(() => {
            const result = createDemoEvaluation();
            sessionStorage.setItem("zerotrace_evaluation", JSON.stringify(result));
            const history = JSON.parse(localStorage.getItem("zerotrace_history") || "[]");
            history.unshift({
              id: result.evaluationId || Date.now().toString(),
              agent: result.agent || "AI Agent",
              score: result.score ?? 0,
              date: new Date().toLocaleString(),
            });
            localStorage.setItem("zerotrace_history", JSON.stringify(history));
            setEvaluation(result);
          }, 500);
        }

        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  const complete = progress === 100 && evaluation;

  const failures = evaluation
    ? Object.values(evaluation.results).filter(
        (item) =>
          item.status === "FAIL" ||
          item.status === "PARTIAL"
      ).length
    : 0;

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
          <span className="status-dot" />
          {complete
            ? "EVALUATION COMPLETE"
            : "ENGINE RUNNING"}
        </div>

      </header>


      <section className="evaluation-main">

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
              <b>56</b> checks
            </span>

            <span>
              <b>10</b> dimensions
            </span>

            <span>
              <b>LIVE</b> trace
            </span>

          </div>

        </div>


        <div className="evaluation-grid">

          <section className="stage-card">

            <div className="card-heading">
              <span>EVALUATION PIPELINE</span>
              <small>TRASY CORE</small>
            </div>

            <div className="stage-list">

              {stages.map(([name, description, Icon], index) => {

                const done =
                  complete || index < activeStage;

                const running =
                  !complete && index === activeStage;

                return (
                  <div
                    key={name}
                    className={`stage ${
                      done ? "completed" : ""
                    } ${
                      running ? "running" : ""
                    }`}
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
                <p>Agent session initialized</p>
              </div>

              <div>
                <span className="trace-time">00:03</span>
                <p>Behavioral baseline established</p>
              </div>

              <div>
                <span className="trace-time">00:06</span>
                <p>Adversarial scenarios generated</p>
              </div>

              <div>
                <span className="trace-time">00:09</span>
                <p>56 evaluation checks executed</p>
              </div>

              <div>
                <span className="trace-time">00:12</span>

                <p className="warning">
                  Reliability deviations detected
                </p>
              </div>

              <div>
                <span className="trace-time">00:15</span>

                <p>
                  Failure classification completed
                </p>
              </div>

              <span className="cursor">▋</span>

            </div>

          </section>

        </div>


        {complete && (

          <>

            <section className="result-card">

              <div className="result-score">

                <span>TRASY RELIABILITY SCORE</span>

                <strong>
                  {evaluation.scoring.overall}
                </strong>

                <small>
                  / 100
                </small>

              </div>


              <div className="result-summary">

                <div>
                  <small>GRADE</small>

                  <strong>
                    {evaluation.scoring.overall >= 90
                      ? "EXCELLENT"
                      : evaluation.scoring.overall >= 80
                      ? "STRONG"
                      : evaluation.scoring.overall >= 70
                      ? "MODERATE"
                      : "NEEDS ATTENTION"}
                  </strong>
                </div>

                <div>
                  <small>CHECKS</small>
                  <strong>56</strong>
                </div>

                <div>
                  <small>DEVIATIONS</small>
                  <strong>{failures}</strong>
                </div>

              </div>

            </section>


            <section className="dimension-card">

              <div className="card-heading">
                <span>RELIABILITY DIMENSIONS</span>
                <small>WEIGHTED ANALYSIS</small>
              </div>

              <div className="dimension-grid">

                {Object.entries(
                  evaluation.scoring.categories
                ).map(([category, score]) => (

                  <div
                    className="dimension"
                    key={category}
                  >

                    <div className="dimension-top">

                      <span>{category}</span>

                      <strong>
                        {score}
                      </strong>

                    </div>

                    <div className="dimension-bar">

                      <div
                        style={{
                          width: `${score}%`
                        }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </section>


            <div className="evaluation-complete">

              <div>

                <span>
                  TRASY ANALYSIS COMPLETE
                </span>

                <h2>
                  Reliability signal generated.
                </h2>

                <p>
                  TRASY evaluated the agent across 56
                  reliability checks and generated
                  evidence-backed results.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/mission-control")
                }
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



