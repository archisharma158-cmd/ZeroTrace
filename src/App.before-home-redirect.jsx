import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/layout/Navbar";

import Landing from "./pages/Landing/Landing";
import TestAI from "./pages/TestAI/TestAI";
import Evaluation from "./pages/Evaluation/Evaluation";
import MissionControl from "./pages/MissionControl/MissionControl";
import Investigation from "./pages/Investigation/Investigation";
import Report from "./pages/Report/Report";
import FullReport from "./pages/FullReport/FullReport";
import Auth from "./pages/Auth/Auth";
import Dashboard from "./pages/Dashboard/Dashboard";
import Team from "./pages/Team/Team";
import Contact from "./pages/Contact/Contact";

import "./styles/navbar.css";
import "./styles/landing.css";
import "./styles/testai.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/test-ai" element={<TestAI />} />
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/mission-control" element={<MissionControl />} />
            <Route path="/investigation" element={<Investigation />} />
            <Route path="/report" element={<Report />} />
          <Route path="/full-report" element={<FullReport />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
import "./styles/evaluation.css";
import "./styles/investigation.css";
import "./styles/report.css";
import "./styles/auth.css";


import "./styles/fullReport.css";


