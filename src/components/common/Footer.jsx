import { Link } from "react-router-dom";

import zerotraceLogo from "../../assets/branding/zerotrace-logo.jpeg";
import "../../styles/footer.css";

const LINKS = {
  github: "#",
  linkedin: "#",
  email: "mailto:goyalparth61@gmail.com"
};

export default function Footer() {
  return (
    <footer className="zt-footer">

      <div className="zt-footer-grid">

        <div className="zt-footer-brand">

          <div className="zt-footer-brand-mark">
            <img
              src={zerotraceLogo}
              alt="ZeroTrace"
              className="zt-footer-logo"
            />

            <span className="zt-footer-brand-name">
              ZeroTrace
            </span>
          </div>

          <p className="zt-footer-tagline">
            TRASY — Autonomous AI Reliability Engine.
            Stress-test autonomous AI systems, analyze behavior,
            and turn evidence into measurable reliability signals.
          </p>

          <p className="zt-footer-team">
            Built by <strong>Parth Goyal</strong> ·
            <strong> Archi Sharma</strong> ·
            <strong> Annu Sharma</strong>
            <br />
            Quantum University, Roorkee
          </p>

        </div>


        <div className="zt-footer-column">

          <h4>Navigation</h4>

          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/test-ai">Test Your AI</Link>
          <Link to="/trasy">TRASY</Link>
          <Link to="/team">Team</Link>
          <Link to="/contact">Contact</Link>

        </div>


        <div className="zt-footer-column">

          <h4>Connect</h4>

          <a href={LINKS.github}>
             GitHub
          </a>

          <a href={LINKS.linkedin}>
             LinkedIn
          </a>

          <a href={LINKS.email}>
             Email
          </a>

          <Link to="/license" className="zt-license">
            
            MIT License
          </Link>

        </div>

      </div>


      <div className="zt-footer-bottom">

        <div className="zt-footer-bottom-left">

          <span>
            © 2026 ZeroTrace
          </span>

          <span className="zt-footer-status">
            TRASY / AUTONOMOUS AI RELIABILITY
          </span>

        </div>

        <span>
          Built at Quantum University
        </span>

      </div>

    </footer>
  );
}

