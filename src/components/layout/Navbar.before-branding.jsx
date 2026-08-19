import { NavLink, Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import "../../styles/navbar.css";

function Navbar() {
  return (
    <header className="zt-navbar">
      <div className="zt-navbar-inner">

        <Link to="/" className="zt-brand">
          <span className="zt-brand-mark">Z</span>
          <span className="zt-brand-name">ZeroTrace</span>
        </Link>

        <nav className="zt-nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/test-ai">Test Your AI</NavLink>
          <NavLink to="/trasy">TRASY</NavLink>
          <NavLink to="/team">Team</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        <Link to="/test-ai" className="zt-break-button">
          <span>BREAK MY AI</span>
          <ArrowUpRight size={17} />
        </Link>

      </div>
    </header>
  );
}

export default Navbar;
