import { Shield } from 'lucide-react';

function RoleDistribution({ roleData, totalUsers }) {
  const getRoleColor = (role) => {
    const colors = {
      admin: '#FF5722',
      manager: '#FF9800',
      staff: '#2196F3',
      customer: '#4CAF50'
    };
    return colors[role.toLowerCase()] || '#667eea';
  };

  return (
    <div className="content-card">
      <div className="card-header">
        <div>
          <h3>Role Distribution</h3>
          <p>User roles overview</p>
        </div>
      </div>
      
      <div className="card-content">
        {roleData && roleData.length > 0 ? (
          <div className="role-distribution">
            {roleData.map((role) => (
              <div key={role.role || 'unknown'} className="role-item">
                <div className="role-info">
                  <span className={`role-badge role-${(role.role || 'unknown').toLowerCase()}`}>
                    {role.role || 'Unknown'}
                  </span>
                  <span className="role-count">{role.count || 0} users</span>
                </div>
                <div className="role-bar">
                  <div 
                    className="role-bar-fill"
                    style={{ 
                      width: `${totalUsers > 0 ? ((role.count || 0) / totalUsers) * 100 : 0}%`,
                      background: getRoleColor(role.role || 'unknown')
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Shield size={32} />
            <p>No role data</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoleDistribution;
