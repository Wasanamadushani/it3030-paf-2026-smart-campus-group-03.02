import { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, MoreVertical, Clock } from 'lucide-react';

function UsersTable({ users, onViewUser, onToggleStatus }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="content-card">
      <div className="card-header">
        <div>
          <h3>Recent Users</h3>
          <p>Latest registered users</p>
        </div>
        <div className="card-actions">
          <div className="search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-icon">
            <Filter size={16} />
          </button>
        </div>
      </div>
      
      <div className="card-content">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar-small">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{user.name || 'Unknown User'}</strong>
                      <p>{user.email || 'No email'}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge role-${(user.role || 'customer').toLowerCase()}`}>
                    {user.role || 'CUSTOMER'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? (
                      <>
                        <CheckCircle size={12} />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={12} />
                        <span>Inactive</span>
                      </>
                    )}
                  </span>
                </td>
                <td>
                  <span className="timestamp">
                    <Clock size={12} />
                    <span>Just now</span>
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon-small"
                      onClick={() => onViewUser(user)}
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      className="btn-icon-small"
                      onClick={() => onToggleStatus(user._id, user.isActive)}
                      title={user.isActive ? "Deactivate" : "Activate"}
                    >
                      {user.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    </button>
                    <button className="btn-icon-small">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="card-footer">
        <button className="btn-text">View All Users</button>
      </div>
    </div>
  );
}

export default UsersTable;
