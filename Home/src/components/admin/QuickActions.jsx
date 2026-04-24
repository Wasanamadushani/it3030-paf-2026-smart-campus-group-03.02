import { UserPlus, Mail, Shield, Settings } from 'lucide-react';

function QuickActions() {
  const actions = [
    { icon: UserPlus, label: 'Add New User' },
    { icon: Mail, label: 'Send Notification' },
    { icon: Shield, label: 'Manage Roles' },
    { icon: Settings, label: 'System Settings' },
  ];

  return (
    <div className="content-card">
      <div className="card-header">
        <div>
          <h3>Quick Actions</h3>
          <p>Common admin tasks</p>
        </div>
      </div>
      
      <div className="card-content">
        <div className="quick-actions">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button key={index} className="quick-action">
                <Icon size={20} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default QuickActions;
