const notifications = [
  {
    title: "Lab booking approved",
    detail: "Computer Lab A | 10:00 AM - 12:00 PM",
    time: "5 min ago",
  },
  {
    title: "Ticket #352 updated",
    detail: "Projector issue marked in progress",
    time: "18 min ago",
  },
  {
    title: "Maintenance completed",
    detail: "AC servicing completed in Block C",
    time: "1 hour ago",
  },
];

export default function NotificationsPanel() {
  return (
    <section className="section-block">
      <div className="section-head">
        <h2>Recent Notifications</h2>
        <a href="#">View all</a>
      </div>
      <div className="notification-list">
        {notifications.map((item) => (
          <article key={item.title} className="notification-item">
            <span className="dot" />
            <div>
              <h4>{item.title}</h4>
              <p>{item.detail}</p>
            </div>
            <small>{item.time}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
