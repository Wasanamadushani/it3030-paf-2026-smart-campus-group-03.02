import { NavLink } from "react-router-dom";
import "../styles/adminSidebarLayout.css";

const ADMIN_MENU_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "DB" },
  { to: "/admin/manage-facilities", label: "Facilities", icon: "FC" },
  { to: "/admin/bookings", label: "Bookings", icon: "BK" },
  { to: "/admin/tickets", label: "Tickets", icon: "TK" },
  { to: "/admin/notifications", label: "Notifications", icon: "NT" },
];

export default function AdminSidebarLayout({ title, subtitle, children }) {
  return (
    <div className="admin-layout-shell">
      <aside className="admin-sidebar" aria-label="Admin sidebar navigation">
        <div className="admin-sidebar-header">
          <h1>Admin Panel</h1>
        </div>

        <nav className="admin-sidebar-nav">
          {ADMIN_MENU_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "admin-nav-item admin-nav-item-active" : "admin-nav-item"
              }
            >
              <span className="admin-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="admin-content-area">
        <header className="admin-content-header">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </header>

        <section className="admin-content-body">{children}</section>
      </main>
    </div>
  );
}
