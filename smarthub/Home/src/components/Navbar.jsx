import { useState } from "react";

const menuItems = [
  "Home",
  "Resources",
  "Bookings",
  "Tickets",
  "Notifications",
];

export default function Navbar({ userName = "Alex Silva", role = "USER" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="top-nav">
      <div className="brand-wrap">
        <div className="brand-logo">SC</div>
        <div>
          <p className="brand-title">Smart Campus Hub</p>
          <p className="brand-subtitle">Operations Hub</p>
        </div>
      </div>

      <button
        className="mobile-toggle"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`nav-links ${isMenuOpen ? "open" : ""}`}>
        {menuItems.map((item) => (
          <a key={item} href="#" className="nav-link">
            {item}
          </a>
        ))}
      </nav>

      <div className="profile-wrap">
        <button
          className="profile-btn"
          onClick={() => setIsProfileOpen((prev) => !prev)}
          aria-label="User profile"
        >
          <span className="profile-avatar">AS</span>
          <span className="profile-meta">
            <strong>{userName}</strong>
            <small>{role}</small>
          </span>
          <span className="chevron">v</span>
        </button>

        {isProfileOpen && (
          <div className="profile-dropdown" role="menu">
            <a href="#">My Profile</a>
            <a href="#">Settings</a>
            <a href="#">Sign out</a>
          </div>
        )}
      </div>
    </header>
  );
}
