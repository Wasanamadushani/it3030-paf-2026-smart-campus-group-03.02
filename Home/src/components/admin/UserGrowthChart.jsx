import { TrendingUp, Calendar } from 'lucide-react';

function UserGrowthChart() {
  // Mock data for the last 7 days
  const growthData = [
    { day: 'Mon', users: 45, percentage: 60 },
    { day: 'Tue', users: 52, percentage: 70 },
    { day: 'Wed', users: 38, percentage: 50 },
    { day: 'Thu', users: 65, percentage: 87 },
    { day: 'Fri', users: 58, percentage: 77 },
    { day: 'Sat', users: 72, percentage: 96 },
    { day: 'Sun', users: 75, percentage: 100 }
  ];

  const totalGrowth = growthData.reduce((sum, day) => sum + day.users, 0);
  const avgGrowth = Math.round(totalGrowth / growthData.length);

  return (
    <div className="content-card user-growth-card">
      <div className="card-header">
        <div>
          <h3>User Growth</h3>
          <p>New registrations this week</p>
        </div>
        <div className="growth-summary">
          <TrendingUp size={16} style={{ color: '#4CAF50' }} />
          <span style={{ color: '#4CAF50', fontWeight: 600 }}>+{totalGrowth} users</span>
        </div>
      </div>
      
      <div className="card-content">
        <div className="growth-stats">
          <div className="growth-stat">
            <span className="stat-label">Total This Week</span>
            <span className="stat-value">{totalGrowth}</span>
          </div>
          <div className="growth-stat">
            <span className="stat-label">Daily Average</span>
            <span className="stat-value">{avgGrowth}</span>
          </div>
          <div className="growth-stat">
            <span className="stat-label">Peak Day</span>
            <span className="stat-value">Sunday</span>
          </div>
        </div>

        <div className="growth-chart">
          {growthData.map((data, index) => (
            <div key={index} className="chart-bar-container">
              <div className="chart-bar-wrapper">
                <div 
                  className="chart-bar"
                  style={{ 
                    height: `${data.percentage}%`,
                    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <span className="bar-value">{data.users}</span>
                </div>
              </div>
              <span className="chart-label">{data.day}</span>
            </div>
          ))}
        </div>

        <div className="chart-footer">
          <Calendar size={14} />
          <span>Last 7 days</span>
        </div>
      </div>
    </div>
  );
}

export default UserGrowthChart;
