import { useNavigate } from "react-router-dom";

const actions = [
  {
    title: "Book a Resource",
    desc: "Reserve rooms, labs, and equipment in minutes.",
    type: "USER",
    to: "/facilities",
  },
  {
    title: "View My Bookings",
    desc: "Track status, schedules, and booking history.",
    type: "USER",
    to: "/booking",
  },
  {
    title: "Report an Issue",
    desc: "Log incidents and maintenance requests quickly.",
    type: "USER",
    to: "/tickets",
  },
  {
    title: "View Tickets",
    desc: "Monitor active incidents and resolution progress.",
    type: "USER",
    to: "/tickets/my",
  },
  {
    title: "Admin Dashboard",
    desc: "Manage users, approvals, and campus-level settings.",
    type: "ADMIN",
    to: "/admin/dashboard",
  },
];

export default function QuickActions({ role = "USER" }) {
  const navigate = useNavigate();
  const visibleActions = actions.filter(
    (action) => action.type === "USER" || role === "ADMIN"
  );

  return (
    <section className="section-block">
      <div className="section-head">
        <h2>Quick Actions</h2>
        <button type="button" className="link-btn" onClick={() => navigate("/tickets")}>See all</button>
      </div>
      <div className="actions-grid">
        {visibleActions.map((action) => (
          <article key={action.title} className="action-card">
            <div className="action-icon">+</div>
            <h3>{action.title}</h3>
            <p>{action.desc}</p>
            <button className="link-btn" onClick={() => navigate(action.to)}>Open</button>
          </article>
        ))}
      </div>
    </section>
  );
}
