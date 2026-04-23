// src/components/TicketForm.jsx

import React, { useState } from 'react';
import { ticketService } from '../services/ticketService';
import '../styles/ticketForm.css';

const TicketForm = ({ studentId, onTicketCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'GRADES',
    'ASSIGNMENT_HELP',
    'ATTENDANCE',
    'COURSE_CONTENT',
    'EXAM_RELATED',
    'FEE_RELATED',
    'OTHER'
  ];

  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const ticketData = {
        studentId,
        ...formData
      };
      const response = await ticketService.createTicket(ticketData);
      setSuccess('Ticket raised successfully!');
      setFormData({
        title: '',
        description: '',
        category: 'OTHER',
        priority: 'MEDIUM',
      });
      if (onTicketCreated) {
        onTicketCreated(response);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create ticket. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ticket-form-container">
      <div className="ticket-form-card">
        <h2>Raise an Academic Issue Ticket</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-group">
            <label htmlFor="title">Ticket Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief description of your issue"
              required
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please provide detailed information about your issue"
              required
              rows="6"
              maxLength="2000"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority *</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                {priorities.map(pri => (
                  <option key={pri} value={pri}>
                    {pri}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Ticket...' : 'Raise Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;
