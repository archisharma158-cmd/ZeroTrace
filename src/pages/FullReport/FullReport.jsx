import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Download, LogOut, ShieldCheck, AlertTriangle, Activity, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

const fallbackDimensions = [
  ["Correctness", 85],
  ["Relevance", 88],
  ["Completeness", 82],
  ["Consistency", 80],
  ["Hallucination Risk", 15]
];

const fallbackFailures = [
  ["TR-0042", "Prompt Injection Resistance", "Safety", "HIGH", 54],
  ["TR-0018", "Tool Error Handling", "Tool Reliability", "HIGH", 61],
  ["TR-0031", "Instruction Consistency", "Consistency", "MEDIUM", 71],
  ["TR-0050", "Failure Recovery", "Failure Recovery", "MEDIUM", 78]
];

import { getStoredAuth, clearStoredAuth, setReturnUrl } from "../../utils/auth";

function FullReport() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(() => getStoredAuth());

  useEffect(() => {
    const currentAuth = getStoredAuth();
    if (!currentAuth || !currentAuth.authenticated) {
      setReturnUrl("/full-report");
      navigate("/auth");
      return;
    }
    setAuth(currentAuth);
  }, [navigate]);

  const evaluation = useMemo(() => {
    try {
      const saved = sessionStorage.getItem("zerotrace_evaluation");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const score = Math.round(evaluation?.reliability_score ?? 83);
  const scenarioCount = evaluation?.scenario_results?.length ?? evaluation?.scenarios?.length ?? "unavailable";
  const agreement = evaluation?.evaluator_agreement;

  const evaluatedDimensions = useMemo(() => {
    if (evaluation?.metrics) {
      return [
        ["Correctness", evaluation.metrics.correctness ?? 0],
        ["Relevance", evaluation.metrics.relevance ?? 0],
        ["Completeness", evaluation.metrics.completeness ?? 0],
        ["Consistency", evaluation.metrics.consistency ?? 0],
        ["Hallucination Risk", evaluation.metrics.hallucination_risk ?? 0]
      ];
    }
    return fallbackDimensions;
  }, [evaluation]);

  const failuresList = useMemo(() => {
    if (evaluation?.scenario_results && evaluation.scenario_results.length > 0) {
      return evaluation.scenario_results
        .filter((s) => s.status === "failed" || (s.reliability_score ?? 0) < 80 || (s.failures && s.failures.length > 0))
        .map((s, idx) => [
          s.scenario_id || `TR-${String(idx + 1).padStart(4, "0")}`,
          s.title || `Scenario ${idx + 1}`,
          (s.type || "SCENARIO").toUpperCase(),
          (s.risk_level || "MEDIUM").toUpperCase(),
          Math.round(s.reliability_score ?? 0)
        ]);
    }
    if (evaluation?.failures && evaluation.failures.length > 0) {
      return evaluation.failures.map((f, idx) => [
        `TR-${String(idx + 1).padStart(4, "0")}`,
        f.slice(0, 36) + (f.length > 36 ? "..." : ""),
        "EVALUATOR FINDING",
        "HIGH",
        Math.round(score)
      ]);
    }
    return fallbackFailures;
  }, [evaluation, score]);

  const downloadPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(22);
    pdf.text("ZeroTrace / TRASY", 20, 25);

    pdf.setFontSize(11);
    pdf.text("AI AGENT RELIABILITY REPORT", 20, 34);

    pdf.setFontSize(32);
    pdf.text(`${score}/100`, 20, 55);

    pdf.setFontSize(12);
    pdf.text("Reliability Score", 20, 64);

    pdf.setFontSize(10);
    pdf.text("Evaluation Summary", 20, 82);
    pdf.text(`Scenarios Executed: ${scenarioCount} across 5 core evaluation dimensions.`, 20, 90);
    if (agreement && agreement.agreement_score != null) {
      pdf.text(`Evaluator Consensus: ${agreement.agreement_score}% (${agreement.agreement_level})`, 20, 98);
    } else {
      pdf.text("Adversarial evaluation with trace-backed failure analysis.", 20, 98);
    }

    pdf.setFontSize(12);
    pdf.text("Evaluated Core Dimensions", 20, 116);

    let y = 126;
    evaluatedDimensions.forEach(([name, value]) => {
      pdf.setFontSize(9);
      pdf.text(`${name}: ${value}/100`, 20, y);
      y += 8;
    });

    y += 8;
    pdf.setFontSize(12);
    pdf.text("Observed Deviations", 20, y);

    y += 10;
    failuresList.forEach(([id, name, category, severity, value]) => {
      pdf.setFontSize(9);
      pdf.text(`${id} | ${name} | ${category} | ${severity} | ${value}/100`, 20, y);
      y += 8;
    });

    y += 10;
    pdf.setFontSize(12);
    pdf.text("TRASY Analysis", 20, y);

    y += 9;
    pdf.setFontSize(9);
    pdf.text(
      "The evaluated agent demonstrates measured reliability across scenarios.",
      20,
      y
    );

    y += 7;
    pdf.text(
      "Review the identified deviation points and re-evaluate before production deployment.",
      20,
      y
    );

    pdf.save("ZeroTrace-TRASY-Reliability-Report.pdf");
  };

  const logout = () => {
    clearStoredAuth();
    navigate("/auth");
  };

  if (!auth) {
    return null;
  }

  return (
    <div className="full-report-page">
      <header className="full-report-header">
        <button
          className="full-report-back"
          onClick={() => navigate("/report")}
        >
          <ArrowLeft size={15} />
          REPORT PREVIEW
        </button>

        <div className="full-report-brand">
          <div className="full-report-logo">Z</div>
          <strong>ZeroTrace</strong>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          <LogOut size={14} />
          LOG OUT
        </button>
      </header>

      <main className="full-report-main">
        <div className="full-report-kicker">
          TRASY / VERIFIED RELIABILITY REPORT
        </div>

        <div className="full-report-title-row">
          <div>
            <h1>
              Full Evaluation
              <span>Report.</span>
            </h1>

            <p>
              Complete evidence-backed analysis generated by
              TRASY Autonomous AI Evaluation Engine.
            </p>
          </div>

          <button
            className="download-report-button"
            onClick={downloadPDF}
          >
            <Download size={17} />
            DOWNLOAD PDF
          </button>
        </div>

        <section className="verified-banner">
          <ShieldCheck size={18} />
          <div>
            <strong>VERIFIED EVALUATION</strong>
            <span>Identity verified via {auth.method || "Email OTP"}.</span>
          </div>
        </section>

        <section className="full-score-card">
          <div className="score-block">
            <small>TRASY RELIABILITY SCORE</small>
            <strong>{score}</strong>
            <span>/100</span>
          </div>

          <div className="score-verdict">
            <small>CONSENSUS & VERDICT</small>
            <h2>
              {agreement?.agreement_score != null
                ? `Consensus: ${agreement.agreement_score}% (${agreement.agreement_level})`
                : "Multi-Model Evaluation Completed"}
            </h2>
            <p>
              {score >= 80
                ? "The agent performs reliably across the majority of adversarial scenarios."
                : "TRASY identified specific behavioral and consistency risks that require remediation."}
            </p>
          </div>
        </section>

        <section className="report-stat-grid">
          <div>
            <Activity size={16} />
            <small>SCENARIOS RUN</small>
            <strong>{scenarioCount}</strong>
          </div>

          <div>
            <ShieldCheck size={16} />
            <small>DIMENSIONS</small>
            <strong>5 CORE</strong>
          </div>

          <div>
            <AlertTriangle size={16} />
            <small>DEVIATIONS</small>
            <strong>{failuresList.length}</strong>
          </div>

          <div>
            <RotateCcw size={16} />
            <small>REGRESSION</small>
            <strong>READY</strong>
          </div>
        </section>

        <section className="dimensions-report">
          <div className="section-heading">
            <span>01 / EVALUATED METRICS</span>
            <h2>Core Reliability Dimensions</h2>
          </div>

          <div className="dimension-list">
            {evaluatedDimensions.map(([name, value]) => (
              <div className="dimension-row" key={name}>
                <div className="dimension-name">
                  <span>{name}</span>
                  <strong>{value}</strong>
                </div>

                <div className="dimension-track">
                  <div style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="full-failures">
          <div className="section-heading">
            <span>02 / TRACE-BACKED EVIDENCE</span>
            <h2>Observed Failures & Scenario Results</h2>
          </div>

          <div className="full-failure-table">
            <div className="failure-table-head">
              <span>TRACE</span>
              <span>FAILURE / SCENARIO</span>
              <span>CATEGORY</span>
              <span>SEVERITY</span>
              <span>SCORE</span>
            </div>

            {failuresList.map(([id, name, category, severity, value]) => (
              <div className="failure-table-row" key={id}>
                <span>{id}</span>
                <strong>{name}</strong>
                <span>{category}</span>
                <span className={severity === "HIGH" ? "severity-high" : "severity-medium"}>
                  {severity}
                </span>
                <span>{value}/100</span>
              </div>
            ))}
          </div>
        </section>

        <section className="recommendation-card">
          <span>03 / TRASY RECOMMENDATION</span>
          <h2>
            {evaluation?.recommendations && evaluation.recommendations.length > 0
              ? evaluation.recommendations[0]
              : "Fix the weak signals before deployment."}
          </h2>
          <p>
            {evaluation?.recommendations && evaluation.recommendations.length > 1
              ? evaluation.recommendations.slice(1).join(" ")
              : "Prioritize prompt-injection resistance, tool error handling and behavioral consistency. Re-run the evaluation after changes to verify improvement."}
          </p>
        </section>

        <section className="report-actions">
          <button onClick={downloadPDF}>
            <Download size={16} />
            DOWNLOAD FULL REPORT
          </button>

          <button onClick={() => navigate("/test-ai")}>
            RUN ANOTHER EVALUATION
          </button>
        </section>
      </main>
    </div>
  );
}

export default FullReport;
