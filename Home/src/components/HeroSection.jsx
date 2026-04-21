import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <span className="hero-badge">Campus-wide Operations</span>
        <h1>Manage Campus Resources Easily</h1>
        <p>
          Smart Campus Operations Hub helps your university manage room bookings,
          maintenance workflows, incident tickets, and notifications from one place.
        </p>
        <div className="hero-actions">
          <Link to="/facilities" className="btn btn-primary">
            View Resources
          </Link>
          <button className="btn btn-ghost">Create Booking</button>
        </div>
      </div>
      <div className="hero-panel" aria-hidden="true">
        <div className="pulse-orb" />
        <div className="hero-metrics">
          <div>
            <p>Today&apos;s Bookings</p>
            <strong>48</strong>
          </div>
          <div>
            <p>Open Incidents</p>
            <strong>12</strong>
          </div>
          <div>
            <p>Approvals Pending</p>
            <strong>6</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
