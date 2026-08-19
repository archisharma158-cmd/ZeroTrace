import { Link, NavLink } from "react-router-dom";
import { ZeroTraceLogo, TrasyLogo } from "../common/BrandLogos";
import "../../styles/navbar.css";

function Navbar() {
  return (
    <header className="zt-navbar">
      <Link to="/" className="zt-brand">
        <ZeroTraceLogo />
      </Link>

      <nav className="zt-nav">`r`n        <NavLink to="/">Home</NavLink>`r`n        <NavLink to="/test-ai">Test Your AI</NavLink>
        <NavLink to="/evaluation">TRASY</NavLink>
        <NavLink to="/team">Team</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </nav>

      <Link to="/test-ai" className="zt-break-button">
        <TrasyLogo />
        <span>BREAK MY AI</span>
        <span className="zt-arrow">↗</span>
      </Link>
    </header>
  );
}

export default Navbar;

