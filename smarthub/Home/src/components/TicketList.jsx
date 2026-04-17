// src/components/TicketList.jsx

import React, { useState, useEffect } from 'react';
import { ticketService } from '../services/ticketService';
import '../styles/ticketList.css';

const TicketList = ({ studentId, isAdmin = false }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [studentId, filterStatus]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let data;
      if (isAdmin) {
        data = await ticketService.getAllTickets();
      } else if (filterStatus) {
        data = await ticketService.getTicketsByStatus(filterStatus);
      } else {
        data = await ticketService.getStudentTickets(studentId);
      }
      setTickets(data);
      setError('');
    } catch (err) {
      setError('Failed to load tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await ticketService.updateTicketStatus(ticketId, newStatus);
      fetchTickets();
      setSelectedTicket(null);
    } catch (err) {
      setError('Failed to update ticket status');
      console.error(err);
    }
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority.toLowerCase()}`;
  };

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase()}`;
  };

  if (loading) {
    return <div className="ticket-list-container"><p>Loading tickets...</p></div>;
  }

  return (
    <div className="ticket-list-container">
      <div className="ticket-list-header">
        <h2>{isAdmin ? 'All Support Tickets' : 'My Tickets'}</h2>
        <div className="filter-group">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {tickets.length === 0 ? (
        <div className="no-tickets">
          <p>No tickets found</p>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map(ticket => (
            <div 
              key={ticket.id} 
              className="ticket-card"
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="ticket-header">
                <h3>{ticket.title}</h3>
                <span className={`badge status-badge ${getStatusClass(ticket.status)}`}>
                  {ticket.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="ticket-description">{ticket.description.substring(0, 100)}...</p>
              <div className="ticket-meta">
                <span className={`badge priority-badge ${getPriorityClass(ticket.priority)}`}>
                  {ticket.priority}
                </span>
                <span className="badge category-badge">
                  {ticket.category.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="ticket-footer">
                <small>{new Date(ticket.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTicket && (
        <TicketDetailModal 
          ticket={selectedTicket}
          isAdmin={isAdmin}
          onClose={() => setSelectedTicket(null)}
          onStatusChange={handleStatusChange}
          onRefresh={fetchTickets}
        />
      )}
    </div>
  );
};

// Ticket Detail Modal Component
const TicketDetailModal = ({ ticket, isAdmin, onClose, onStatusChange, onRefresh }) => {
  const [adminComments, setAdminComments] = useState(ticket.adminComments || '');
  const [editingComments, setEditingComments] = useState(false);

  const handleSaveComments = async () => {
    try {
      await ticketService.addAdminComments(ticket.id, adminComments);
      setEditingComments(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to save comments:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{ticket.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="ticket-detail-row">
            <strong>Ticket ID:</strong>
            <span>#{ticket.id}</span>
          </div>
          <div className="ticket-detail-row">
            <strong>Student ID:</strong>
            <span>{ticket.studentId}</span>
          </div>
          <div className="ticket-detail-row">
            <strong>Status:</strong>
            {isAdmin ? (
              <select 
                value={ticket.status}
                onChange={(e) => onStatusChange(ticket.id, e.target.value)}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            ) : (
              <span className={`badge status-${ticket.status.toLowerCase()}`}>
                {ticket.status.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          <div className="ticket-detail-row">
            <strong>Category:</strong>
            <span>{ticket.category.replace(/_/g, ' ')}</span>
          </div>
          <div className="ticket-detail-row">
            <strong>Priority:</strong>
            <span className={`badge priority-${ticket.priority.toLowerCase()}`}>
              {ticket.priority}
            </span>
          </div>
          <div className="ticket-detail-row">
            <strong>Created Date:</strong>
            <span>{new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
          {ticket.updatedAt && (
            <div className="ticket-detail-row">
              <strong>Last Updated:</strong>
              <span>{new Date(ticket.updatedAt).toLocaleString()}</span>
            </div>
          )}

          <div className="description-section">
            <strong>Description:</strong>
            <p>{ticket.description}</p>
          </div>

          {isAdmin && (
            <div className="admin-comments-section">
              <strong>Admin Comments:</strong>
              {editingComments ? (
                <div className="comment-edit">
                  <textarea 
                    value={adminComments}
                    onChange={(e) => setAdminComments(e.target.value)}
                    rows="4"
                  />
                  <div className="comment-actions">
                    <button onClick={handleSaveComments} className="btn btn-primary">Save</button>
                    <button onClick={() => setEditingComments(false)} className="btn btn-secondary">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p>{adminComments || 'No comments yet'}</p>
                  <button 
                    onClick={() => setEditingComments(true)}
                    className="btn btn-secondary"
                  >
                    {adminComments ? 'Edit Comments' : 'Add Comments'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default TicketList;
