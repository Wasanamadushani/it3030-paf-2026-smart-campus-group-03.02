// src/services/ticketService.js

const API_BASE_URL = 'http://localhost:8081/api/tickets';

export const ticketService = {
  // Create a new ticket
  createTicket: async (ticketData) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });
      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  // Get all tickets for a specific student
  getStudentTickets: async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch student tickets');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching student tickets:', error);
      throw error;
    }
  },

  // Get all tickets (admin view)
  getAllTickets: async () => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch all tickets');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      throw error;
    }
  },

  // Get a specific ticket
  getTicketById: async (ticketId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${ticketId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },

  // Get tickets by status
  getTicketsByStatus: async (status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/status/${status}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tickets by status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tickets by status:', error);
      throw error;
    }
  },

  // Update ticket status
  updateTicketStatus: async (ticketId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${ticketId}/status?status=${status}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to update ticket status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  },

  // Add admin comments
  addAdminComments: async (ticketId, comments) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${ticketId}/comments?comments=${encodeURIComponent(comments)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to add admin comments');
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding admin comments:', error);
      throw error;
    }
  },

  // Delete ticket
  deleteTicket: async (ticketId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${ticketId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete ticket');
      }
      return true;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  },
};
