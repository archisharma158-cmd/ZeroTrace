import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Clock,
  Search,
  ChevronDown,
  Zap,
  ShieldCheck,
  RotateCcw,
  Bot,
  TrendingUp,
  FileText,
  Layers
} from "lucide-react";
import { getValidCompletedEvaluations } from "../../utils/evaluationValidation";
import "../../styles/history.css";

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("zerotrace_history") || "[]");
      return getValidCompletedEvaluations(saved);
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [typeFilter, setTypeFilter] = useState("all");

  // Keep state synced if storage changes in another tab/component
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("zerotrace_history") || "[]");
        setHistory(getValidCompletedEvaluations(saved));
      } catch {
        // Safe fallback
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const deleteItem = (id) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem("zerotrace_history", JSON.stringify(updated));
    } catch {
      // Storage quota safe
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your evaluation history?")) {
      setHistory([]);
      try {
        localStorage.removeItem("zerotrace_history");
      } catch {
        // Storage quota safe
      }
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setScoreFilter("all");
    setSortBy("newest");
    setTypeFilter("all");
  };

  // Discover available categories / threat levels dynamically
  const availableTypes = useMemo(() => {
    const types = new Set();
    history.forEach((item) => {
      if (item.threat) types.add(item.threat);
      else if (item.status) types.add(item.status);
    });
    return Array.from(types);
  }, [history]);

  // Filter and Sort history records
  const filteredHistory = useMemo(() => {
    return history
      .filter((item) => {
        // 1. Search Query Match
        const q = searchQuery.toLowerCase().trim();
        if (q) {
          const agentMatch = (item.agent || "").toLowerCase().includes(q);
          const idMatch = (item.id || "").toLowerCase().includes(q);
          const scoreMatch = String(item.score ?? "").includes(q);
          const dateMatch = (item.date || "").toLowerCase().includes(q);
          const threatMatch = (item.threat || item.status || "").toLowerCase().includes(q);
          if (!agentMatch && !idMatch && !scoreMatch && !dateMatch && !threatMatch) {
            return false;
          }
        }

        // 2. Score Range Match
        const score = Number(item.score ?? 0);
        if (scoreFilter === "90-100" && (score < 90 || score > 100)) return false;
        if (scoreFilter === "80-89" && (score < 80 || score >= 90)) return false;
        if (scoreFilter === "70-79" && (score < 70 || score >= 80)) return false;
        if (scoreFilter === "below-70" && score >= 70) return false;

        // 3. Category / Threat Filter
        if (typeFilter !== "all") {
          const threat = (item.threat || item.status || "").toUpperCase();
          if (threat !== typeFilter.toUpperCase()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "highest") {
          return Number(b.score ?? 0) - Number(a.score ?? 0);
        }
        if (sortBy === "lowest") {
          return Number(a.score ?? 0) - Number(b.score ?? 0);
        }
        if (sortBy === "oldest") {
          const timeA = new Date(a.date || a.timestamp || 0).getTime() || 0;
          const timeB = new Date(b.date || b.timestamp || 0).getTime() || 0;
          return timeA - timeB;
        }
        // newest first (default)
        const timeA = new Date(a.date || a.timestamp || 0).getTime() || 0;
        const timeB = new Date(b.date || b.timestamp || 0).getTime() || 0;
        return timeB - timeA;
      });
  }, [history, searchQuery, scoreFilter, sortBy, typeFilter]);

  // Score color badge and label mapping
  const getScoreTheme = (score) => {
    const num = Number(score ?? 0);
    if (num >= 85) {
      return {
        color: "#4de2c0",
        label: "PASSED",
        bg: "rgba(77, 226, 192, 0.08)",
        border: "rgba(77, 226, 192, 0.25)"
      };
    }
    if (num >= 70) {
      return {
        color: "#ffb74d",
        label: "REVIEW",
        bg: "rgba(255, 183, 77, 0.08)",
        border: "rgba(255, 183, 77, 0.25)"
      };
    }
    return {
      color: "#ff4ca8",
      label: "CRITICAL",
      bg: "rgba(255, 76, 168, 0.08)",
      border: "rgba(255, 76, 168, 0.25)"
    };
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    scoreFilter !== "all" ||
    sortBy !== "newest" ||
    typeFilter !== "all";

  return (
    <main className="zt-history-page">
      <div className="zt-history-container">

        {/* 1. Page Header */}
        <header className="zt-history-header">
          <div>
            <div className="zt-history-eyebrow">
              <i />
              ZEROTRACE / EVALUATION HISTORY
            </div>
            <h1>
              Your Evaluation <span>History.</span>
            </h1>
            <p>
              Review your previous TRASY AI reliability evaluations, score traces, and failure simulations.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="zt-clear-btn"
              title="Clear all stored evaluation history"
            >
              <Trash2 size={15} />
              Clear History
            </button>
          )}
        </header>

        {/* 2. Toolbar / Filter Section (when history exists) */}
        {history.length > 0 && (
          <section className="zt-history-toolbar" aria-label="Evaluation filters">
            <div className="zt-toolbar-left">
              {/* Search Box */}
              <div className="zt-search-box">
                <Search size={15} className="zt-search-icon" />
                <input
                  type="text"
                  placeholder="Search evaluations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="zt-search-input"
                  aria-label="Search evaluations"
                />
              </div>

              {/* Score Range Filter */}
              <div className="zt-select-wrap">
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="zt-filter-select"
                  aria-label="Filter by score"
                >
                  <option value="all">All Scores</option>
                  <option value="90-100">90–100%</option>
                  <option value="80-89">80–89%</option>
                  <option value="70-79">70–79%</option>
                  <option value="below-70">Below 70%</option>
                </select>
                <ChevronDown size={14} className="zt-select-chevron" />
              </div>

              {/* Sort Dropdown */}
              <div className="zt-select-wrap">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="zt-filter-select"
                  aria-label="Sort evaluations"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Score</option>
                  <option value="lowest">Lowest Score</option>
                </select>
                <ChevronDown size={14} className="zt-select-chevron" />
              </div>

              {/* Optional Category/Threat Filter if available */}
              {availableTypes.length > 0 && (
                <div className="zt-select-wrap">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="zt-filter-select"
                    aria-label="Filter by category"
                  >
                    <option value="all">All Categories</option>
                    {availableTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="zt-select-chevron" />
                </div>
              )}
            </div>

            <div className="zt-toolbar-right">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="zt-reset-filters-btn"
                  title="Reset all filters"
                >
                  <RotateCcw size={13} />
                  Reset Filters
                </button>
              )}
            </div>
          </section>
        )}

        {/* 3. Sub-bar Count */}
        {history.length > 0 && (
          <div className="zt-history-meta-bar">
            <span className="zt-history-count">
              Showing <strong>{filteredHistory.length}</strong> of {history.length} evaluation{history.length === 1 ? "" : "s"}
            </span>
          </div>
        )}

        {/* 4. History Cards List */}
        <section className="zt-history-list">
          {history.length === 0 ? (
            /* Total Empty State */
            <div className="zt-history-empty">
              <div className="zt-empty-icon">
                <ShieldCheck size={32} />
              </div>
              <h2>No evaluations yet</h2>
              <p>
                Run your first adversarial stress test with TRASY and your complete AI reliability evaluation history will appear here.
              </p>
              <Link to="/test-ai" className="zt-empty-cta">
                <Zap size={15} />
                TEST YOUR AI
              </Link>
            </div>
          ) : filteredHistory.length === 0 ? (
            /* Filter Empty State */
            <div className="zt-history-empty">
              <div className="zt-empty-icon">
                <Bot size={32} />
              </div>
              <h2>No matching evaluations found</h2>
              <p>
                No historical records match your search or filter criteria. Try adjusting your search query or reset the active filters.
              </p>
              <button onClick={resetFilters} className="zt-reset-filters-btn">
                <RotateCcw size={13} />
                Clear Active Filters
              </button>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const theme = getScoreTheme(item.score);
              const scoreNum = Number(item.score ?? 0);
              const threatLabel = item.threat || item.status || theme.label;

              return (
                <article className="zt-history-card" key={item.id}>
                  {/* Left Info */}
                  <div className="zt-card-main">
                    <span className="zt-card-tag">EVALUATION RECORD</span>
                    <h2 className="zt-card-title">{item.agent || "AI Agent"}</h2>

                    <div className="zt-card-subinfo">
                      <span className="zt-card-date">
                        <Clock size={13} />
                        {item.date || "Recent evaluation"}
                      </span>

                      {threatLabel && (
                        <span
                          className="zt-threat-badge"
                          style={{
                            color: theme.color,
                            background: theme.bg,
                            border: `1px solid ${theme.border}`
                          }}
                        >
                          {threatLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Score */}
                  <div className="zt-card-score-box">
                    <div className="zt-score-val" style={{ color: theme.color }}>
                      {item.score !== undefined && item.score !== null ? `${item.score}%` : "--"}
                    </div>
                    <span className="zt-score-label">Reliability Score</span>
                    <div className="zt-score-bar-track">
                      <div
                        className="zt-score-bar-fill"
                        style={{
                          width: `${Math.min(Math.max(scoreNum, 0), 100)}%`,
                          background: theme.color
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="zt-card-actions">
                    <button
                      className="zt-action-link-btn mission-btn"
                      onClick={() =>
                        navigate(
                          `/mission-control?taskId=${encodeURIComponent(item.taskId || item.id)}&agent=${encodeURIComponent(item.agent || "")}`
                        )
                      }
                      title="Open Live Mission Control for this evaluation"
                    >
                      <TrendingUp size={14} />
                      Mission Control
                    </button>

                    <button
                      className="zt-action-link-btn report-btn"
                      onClick={() =>
                        navigate(
                          `/report?taskId=${encodeURIComponent(item.taskId || item.id)}&agent=${encodeURIComponent(item.agent || "")}`
                        )
                      }
                      title="View Report for this evaluation"
                    >
                      <FileText size={14} />
                      Report
                    </button>

                    <button
                      className="zt-delete-item-btn"
                      onClick={() => deleteItem(item.id)}
                      title="Delete this evaluation record"
                      aria-label={`Delete evaluation for ${item.agent || "AI Agent"}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>

      </div>
    </main>
  );
}
