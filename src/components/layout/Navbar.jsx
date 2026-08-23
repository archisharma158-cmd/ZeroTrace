import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LogIn,
  LogOut,
  LayoutDashboard,
  History as HistoryIcon,
  FileText,
  UserCircle,
  ChevronDown,
  ShieldCheck,
  Settings,
  User
} from "lucide-react";
import { getStoredAuth, clearStoredAuth, setReturnUrl } from "../../utils/auth";
import zerotraceLogo from "../../../logo.jpeg";
import "../../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const [auth, setAuth] = useState(() => getStoredAuth());

  useEffect(() => {
    const refreshAuth = () => setAuth(getStoredAuth());

    window.addEventListener("storage", refreshAuth);
    window.addEventListener("zerotrace-auth-changed", refreshAuth);

    return () => {
      window.removeEventListener("storage", refreshAuth);
      window.removeEventListener("zerotrace-auth-changed", refreshAuth);
    };
  }, []);

  useEffect(() => {
    const closeMenu = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
    };
  }, []);

  const loggedIn = Boolean(auth?.authenticated);

  const history = JSON.parse(
    localStorage.getItem("zerotrace_history") || "[]"
  );

  const identifier = auth?.identifier || "ZeroTrace User";

  const initial = identifier
    .charAt(0)
    .toUpperCase();

  const navClass = ({ isActive }) =>
    `zt-nav-link ${isActive ? "active" : ""}`;

  const logout = () => {
    clearStoredAuth();
    setAuth(null);
    setProfileOpen(false);
    navigate("/auth");
  };

  const openProtected = (path) => {
    if (!loggedIn) {
      setReturnUrl(path);
      navigate("/auth");
      return;
    }

    setProfileOpen(false);
    navigate(path);
  };

  return (
    <header className="zt-navbar">
      <div className="zt-navbar-inner">

        <NavLink to="/" className="zt-brand">
          <img
            src={zerotraceLogo}
            alt="ZeroTrace"
            className="zt-brand-logo"
          />

          <span className="zt-brand-name">
            ZeroTrace
          </span>
        </NavLink>

        <nav className="zt-nav">

          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          <NavLink to="/about" className={navClass}>
            About
          </NavLink>

          <NavLink to="/test-ai" className={navClass}>
            Test Your AI
          </NavLink>

          <NavLink to="/trasy" className={navClass}>
            TRASY
          </NavLink>

          {loggedIn && (
            <>
              <NavLink
                to="/dashboard"
                className={navClass}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </NavLink>

              <NavLink
                to="/history"
                className={navClass}
              >
                <HistoryIcon size={15} />
                History
              </NavLink>

              <NavLink
                to="/report"
                className={navClass}
              >
                <FileText size={15} />
                Report
              </NavLink>
            </>
          )}

          <NavLink to="/team" className={navClass}>
            Team
          </NavLink>

          <NavLink to="/contact" className={navClass}>
            Contact
          </NavLink>

        </nav>

        <div className="zt-nav-actions">

          {!loggedIn ? (

            <button
              className="zt-login-btn"
              onClick={() => navigate("/auth")}
            >
              <LogIn size={15} />
              LOGIN
            </button>

          ) : (

            <div
              className="zt-profile-container"
              ref={profileRef}
            >

              <button
                className="zt-profile-trigger"
                onClick={() =>
                  setProfileOpen(!profileOpen)
                }
                aria-label="Open profile menu"
              >

                <span className="zt-avatar">
                  {initial}
                </span>

                <span className="zt-profile-text">
                  {identifier.length > 18
                    ? identifier.substring(0, 18) + "..."
                    : identifier}
                </span>

                <ChevronDown
                  size={15}
                  className={
                    profileOpen
                      ? "profile-chevron rotate"
                      : "profile-chevron"
                  }
                />

              </button>

              {profileOpen && (

                <div className="zt-profile-dropdown">

                  <div className="profile-dropdown-head">

                    <div className="zt-avatar large">
                      {initial}
                    </div>

                    <div>
                      <strong>
                        {identifier}
                      </strong>

                      <span>
                        {auth?.method === "phone"
                          ? "Phone verified"
                          : "Email verified"}
                      </span>
                    </div>

                  </div>

                  <div className="profile-status">
                    <ShieldCheck size={14} />
                    <span>
                      ZeroTrace account verified
                    </span>
                  </div>

                  <div className="profile-divider" />

                  <button
                    onClick={() =>
                      openProtected("/profile")
                    }
                  >
                    <User size={16} />
                    Profile
                  </button>

                  <button
                    onClick={() =>
                      openProtected("/dashboard")
                    }
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </button>

                  <button
                    onClick={() =>
                      openProtected("/history")
                    }
                  >
                    <HistoryIcon size={16} />
                    Evaluation History
                    <span className="profile-count">
                      {history.length}
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      openProtected("/report")
                    }
                  >
                    <FileText size={16} />
                    Reports
                  </button>

                  <div className="profile-divider" />

                  <button
                    className="profile-logout"
                    onClick={logout}
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>

                </div>

              )}

            </div>

          )}

          <button
            className="zt-break-btn"
            onClick={() => navigate("/test-ai")}
          >
            BREAK MY AI
            <span>↗</span>
          </button>

        </div>

      </div>
    </header>
  );
}

export default Navbar;
