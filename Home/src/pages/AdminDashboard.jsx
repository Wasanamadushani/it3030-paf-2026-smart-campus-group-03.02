import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Bell, 
  Activity,
  XCircle,
  UserPlus,
  Download,
  Home
} from 'lucide-react';

// Import components
import Sidebar from '../components/admin/Sidebar';
import OverviewTab from '../components/admin/OverviewTab';
import UserModal from '../components/admin/UserModal';

import '../styles/admin-dashboard.css';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

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
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      console.error('Auth check error:', err);
      navigate('/');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, notifsRes] = await Promise.all([
        fetch('http://localhost:5000/api/roles/statistics', { credentials: 'include' }),
        fetch('http://localhost:5000/api/roles/users?limit=8', { credentials: 'include' }),
        fetch('http://localhost:5000/api/notifications?limit=6', { credentials: 'include' })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      if (notifsRes.ok) {
        const notifsData = await notifsRes.json();
        setNotifications(notifsData.notifications || []);
      }
    } catch (err) {
      console.error('Fetch dashboard data error:', err);
    } finally {
      setLoading(false);
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

  const handleMarkAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include'
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH',
        credentials: 'include'
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await fetch(`http://localhost:5000/api/roles/users/${userId}/toggle-status`, {
        method: 'PATCH',
        credentials: 'include'
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Toggle user status error:', err);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      trend: '+12% from last month',
      icon: Users,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      trend: '+8% from last week',
      icon: Activity,
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)'
    },
    {
      title: 'Inactive Users',
      value: stats?.inactiveUsers || 0,
      trend: '+2% from last week',
      icon: XCircle,
      gradient: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)'
    },
    {
      title: 'Unread Notifications',
      value: notifications.filter(n => !n.isRead).length,
      trend: '+5 today',
      icon: Bell,
      gradient: 'linear-gradient(135deg, #2196F3 0%, #03A9F4 100%)'
    }
  ];

  const getTabTitle = () => {
    const titles = {
      overview: 'Dashboard Overview',
      users: 'Users Management',
      notifications: 'Notifications Center',
      analytics: 'Analytics Dashboard',
      settings: 'System Settings'
    };
    return titles[activeTab] || 'Dashboard';
  };

  const getTabDescription = () => {
    const descriptions = {
      overview: `Welcome back, ${user?.name}. Here's what's happening with your platform today.`,
      users: 'Manage users, roles, and permissions across your platform.',
      notifications: 'View and manage all system notifications and alerts.',
      analytics: 'Detailed analytics and insights about your platform performance.',
      settings: 'Configure system settings and preferences.'
    };
    return descriptions[activeTab] || '';
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="main-content">
        {/* Enhanced Header with Breadcrumb */}
        <header className="main-header">
          <div className="header-content">
            <div className="breadcrumb">
              <span className="breadcrumb-item">Admin</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item active">{getTabTitle()}</span>
            </div>
            <div className="header-title-section">
              <h1 className="header-title">{getTabTitle()}</h1>
              <p className="header-description">{getTabDescription()}</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-icon" onClick={() => navigate('/')} title="Go to Home">
              <Home size={20} />
            </button>
            <button className="btn-secondary">
              <Download size={16} />
              <span>Export</span>
            </button>
            <button className="btn-primary">
              <UserPlus size={16} />
              <span>Add User</span>
            </button>
          </div>
        </header>

        {/* Content Area with smooth transitions */}
        <div className="content-wrapper">
          {activeTab === 'overview' && (
            <div className="tab-content fade-in">
              <OverviewTab 
                statsCards={statsCards}
                users={users}
                notifications={notifications}
                stats={stats}
                onViewUser={handleViewUser}
                onToggleStatus={handleToggleUserStatus}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="tab-content fade-in">
              <div className="tab-placeholder">
                <div className="placeholder-icon">
                  <Users size={64} />
                </div>
                <h2>Users Management</h2>
                <p>Comprehensive user management system coming soon</p>
                <button className="btn-primary" style={{ marginTop: '20px' }}>
                  <UserPlus size={16} />
                  <span>Add New User</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="tab-content fade-in">
              <div className="tab-placeholder">
                <div className="placeholder-icon">
                  <Bell size={64} />
                </div>
                <h2>Notifications Center</h2>
                <p>Advanced notification management system coming soon</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="tab-content fade-in">
              <div className="tab-placeholder">
                <div className="placeholder-icon">
                  <Activity size={64} />
                </div>
                <h2>Analytics Dashboard</h2>
                <p>Detailed analytics and reporting tools coming soon</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-content fade-in">
              <div className="tab-placeholder">
                <div className="placeholder-icon">
                  <XCircle size={64} />
                </div>
                <h2>System Settings</h2>
                <p>System configuration and preferences coming soon</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* User Modal */}
      {showUserModal && (
        <UserModal 
          user={selectedUser}
          onClose={() => setShowUserModal(false)}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
