function UserModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>User Details</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-content">
          <div className="user-details">
            <div className="user-avatar-large">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="user-info-large">
              <h2>{user.name || 'Unknown User'}</h2>
              <p>{user.email || 'No email'}</p>
              <div className="user-meta">
                <span className={`role-badge role-${(user.role || 'customer').toLowerCase()}`}>
                  {user.role || 'CUSTOMER'}
                </span>
                <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn-primary">
              Edit User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserModal;
