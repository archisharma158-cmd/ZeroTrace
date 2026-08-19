import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Lock, FileText, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Report() {
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("zerotrace_evaluation");

    if (saved) {
      try {
        setEvaluation(JSON.parse(saved));
      } catch {
        setEvaluation(null);
      }
    }
  }, []);

  const score =
    evaluation?.scoring?.overall ??
    evaluation?.overall ??
    83;

  return (
    <div className="report-page">

      <header className="report-header">

        <button
          className="report-back"
          onClick={() => navigate("/investigation")}
        >
          <ArrowLeft size={15} />
          BACK TO INVESTIGATION
        </button>

        <div className="report-kicker">
          TRASY / RELIABILITY REPORT
        </div>

        <h1>
          Your agent's
          <span>reliability signal.</span>
        </h1>

        <p>
          TRASY has completed the adversarial evaluation.
          Here's the public preview of the generated report.
        </p>

      </header>


      <main className="report-main">

        <section className="report-hero-card">

          <div className="report-score">

            <small>
              TRASY RELIABILITY SCORE
            </small>

            <strong>
              {score}
            </strong>

            <span>/100</span>

          </div>


          <div className="report-verdict">

            <small>
              EVALUATION VERDICT
            </small>

            <h2>
              {score >= 90
                ? "Highly Reliable"
                : score >= 80
                ? "Strong, with observed weaknesses"
                : score >= 70
                ? "Moderate reliability"
                : "Needs attention"}
            </h2>

            <p>
              The agent completed the evaluation,
              but TRASY identified behavioral deviations
              that should be investigated before production use.
            </p>

          </div>

        </section>


        <section className="report-overview">

          <div>
            <FileText size={17} />
            <small>CHECKS</small>
            <strong>56</strong>
          </div>

          <div>
            <ShieldCheck size={17} />
            <small>DIMENSIONS</small>
            <strong>10</strong>
          </div>

          <div>
            <Lock size={17} />
            <small>FULL REPORT</small>
            <strong>AUTH REQUIRED</strong>
          </div>

        </section>


        <section className="preview-section">

          <div className="preview-heading">

            <div>
              <span>REPORT PREVIEW</span>
              <h2>What TRASY found</h2>
            </div>

            <small>
              PUBLIC SUMMARY
            </small>

          </div>


          <div className="preview-grid">

            <article>
              <span>01</span>
              <small>RELIABILITY</small>
              <h3>
                Multi-dimensional score
              </h3>
              <p>
                TRASY combines 56 checks across
                ten reliability dimensions.
              </p>
            </article>

            <article>
              <span>02</span>
              <small>FAILURE ANALYSIS</small>
              <h3>
                Evidence-backed deviations
              </h3>
              <p>
                Failures are linked to scenarios,
                traces and observed behavior.
              </p>
            </article>

            <article>
              <span>03</span>
              <small>REGRESSION</small>
              <h3>
                Baseline for future runs
              </h3>
              <p>
                Future evaluations can be compared
                against this reliability baseline.
              </p>
            </article>

          </div>

        </section>


        <section className="login-gate">

          <div className="gate-icon">
            <Lock size={20} />
          </div>

          <div className="gate-content">

            <span>
              FULL REPORT LOCKED
            </span>

            <h2>
              See everything TRASY discovered.
            </h2>

            <p>
              Create a free account to unlock the complete
              reliability report, detailed failure evidence,
              recommendations, trace analysis and downloadable
              report.
            </p>

            <div className="report-download-lock">
  <div className="download-lock-icon">
    <Lock size={16} />
  </div>

  <div>
    <strong>FULL REPORT PDF</strong>
    <span>
      Login required to download the complete TRASY report.
    </span>
  </div>

  <button
    type="button"
    onClick={() => navigate("/auth")}
  >
    LOGIN TO DOWNLOAD
    <ArrowRight size={14} />
  </button>
</div>

<div className="gate-features">

              <span>✓ 56 metric results</span>
              <span>✓ Failure evidence</span>
              <span>✓ Trace analysis</span>
              <span>✓ Recommendations</span>
              <span>✓ Downloadable report</span>

            </div>

            <button
              onClick={() => navigate("/auth")}
            >
              CREATE FREE ACCOUNT
              <ArrowRight size={16} />
            </button>

            <button
              className="login-link"
              onClick={() => navigate("/auth")}
            >
              Already have an account? Sign in
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Report;

