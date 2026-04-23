const stats = [
  { label: "Total Bookings", value: "1,284", trend: "+12%" },
  { label: "Active Tickets", value: "34", trend: "-5%" },
  { label: "Available Resources", value: "96", trend: "+3%" },
];

export default function DashboardPreview() {
  return (
    <section className="section-block">
      <div className="section-head">
        <h2>Dashboard Preview</h2>
      </div>
      <div className="stats-grid">
        {stats.map((item) => (
          <article key={item.label} className="stat-card">
            <p>{item.label}</p>
            <strong>{item.value}</strong>
            <span>{item.trend} this month</span>
          </article>
        ))}
      </div>

      <article className="chart-card">
        <div className="section-head">
          <h3>Weekly Booking Activity</h3>
        </div>
        <div className="bars-wrap" aria-label="Sample booking chart">
          {[42, 68, 54, 79, 91, 73, 64].map((height, idx) => (
            <div key={idx} className="bar-item">
              <div style={{ height: `${height}%` }} className="bar-fill" />
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
