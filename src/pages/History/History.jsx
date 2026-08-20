import { useEffect, useState } from "react";
import { Trash2, FileText, Clock } from "lucide-react";

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("zerotrace_history") || "[]"
    );
    setHistory(saved);
  }, []);

  const deleteItem = (id) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("zerotrace_history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("zerotrace_history");
  };

  return (
    <main className="zt-history-page">
      <section className="zt-history-header">
        <div>
          <span>ZEROTRACE / EVALUATION HISTORY</span>
          <h1>Your Evaluation <strong>History.</strong></h1>
          <p>
            Review your previous TRASY AI reliability evaluations.
          </p>
        </div>

        {history.length > 0 && (
          <button onClick={clearHistory} className="zt-history-clear">
            <Trash2 size={15} />
            CLEAR HISTORY
          </button>
        )}
      </section>

      <section className="zt-history-list">
        {history.length === 0 ? (
          <div className="zt-history-empty">
            <FileText size={42} />
            <h2>No evaluations yet</h2>
            <p>
              Your completed evaluations will appear here after you run
              an AI reliability test.
            </p>
          </div>
        ) : (
          history.map((item) => (
            <article className="zt-history-card" key={item.id}>
              <div>
                <span>EVALUATION</span>
                <h3>{item.agent || "AI Agent"}</h3>

                <p>
                  <Clock size={13} />
                  {item.date || "Recent evaluation"}
                </p>
              </div>

              <div className="zt-history-score">
                <small>SCORE</small>
                <strong>{item.score ?? "--"}%</strong>
              </div>

              <div>
                <button
                  className="zt-delete-history"
                  onClick={() => deleteItem(item.id)}
                  title="Delete evaluation"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default History;
