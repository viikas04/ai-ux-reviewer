import { Link, useLocation } from "react-router-dom";

function BrandMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.5" />
      <path
        d="M9 17.5l4.5 4.5L23 11"
        stroke="var(--pen)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="brand">
          <BrandMark />
          <span className="brand__name">ai-ux-reviewer</span>
        </Link>

        <nav className="navlinks" aria-label="Primary">
          <Link to="/" className={location.pathname === "/" ? "is-active" : ""}>
            Home
          </Link>
          <Link to="/status" className={location.pathname === "/status" ? "is-active" : ""}>
            Status
          </Link>
        </nav>
      </div>
    </header>
  );
}