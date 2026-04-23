import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { label: "Home", page: "home" },
  { label: "Resources", page: "resources" },
  { label: "Bookings", page: "bookings" },
  { label: "Tickets", page: "tickets" },
  { label: "Notifications", page: "notifications" },
];

export default function Navbar({ 
  userName = "Alex Silva", 
  role = "USER",
  currentPage = "home",
  setCurrentPage = () => {}
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isAdmin, logout } = useAuth();

  const handleMenuClick = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  const handleAdminClick = () => {
    setCurrentPage('admin');
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
    setIsProfileOpen(false);
  };

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
          <button 
            key={item.label} 
            className={`nav-link ${currentPage === item.page ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.page)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="profile-wrap">
        <button
          className="profile-btn"
          onClick={() => setIsProfileOpen((prev) => !prev)}
          aria-label="User profile"
        >
          <span className="profile-avatar">{userName.substring(0, 2).toUpperCase()}</span>
          <span className="profile-meta">
            <strong>{userName}</strong>
            <small>{role}{isAdmin && ' - ADMIN'}</small>
          </span>
          <span className="chevron">v</span>
        </button>

        {isProfileOpen && (
          <div className="profile-dropdown" role="menu">
            <a href="#" onClick={(e) => {e.preventDefault(); setIsProfileOpen(false);}}>My Profile</a>
            <a href="#" onClick={(e) => {e.preventDefault(); setIsProfileOpen(false);}}>Settings</a>
            {!isAdmin && (
              <button 
                className="admin-toggle-btn"
                onClick={handleAdminClick}
              >
                ⚙️ Admin Panel
              </button>
            )}
            {isAdmin && (
              <button 
                className="admin-toggle-btn admin-active"
                onClick={handleLogout}
              >
                🚪 Logout Admin
              </button>
            )}
            <a href="#" onClick={(e) => {e.preventDefault(); setIsProfileOpen(false);}}>Sign out</a>
          </div>
        )}
      </div>
    </header>
  );
}
