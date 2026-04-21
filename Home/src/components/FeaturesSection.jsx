const features = [
  {
    title: "Resource Management",
    description:
      "Centralize all facility, lab, and equipment resources with real-time availability.",
    glyph: "RM",
  },
  {
    title: "Booking Workflow",
    description:
      "Create, approve, and track reservations with clear status transitions.",
    glyph: "BW",
  },
  {
    title: "Incident Tracking",
    description:
      "Capture maintenance issues and monitor progress from report to resolution.",
    glyph: "IT",
  },
  {
    title: "Notifications System",
    description:
      "Deliver updates for approvals, ticket changes, and important announcements.",
    glyph: "NS",
  },
];

export default function FeaturesSection() {
  return (
    <section className="section-block">
      <div className="section-head">
        <h2>Platform Features</h2>
      </div>
      <div className="feature-grid">
        {features.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <span className="feature-icon">{feature.glyph}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
