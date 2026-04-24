import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/notifications.css';

function NotificationsPage() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchNotifications();
  }, [filter, typeFilter]);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/status', {
        credentials: 'include'
      });
      const data = await response.json();

      if (!data.authenticated) {
        navigate('/');
        return;
      }

      setUser(data.user);
    } catch (err) {
      console.error('Auth check error:', err);
      navigate('/');
    }
  };

  const fetchNotifications = async () => {
    try {
      let url = 'http://localhost:5000/api/notifications?limit=50';
      
      if (filter === 'unread') {
        url += '&isRead=false';
      } else if (filter === 'read') {
        url += '&isRead=true';
      }

      if (typeFilter !== 'all') {
        url += `&type=${typeFilter}`;
      }

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH',
        credentials: 'include'
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  };

  const deleteNotification = async (id) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  const deleteAllRead = async () => {
    if (!confirm('Are you sure you want to delete all read notifications?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/notifications/read/all', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error('Delete all read error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <nav className="notifications-nav">
        <div className="nav-brand">
          <h2>Smart Campus Hub</h2>
        </div>
        <div className="nav-user">
          <span>{user?.name}</span>
          <span className="user-role">{user?.role}</span>
          <button onClick={() => navigate('/')} className="btn-back">
            Home
          </button>
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <button onClick={() => navigate('/admin/dashboard')} className="btn-back">
              Dashboard
            </button>
          )}
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="notifications-container">
        <div className="notifications-header">
          <div>
            <h1>Notifications</h1>
            <p>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
          </div>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn-secondary">
                Mark All as Read
              </button>
            )}
            <button onClick={deleteAllRead} className="btn-danger">
              Delete All Read
            </button>
          </div>
        </div>

        <div className="notifications-filters">
          <div className="filter-group">
            <label>Status:</label>
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
              onClick={() => setFilter('read')}
            >
              Read
            </button>
          </div>

          <div className="filter-group">
            <label>Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="INFO">Info</option>
              <option value="SUCCESS">Success</option>
              <option value="WARNING">Warning</option>
              <option value="ERROR">Error</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>
        </div>

        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`notification-card ${notif.isRead ? 'read' : 'unread'}`}
              >
                <div className="notification-content">
                  <div className="notification-header">
                    <span className={`notification-type ${notif.type.toLowerCase()}`}>
                      {notif.type}
                    </span>
                    <span className={`notification-priority ${notif.priority.toLowerCase()}`}>
                      {notif.priority}
                    </span>
                    <span className="notification-date">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3>{notif.title}</h3>
                  <p>{notif.message}</p>
                  {notif.link && (
                    <a href={notif.link} className="notification-link">
                      View Details →
                    </a>
                  )}
                </div>
                <div className="notification-actions">
                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="btn-icon"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif._id)}
                    className="btn-icon btn-delete"
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h3>No notifications</h3>
              <p>You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
