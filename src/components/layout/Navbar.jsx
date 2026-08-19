import zerotraceLogo from "../../assets/branding/zerotrace-logo.jpeg";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import "../../styles/navbar.css";

const NAV_ITEMS = [["Home", "/"], ["About", "/about"], ["Test Your AI", "/test-ai"], ["TRASY", "/trasy"], ["Team", "/team"], ["Contact", "/contact"]];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="zt-navbar">
      <div className="zt-navbar-inner">
        <Link to="/" className="zt-brand" aria-label="ZeroTrace home">
          <img className="zt-brand-logo" src={zerotraceLogo} alt="ZeroTrace" />
          <span className="zt-brand-name">ZeroTrace</span>
        </Link>
        <button className="zt-menu-button" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {open ? <X /> : <Menu />}
        </button>
        <nav className={`zt-nav${open ? " is-open" : ""}`} aria-label="Main navigation">
          {NAV_ITEMS.map(([label, path]) => <NavLink key={path} to={path} end={path === "/"} onClick={() => setOpen(false)}>{label}</NavLink>)}
        </nav>
        <Link to="/test-ai" className="zt-break-button"><span>BREAK MY AI</span><ArrowUpRight size={17} /></Link>
      </div>
    </header>
  );
}

export default Navbar;



