import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Smartphone,
  ShieldCheck,
  History,
  LayoutDashboard,
  FileText,
  LogOut,
  Activity
} from "lucide-react";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();

  let auth = {};

  try {
    auth = JSON.parse(
      sessionStorage.getItem("zerotrace_auth") || "{}"
    );
  } catch {}

  const history = JSON.parse(
    localStorage.getItem("zerotrace_history") || "[]"
  );

  const identifier =
    auth.identifier || "ZeroTrace User";

  const initial =
    identifier.charAt(0).toUpperCase();

  const logout = () => {
    sessionStorage.removeItem("zerotrace_auth");
    sessionStorage.removeItem("zerotrace_return");

    navigate("/");

    window.dispatchEvent(
      new Event("zerotrace-auth-changed")
    );
  };

  return (
    <main className="zt-profile-page">

      <section className="profile-main-card">

        <div className="profile-cover"></div>

        <div className="profile-content">

          <div className="profile-avatar-xl">
            {initial}
          </div>

          <div className="profile-heading">
            <span>
              ZEROTRACE / ACCOUNT
            </span>

            <h1>
              Your <strong>Profile.</strong>
            </h1>

            <p>
              Manage your ZeroTrace account,
              evaluations and secure TRASY access.
            </p>
          </div>

        </div>

        <div className="profile-verified">
          <ShieldCheck size={15} />
          VERIFIED ACCOUNT
        </div>

      </section>

      <section className="profile-info-grid">

        <article>
          {auth.method === "phone"
            ? <Smartphone />
            : <Mail />}

          <small>
            VERIFIED CONTACT
          </small>

          <strong>
            {identifier}
          </strong>

          <span>
            {auth.method === "phone"
              ? "Mobile number verified"
              : "Email address verified"}
          </span>
        </article>

        <article>
          <ShieldCheck />

          <small>
            ACCOUNT STATUS
          </small>

          <strong>
            Active
          </strong>

          <span>
            Secure TRASY access enabled
          </span>
        </article>

        <article>
          <Activity />

          <small>
            TOTAL EVALUATIONS
          </small>

          <strong>
            {history.length}
          </strong>

          <span>
            Saved evaluation records
          </span>
        </article>

      </section>

      <section className="profile-actions-grid">

        <button
          onClick={() => navigate("/dashboard")}
        >
          <LayoutDashboard />
          <div>
            <strong>Dashboard</strong>
            <span>
              View analytics and KPIs
            </span>
          </div>
        </button>

        <button
          onClick={() => navigate("/history")}
        >
          <History />
          <div>
            <strong>Evaluation History</strong>
            <span>
              Review previous evaluations
            </span>
          </div>
        </button>

        <button
          onClick={() => navigate("/report")}
        >
          <FileText />
          <div>
            <strong>Reports</strong>
            <span>
              View reliability reports
            </span>
          </div>
        </button>

        <button
          className="logout-card"
          onClick={logout}
        >
          <LogOut />
          <div>
            <strong>Sign out</strong>
            <span>
              End your ZeroTrace session
            </span>
          </div>
        </button>

      </section>

      <footer className="profile-footer">
        <span>ZeroTrace / TRASY</span>
        <span>Quantum University, Roorkee</span>
        <span>MIT License</span>
      </footer>

    </main>
  );
}

export default Profile;
