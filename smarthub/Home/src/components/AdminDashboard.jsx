// src/components/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { ticketService } from '../services/ticketService';
import '../styles/adminDashboard.css';

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });

  useEffect(() => {
    fetchAllTickets();
  }, []);

  useEffect(() => {
    if (tickets.length > 0) {
      calculateStats();
    }
  }, [tickets]);

  const fetchAllTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketService.getAllTickets();
      setTickets(data);
      setError('');
    } catch (err) {
      setError('Failed to load tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const newStats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'OPEN').length,
      inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      resolved: tickets.filter(t => t.status === 'RESOLVED').length,
      closed: tickets.filter(t => t.status === 'CLOSED').length
    };
    setStats(newStats);
  };

  const getFilteredTickets = () => {
    return tickets.filter(ticket => {
      const statusMatch = !filterStatus || ticket.status === filterStatus;
      const priorityMatch = !filterPriority || ticket.priority === filterPriority;
      const categoryMatch = !filterCategory || ticket.category === filterCategory;
      return statusMatch && priorityMatch && categoryMatch;
    });
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await ticketService.updateTicketStatus(ticketId, newStatus);
      fetchAllTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setError('Failed to update ticket status');
      console.error(err);
    }
  };

  const handleAddComment = async (ticketId) => {
    if (!adminComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      await ticketService.addAdminComments(ticketId, adminComment);
      setAdminComment('');
      fetchAllTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, adminComments: adminComment }));
      }
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await ticketService.deleteTicket(ticketId);
        fetchAllTickets();
        setSelectedTicket(null);
      } catch (err) {
        setError('Failed to delete ticket');
        console.error(err);
      }
    }
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority.toLowerCase()}`;
  };

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase()}`;
  };

  const filteredTickets = getFilteredTickets();

  if (loading) {
    return <div className="admin-dashboard"><p className="loading">Loading dashboard...</p></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard - Ticket Management</h1>
        <button className="refresh-btn" onClick={fetchAllTickets}>
          🔄 Refresh
        </button>
      </div>

      {/* Statistics Section */}
      <div className="stats-container">
        <div className="stat-card stat-total">
          <h3>Total Tickets</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card stat-open">
          <h3>Open</h3>
          <p className="stat-number">{stats.open}</p>
        </div>
        <div className="stat-card stat-in-progress">
          <h3>In Progress</h3>
          <p className="stat-number">{stats.inProgress}</p>
        </div>
        <div className="stat-card stat-resolved">
          <h3>Resolved</h3>
          <p className="stat-number">{stats.resolved}</p>
        </div>
        <div className="stat-card stat-closed">
          <h3>Closed</h3>
          <p className="stat-number">{stats.closed}</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="dashboard-content">
        {/* Filters Section */}
        <div className="filters-section">
          <h3>Filters</h3>
          <div className="filter-group">
            <label htmlFor="statusFilter">Status:</label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="priorityFilter">Priority:</label>
            <select
              id="priorityFilter"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="categoryFilter">Category:</label>
            <select
              id="categoryFilter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="GRADES">Grades</option>
              <option value="ASSIGNMENT_HELP">Assignment Help</option>
              <option value="ATTENDANCE">Attendance</option>
              <option value="COURSE_CONTENT">Course Content</option>
              <option value="EXAM_RELATED">Exam Related</option>
              <option value="FEE_RELATED">Fee Related</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <button 
            className="clear-filters-btn"
            onClick={() => {
              setFilterStatus('');
              setFilterPriority('');
              setFilterCategory('');
            }}
          >
            Clear Filters
          </button>
        </div>

        {/* Tickets List Section */}
        <div className="tickets-list-section">
          <h3>Tickets ({filteredTickets.length})</h3>

          {filteredTickets.length === 0 ? (
            <div className="no-tickets">
              <p>No tickets found</p>
            </div>
          ) : (
            <div className="tickets-table-wrapper">
              <table className="tickets-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(ticket => (
                    <tr key={ticket.id} className={`ticket-row ${getStatusClass(ticket.status)}`}>
                      <td className="ticket-id">{ticket.id.substring(0, 8)}...</td>
                      <td>{ticket.studentId}</td>
                      <td className="ticket-title">{ticket.title}</td>
                      <td>{ticket.category.replace(/_/g, ' ')}</td>
                      <td>
                        <span className={`badge priority-badge ${getPriorityClass(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge status-badge ${getStatusClass(ticket.status)}`}>
                          {ticket.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="ticket-date">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button 
                          className="view-btn"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ticket Details</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedTicket(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="ticket-details">
                <div className="detail-group">
                  <label>Ticket ID:</label>
                  <p>{selectedTicket.id}</p>
                </div>

                <div className="detail-group">
                  <label>Student ID:</label>
                  <p>{selectedTicket.studentId}</p>
                </div>

                <div className="detail-group">
                  <label>Title:</label>
                  <p>{selectedTicket.title}</p>
                </div>

                <div className="detail-group">
                  <label>Description:</label>
                  <p className="description">{selectedTicket.description}</p>
                </div>

                <div className="detail-group">
                  <label>Category:</label>
                  <p>{selectedTicket.category.replace(/_/g, ' ')}</p>
                </div>

                <div className="detail-row">
                  <div className="detail-group">
                    <label>Priority:</label>
                    <span className={`badge priority-badge ${getPriorityClass(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>

                  <div className="detail-group">
                    <label>Status:</label>
                    <span className={`badge status-badge ${getStatusClass(selectedTicket.status)}`}>
                      {selectedTicket.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-group">
                    <label>Created:</label>
                    <p>{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="detail-group">
                    <label>Updated:</label>
                    <p>{selectedTicket.updatedAt 
                      ? new Date(selectedTicket.updatedAt).toLocaleString() 
                      : 'Not updated'}</p>
                  </div>
                </div>

                <div className="detail-group">
                  <label>Admin Comments:</label>
                  <p className="comments">{selectedTicket.adminComments || 'No comments yet'}</p>
                </div>

                {/* Status Update */}
                <div className="detail-group">
                  <label>Update Status:</label>
                  <div className="status-buttons">
                    {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
                      <button
                        key={status}
                        className={`status-btn ${selectedTicket.status === status ? 'active' : ''}`}
                        onClick={() => handleStatusChange(selectedTicket.id, status)}
                      >
                        {status.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Comment */}
                <div className="detail-group">
                  <label>Add Admin Comment:</label>
                  <textarea
                    className="comment-input"
                    placeholder="Enter your admin comment..."
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    rows="4"
                  />
                  <button 
                    className="submit-btn"
                    onClick={() => handleAddComment(selectedTicket.id)}
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="delete-btn"
                onClick={() => handleDeleteTicket(selectedTicket.id)}
              >
                Delete Ticket
              </button>
              <button 
                className="close-modal-btn"
                onClick={() => setSelectedTicket(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
