import { Bell, Clock } from 'lucide-react';

function NotificationsPanel({ notifications, onMarkAsRead, onMarkAllAsRead }) {
  return (
    <div className="content-card">
      <div className="card-header">
        <div>
          <h3>Recent Notifications</h3>
          <p>Latest system notifications</p>
        </div>
        <div className="card-actions">
          <button className="btn-text" onClick={onMarkAllAsRead}>
            Mark all as read
          </button>
        </div>
      </div>
      
      <div className="card-content">
        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                onClick={() => !notif.isRead && onMarkAsRead(notif._id)}
              >
                <div className="notification-icon">
                  <Bell size={16} />
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <span className={`notification-type type-${notif.type.toLowerCase()}`}>
                      {notif.type}
                    </span>
                    <span className="notification-time">
                      <Clock size={12} />
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4>{notif.title}</h4>
                  <p>{notif.message}</p>
                </div>
                {!notif.isRead && <div className="unread-indicator"></div>}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Bell size={32} />
              <p>No notifications</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="card-footer">
        <button className="btn-text">View All Notifications</button>
      </div>
    </div>
  );
}

export default NotificationsPanel;
