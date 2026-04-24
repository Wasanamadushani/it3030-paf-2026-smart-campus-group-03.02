import { 
  BarChart3, 
  Users, 
  Bell, 
  TrendingUp, 
  Settings, 
  LogOut 
} from 'lucide-react';

function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const navItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-logo">SC</div>
          <div>
            <h2>Smart Campus</h2>
            <p>Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <strong>{user?.name || 'Admin'}</strong>
            <span className="user-role">{user?.role || 'ADMIN'}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
