import { NavLink, useNavigate } from "react-router-dom";
import { LogIn, LogOut, History as HistoryIcon } from "lucide-react";
import "../../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem("zerotrace_auth");

  const logout = () => {
    sessionStorage.removeItem("zerotrace_auth");
    sessionStorage.removeItem("zerotrace_return");
    navigate("/");
    window.location.reload();
  };

  const protectedNav = (path) => {
    if (!isLoggedIn) {
      sessionStorage.setItem("zerotrace_return", path);
      navigate("/auth");
      return;
    }
    navigate(path);
  };

  return (
    <header className="zt-navbar">
      <div className="zt-navbar-inner">

        <NavLink to="/" className="zt-brand">
          <img
            src="/src/assets/branding/zerotrace-logo.jpeg"
            alt="ZeroTrace"
            className="zt-brand-logo"
          />
          <span>ZeroTrace</span>
        </NavLink>

        <nav className="zt-nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/test-ai">Test Your AI</NavLink>
          <NavLink to="/trasy">TRASY</NavLink>
          <NavLink to="/team">Team</NavLink>
          <NavLink to="/contact">Contact</NavLink><NavLink to="/report">Report</NavLink>

          {isLoggedIn && (
            <button
              className="zt-history-link"
              onClick={() => navigate("/history")}
            >
              <HistoryIcon size={15} />
              History
            </button>
          )}

          {isLoggedIn ? (
            <button className="zt-login-button" onClick={logout}>
              <LogOut size={15} />
              LOGOUT
            </button>
          ) : (
            <button
              className="zt-login-button"
              onClick={() => navigate("/auth")}
            >
              <LogIn size={15} />
              LOGIN
            </button>
          )}
        </nav>

        <button
          className="zt-break-button"
          onClick={() => navigate("/test-ai")}
        >
          BREAK MY AI
          <span>↗</span>
        </button>

      </div>
    </header>
  );
}

export default Navbar;

