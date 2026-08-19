import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Landing from "./pages/Landing/Landing";
import About from "./pages/About/About";
import TestAI from "./pages/TestAI/TestAI";
import Trasy from "./pages/Trasy/Trasy";
import Team from "./pages/Team/Team";
import Contact from "./pages/Contact/Contact";
import License from "./pages/License/License";
import Evaluation from "./pages/Evaluation/Evaluation";
import MissionControl from "./pages/MissionControl/MissionControl";
import Investigation from "./pages/Investigation/Investigation";
import Report from "./pages/Report/Report";
import FullReport from "./pages/FullReport/FullReport";
import Auth from "./pages/Auth/Auth";
import Dashboard from "./pages/Dashboard/Dashboard";
import "./App.css";
import "./styles/evaluation.css";
import "./styles/investigation.css";
import "./styles/report.css";
import "./styles/auth.css";
import "./styles/fullReport.css";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/test-ai" element={<TestAI />} />
          <Route path="/trasy" element={<Trasy />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/license" element={<License />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/mission-control" element={<MissionControl />} />
          <Route path="/investigation" element={<Investigation />} />
          <Route path="/report" element={<Report />} />
          <Route path="/full-report" element={<FullReport />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
