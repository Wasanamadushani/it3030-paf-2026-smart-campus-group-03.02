import { TrendingUp } from 'lucide-react';

function StatsCard({ title, value, trend, icon: Icon, gradient }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: gradient }}>
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-number">{value}</p>
        {trend && (
          <span className="stat-trend">
            <TrendingUp size={14} />
            <span>{trend}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
