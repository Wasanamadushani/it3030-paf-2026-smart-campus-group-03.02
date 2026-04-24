import { Clock, UserPlus, UserCheck, UserX, Bell, Shield } from 'lucide-react';

function ActivityFeed({ activities = [] }) {
  const getActivityIcon = (type) => {
    const icons = {
      'user_registered': UserPlus,
      'user_activated': UserCheck,
      'user_deactivated': UserX,
      'notification_sent': Bell,
      'role_changed': Shield,
    };
    return icons[type] || Clock;
  };

  const getActivityColor = (type) => {
    const colors = {
      'user_registered': '#4CAF50',
      'user_activated': '#2196F3',
      'user_deactivated': '#FF9800',
      'notification_sent': '#9C27B0',
      'role_changed': '#FF5722',
    };
    return colors[type] || '#64748b';
  };

  // Mock data if no activities provided
  const defaultActivities = [
    {
      id: 1,
      type: 'user_registered',
      message: 'New user registered',
      user: 'John Doe',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString()
    },
    {
      id: 2,
      type: 'user_activated',
      message: 'User account activated',
      user: 'Jane Smith',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      id: 3,
      type: 'notification_sent',
      message: 'System notification sent',
      user: 'Admin',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString()
    },
    {
      id: 4,
      type: 'role_changed',
      message: 'User role updated to Manager',
      user: 'Mike Johnson',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString()
    },
    {
      id: 5,
      type: 'user_deactivated',
      message: 'User account deactivated',
      user: 'Sarah Wilson',
      timestamp: new Date(Date.now() - 60 * 60000).toISOString()
    }
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="content-card activity-feed-card">
      <div className="card-header">
        <div>
          <h3>Recent Activity</h3>
          <p>Latest system activities</p>
        </div>
        <button className="btn-text">View All</button>
      </div>
      
      <div className="card-content">
        <div className="activity-feed">
          {displayActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const color = getActivityColor(activity.type);
            
            return (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon" style={{ background: `${color}15`, color }}>
                  <Icon size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <div className="activity-meta">
                    <span className="activity-user">{activity.user}</span>
                    <span className="activity-time">
                      <Clock size={12} />
                      {getTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ActivityFeed;
