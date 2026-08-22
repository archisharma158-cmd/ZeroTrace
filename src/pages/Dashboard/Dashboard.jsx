import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ShieldCheck,
  Zap,
  AlertTriangle,
  ArrowUpRight,
  Cpu,
  Globe2,
  Target,
  Clock3
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { getValidCompletedEvaluations } from "../../utils/evaluationValidation";
import "./dashboard.css";

const fallbackHistory = [
  {
    id: "ZT-DEMO-001",
    agent: "Research Copilot",
    score: 92,
    threat: "LOW",
    status: "PASSED",
    date: "Demo"
  },
  {
    id: "ZT-DEMO-002",
    agent: "TRASY Demo Agent",
    score: 87,
    threat: "MEDIUM",
    status: "PASSED",
    date: "Demo"
  },
  {
    id: "ZT-DEMO-003",
    agent: "Autonomous Agent",
    score: 81,
    threat: "MEDIUM",
    status: "PASSED",
    date: "Demo"
  }
];

function Dashboard() {
  const history = useMemo(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("zerotrace_history") || "[]"
      );
      const validCompleted = getValidCompletedEvaluations(saved);

      return validCompleted.length ? validCompleted : fallbackHistory;
    } catch {
      return fallbackHistory;
    }
  }, []);

  const totalEvaluations = history.length;

  const averageScore = Math.round(
    history.reduce(
      (sum, item) => sum + Number(item.score || 0),
      0
    ) / Math.max(history.length, 1)
  );

  const reliabilityData = history
    .slice()
    .reverse()
    .map((item, index) => ({
      name: `E${index + 1}`,
      score: Number(item.score || 0)
    }));

  const barData = history.slice(0, 7).map((item, index) => ({
    name: item.agent
      ? item.agent.substring(0, 10)
      : `E${index + 1}`,
    score: Number(item.score || 0)
  }));

  const areaData = history
    .slice()
    .reverse()
    .map((item, index) => ({
      name: `E${index + 1}`,
      reliability: Number(item.score || 0),
      stability: Math.max(
        Number(item.score || 0) - 5,
        0
      )
    }));

  const scatterData = history.map((item, index) => ({
    risk: 100 - Number(item.score || 0),
    reliability: Number(item.score || 0),
    name: item.agent || `Evaluation ${index + 1}`
  }));

  const threatCounts = history.reduce(
    (acc, item) => {
      const threat = String(
        item.threat || "LOW"
      ).toUpperCase();

      if (threat.includes("HIGH")) {
        acc.high += 1;
      } else if (threat.includes("MED")) {
        acc.medium += 1;
      } else {
        acc.low += 1;
      }

      return acc;
    },
    { low: 0, medium: 0, high: 0 }
  );

  const pieData = [
    {
      name: "Low Risk",
      value: threatCounts.low
    },
    {
      name: "Medium",
      value: threatCounts.medium
    },
    {
      name: "High Risk",
      value: threatCounts.high
    }
  ].filter(item => item.value > 0);

  const COLORS = [
    "#4de6ff",
    "#a66cff",
    "#ff4ca8"
  ];

  const latest = history[0] || fallbackHistory[0];

  return (
    <main className="zt-dashboard">

      <section className="dash-hero">

        <div>
          <span className="dash-tag">
            ZEROTRACE / TRASY COMMAND CENTER
          </span>

          <h1>
            AI Reliability <span>Dashboard.</span>
          </h1>

          <p>
            Live intelligence from your completed
            TRASY evaluations, reliability analysis
            and adversarial testing.
          </p>
        </div>

        <Link
          to="/test-ai"
          className="dash-btn"
        >
          TEST YOUR AI
          <ArrowUpRight size={16} />
        </Link>

      </section>

      <section className="dash-stats">

        <div className="kpi-card">
          <div className="kpi-icon">
            <Activity />
          </div>

          <small>TOTAL EVALUATIONS</small>

          <b>{totalEvaluations}</b>

          <em>RECORDED TESTS</em>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <ShieldCheck />
          </div>

          <small>AVERAGE RELIABILITY</small>

          <b>{averageScore}%</b>

          <em>CALCULATED FROM HISTORY</em>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon warning">
            <AlertTriangle />
          </div>

          <small>LATEST THREAT</small>

          <b className="pink">
            {latest.threat || "LOW"}
          </b>

          <em>LIVE EVALUATION</em>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <Zap />
          </div>

          <small>TRASY ENGINE</small>

          <b className="cyan">ONLINE</b>

          <em>READY</em>
        </div>

      </section>

      <section className="dashboard-grid-main">

        <div className="dash-card chart-wide">

          <div className="dash-title">
            <span>RELIABILITY TREND</span>
            <b>{history.length} EVALUATIONS</b>
          </div>

          <div className="real-chart">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reliabilityData}>

                <CartesianGrid
                  stroke="#243154"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                  stroke="#7180a5"
                />

                <YAxis
                  domain={[0, 100]}
                  stroke="#7180a5"
                />

                <Tooltip
                  contentStyle={{
                    background: "#0d1430",
                    border: "1px solid #33436e",
                    borderRadius: "10px",
                    color: "#fff"
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#4de6ff"
                  strokeWidth={4}
                  dot={{
                    fill: "#a66cff",
                    stroke: "#4de6ff",
                    strokeWidth: 2,
                    r: 5
                  }}
                />

              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>

        <div className="dash-card">

          <div className="dash-title">
            <span>THREAT DISTRIBUTION</span>
            <Target size={16} />
          </div>

          <div className="real-pie">

            <ResponsiveContainer
              width="100%"
              height={230}
            >
              <PieChart>

                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                >

                  {pieData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}

                </Pie>

                <Tooltip />

              </PieChart>
            </ResponsiveContainer>

          </div>

          <div className="legend">

            {pieData.map((item, index) => (
              <span key={item.name}>

                <i
                  style={{
                    background:
                      COLORS[index % COLORS.length]
                  }}
                />

                {item.name}

                <b>{item.value}</b>

              </span>
            ))}

          </div>

        </div>

      </section>

      <section className="dashboard-grid-main">

        <div className="dash-card">

          <div className="dash-title">
            <span>EVALUATION PERFORMANCE</span>
            <Activity size={16} />
          </div>

          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <BarChart data={barData}>

              <CartesianGrid
                stroke="#243154"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
                stroke="#7180a5"
              />

              <YAxis
                domain={[0, 100]}
                stroke="#7180a5"
              />

              <Tooltip />

              <Bar
                dataKey="score"
                fill="#7c5cff"
                radius={[8,8,0,0]}
              />

            </BarChart>
          </ResponsiveContainer>

        </div>

        <div className="dash-card">

          <div className="dash-title">
            <span>BEHAVIORAL AREA</span>
            <Cpu size={16} />
          </div>

          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <AreaChart data={areaData}>

              <defs>
                <linearGradient
                  id="areaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#4de6ff"
                    stopOpacity=".5"
                  />

                  <stop
                    offset="100%"
                    stopColor="#4de6ff"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#243154"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
                stroke="#7180a5"
              />

              <YAxis
                domain={[0, 100]}
                stroke="#7180a5"
              />

              <Tooltip />

              <Area
                type="monotone"
                dataKey="reliability"
                stroke="#4de6ff"
                fill="url(#areaGradient)"
                strokeWidth={3}
              />

            </AreaChart>
          </ResponsiveContainer>

        </div>

      </section>

      <section className="dashboard-grid-main">

        <div className="dash-card">

          <div className="dash-title">
            <span>RISK × RELIABILITY SCATTER</span>
            <b>LIVE HISTORY DATA</b>
          </div>

          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <ScatterChart>

              <CartesianGrid
                stroke="#243154"
              />

              <XAxis
                type="number"
                dataKey="risk"
                name="Risk"
                domain={[0,100]}
                stroke="#7180a5"
              />

              <YAxis
                type="number"
                dataKey="reliability"
                name="Reliability"
                domain={[0,100]}
                stroke="#7180a5"
              />

              <Tooltip cursor={{ strokeDasharray: "3 3" }} />

              <Scatter
                name="Evaluations"
                data={scatterData}
                fill="#4de6ff"
              />

            </ScatterChart>
          </ResponsiveContainer>

        </div>

        <div className="dash-card">

          <div className="dash-title">
            <span>RELIABILITY WATERFALL</span>
          </div>

          <div className="waterfall-real">

            {history
              .slice(0, 6)
              .map((item, index) => {

                const score =
                  Number(item.score || 0);

                return (
                  <div
                    className="water-item"
                    key={item.id || index}
                  >

                    <div
                      className="water-bar positive"
                      style={{
                        height: `${Math.max(
                          score * 1.8,
                          20
                        )}px`
                      }}
                    />

                    <b>{score}%</b>

                    <small>
                      E{index + 1}
                    </small>

                  </div>
                );
              })}

          </div>

        </div>

      </section>

      <section className="dashboard-grid-main">

        <div className="dash-card">

          <div className="dash-title">
            <span>GLOBAL EVALUATION MAP</span>
            <Globe2 size={16} />
          </div>

          <div className="world-map">

            <div className="map-grid" />

            <span className="map-dot dot-1" />
            <span className="map-dot dot-2" />
            <span className="map-dot dot-3" />

            <div className="map-label india">
              INDIA <b>ACTIVE</b>
            </div>

            <div className="map-label europe">
              EUROPE <b>MONITORED</b>
            </div>

            <div className="map-label usa">
              USA <b>MONITORED</b>
            </div>

          </div>

        </div>

        <div className="dash-card">

          <div className="dash-title">
            <span>LIVE SYSTEM STATUS</span>
            <Clock3 size={16} />
          </div>

          <div className="system-status">

            <div>
              <span>AI CORE</span>
              <b className="cyan">● ONLINE</b>
            </div>

            <div>
              <span>ADVERSARIAL ENGINE</span>
              <b className="cyan">● READY</b>
            </div>

            <div>
              <span>SCENARIO ENGINE</span>
              <b className="cyan">● ACTIVE</b>
            </div>

            <div>
              <span>REPORT ENGINE</span>
              <b className="cyan">● READY</b>
            </div>

            <div>
              <span>DATABASE</span>
              <b className="cyan">● CONNECTED</b>
            </div>

          </div>

        </div>

      </section>

      <section className="dash-card recent-card">

        <div className="dash-title">
          <span>RECENT EVALUATIONS</span>

          <Link to="/history">
            VIEW ALL →
          </Link>
        </div>

        {history.slice(0, 6).map((item, index) => (

          <div
            className="dash-row"
            key={item.id || index}
          >

            <div>
              <strong>
                {item.agent || "AI Agent"}
              </strong>

              <small>
                {item.date || "Recent evaluation"}
              </small>
            </div>

            <span
              className={`threat ${
                String(item.threat || "LOW").toLowerCase()
              }`}
            >
              {item.threat || "LOW"}
            </span>

            <b>
              {item.score ?? "--"}%
            </b>

          </div>

        ))}

      </section>

      <section className="dashboard-actions">

        <Link to="/test-ai">
          RUN NEW EVALUATION →
        </Link>

        <Link to="/report">
          VIEW REPORT →
        </Link>

        <Link to="/history">
          EVALUATION HISTORY →
        </Link>

        <Link to="/trasy">
          OPEN TRASY →
        </Link>

      </section>

    </main>
  );
}

export default Dashboard;
