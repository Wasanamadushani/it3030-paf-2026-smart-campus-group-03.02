import { Server, Database, Wifi, HardDrive, CheckCircle, AlertCircle } from 'lucide-react';

function SystemHealth() {
  const healthMetrics = [
    {
      name: 'API Server',
      status: 'healthy',
      uptime: '99.9%',
      icon: Server,
      color: '#4CAF50'
    },
    {
      name: 'Database',
      status: 'healthy',
      uptime: '99.8%',
      icon: Database,
      color: '#4CAF50'
    },
    {
      name: 'Network',
      status: 'healthy',
      uptime: '100%',
      icon: Wifi,
      color: '#4CAF50'
    },
    {
      name: 'Storage',
      status: 'warning',
      uptime: '85% used',
      icon: HardDrive,
      color: '#FF9800'
    }
  ];

  return (
    <div className="content-card system-health-card">
      <div className="card-header">
        <div>
          <h3>System Health</h3>
          <p>Real-time system status</p>
        </div>
        <div className="health-status">
          <CheckCircle size={16} style={{ color: '#4CAF50' }} />
          <span style={{ color: '#4CAF50', fontWeight: 600 }}>All Systems Operational</span>
        </div>
      </div>
      
      <div className="card-content">
        <div className="health-metrics">
          {healthMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const StatusIcon = metric.status === 'healthy' ? CheckCircle : AlertCircle;
            
            return (
              <div key={index} className="health-metric">
                <div className="metric-icon" style={{ background: `${metric.color}15`, color: metric.color }}>
                  <Icon size={20} />
                </div>
                <div className="metric-info">
                  <div className="metric-header">
                    <span className="metric-name">{metric.name}</span>
                    <StatusIcon 
                      size={14} 
                      style={{ color: metric.color }}
                    />
                  </div>
                  <div className="metric-details">
                    <span className="metric-uptime">{metric.uptime}</span>
                    <span 
                      className="metric-status"
                      style={{ 
                        color: metric.color,
                        background: `${metric.color}15`
                      }}
                    >
                      {metric.status}
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

export default SystemHealth;
