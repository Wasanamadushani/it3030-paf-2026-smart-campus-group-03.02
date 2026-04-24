import StatsCard from './StatsCard';
import UsersTable from './UsersTable';
import NotificationsPanel from './NotificationsPanel';
import RoleDistribution from './RoleDistribution';
import QuickActions from './QuickActions';
import ActivityFeed from './ActivityFeed';
import SystemHealth from './SystemHealth';
import UserGrowthChart from './UserGrowthChart';

function OverviewTab({ 
  statsCards, 
  users, 
  notifications, 
  stats,
  onViewUser,
  onToggleStatus,
  onMarkAsRead,
  onMarkAllAsRead
}) {
  return (
    <>
      {/* Stats Cards */}
      <div className="stats-grid">
        {statsCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      {/* Enhanced Overview Grid */}
      <div className="overview-grid">
        {/* Left Column - Main Content */}
        <div className="overview-main">
          <UserGrowthChart />
          
          <UsersTable 
            users={users}
            onViewUser={onViewUser}
            onToggleStatus={onToggleStatus}
          />
        </div>

        {/* Right Column - Sidebar Content */}
        <div className="overview-sidebar">
          <SystemHealth />
          
          <ActivityFeed />
          
          <NotificationsPanel 
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="overview-bottom">
        <RoleDistribution 
          roleData={stats?.roleDistribution}
          totalUsers={stats?.totalUsers || 0}
        />

        <QuickActions />
      </div>
    </>
  );
}

export default OverviewTab;
