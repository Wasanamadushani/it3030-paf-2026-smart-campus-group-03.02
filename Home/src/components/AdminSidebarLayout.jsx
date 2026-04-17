import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "../styles/adminSidebarLayout.css";

const ADMIN_MENU_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "DB" },
  { to: "/admin/facilities", label: "Facilities", icon: "FC" },
  { to: "/admin/bookings", label: "Bookings", icon: "BK" },
  { to: "/admin/tickets", label: "Tickets", icon: "TK" },
  { to: "/admin/notifications", label: "Notifications", icon: "NT" },
];

const ADMIN_PAGE_META = {
  "/admin/dashboard": {
    title: "Admin Dashboard",
    subtitle: "Overview and insights for facilities analytics and monitoring.",
  },
  "/admin/facilities": {
    title: "Manage Facilities",
    subtitle: "Add, edit, and remove facilities using this admin interface.",
  },
  "/admin/bookings": {
    title: "Admin Bookings",
    subtitle: "Review and manage booking operations from this section.",
  },
  "/admin/tickets": {
    title: "Admin Tickets",
    subtitle: "Track and resolve support tickets across facilities services.",
  },
  "/admin/notifications": {
    title: "Admin Notifications",
    subtitle: "Monitor alerts and broadcast updates to campus operations teams.",
  },
};

function getAdminPageMeta(pathname) {
  if (pathname.startsWith("/admin/facilities")) {
    return ADMIN_PAGE_META["/admin/facilities"];
  }

  return (
    ADMIN_PAGE_META[pathname] || {
      title: "Admin Panel",
      subtitle: "Manage campus operations from the admin console.",
    }
  );
}

export default function AdminSidebarLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageMeta = getAdminPageMeta(location.pathname);

  return (
    <div className="admin-layout-shell">
      <aside className="admin-sidebar" aria-label="Admin sidebar navigation">
        <div className="admin-sidebar-header">
          <h1>Admin Panel</h1>
        </div>

        <nav className="admin-sidebar-nav">
          {ADMIN_MENU_ITEMS.map((item) => {
            const isActive = item.to === "/admin/facilities"
              ? location.pathname.startsWith("/admin/facilities")
              : location.pathname === item.to;

            const handleNavigate = () => {
              if (item.to === "/admin/dashboard") {
                navigate("/admin/dashboard");
                return;
              }

              if (item.to === "/admin/facilities") {
                navigate("/admin/facilities");
                return;
              }

              navigate(item.to);
            };

            return (
              <button
                key={item.to}
                type="button"
                className={isActive ? "admin-nav-item admin-nav-item-active" : "admin-nav-item"}
                onClick={handleNavigate}
              >
                <span className="admin-nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="admin-content-area">
        <header className="admin-content-header">
          <h2>{pageMeta.title}</h2>
          <p>{pageMeta.subtitle}</p>
        </header>

        <section className="admin-content-body">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
