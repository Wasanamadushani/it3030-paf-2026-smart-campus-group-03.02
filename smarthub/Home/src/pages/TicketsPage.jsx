// src/pages/TicketsPage.jsx

import React, { useState } from 'react';
import TicketForm from '../components/TicketForm';
import TicketList from '../components/TicketList';
import '../styles/ticketsPage.css';

const TicketsPage = ({ studentId = 'STU001', isAdmin = false }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('form');

  const handleTicketCreated = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('list');
  };

  return (
    <div className="tickets-page">
      <div className="page-header">
        <h1>Academic Support Ticket System</h1>
        <p className="subtitle">
          {isAdmin ? 'Manage all support tickets' : 'Raise and track your academic issues'}
        </p>
      </div>

      {!isAdmin && (
        <div className="tab-container">
          <button
            className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            Raise New Ticket
          </button>
          <button
            className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            My Tickets
          </button>
        </div>
      )}

      <div className="page-content">
        {activeTab === 'form' && !isAdmin && (
          <TicketForm 
            studentId={studentId}
            onTicketCreated={handleTicketCreated}
          />
        )}
        {activeTab === 'list' && (
          <TicketList 
            key={refreshKey}
            studentId={studentId}
            isAdmin={isAdmin}
          />
        )}
        {isAdmin && (
          <TicketList 
            key={refreshKey}
            studentId={studentId}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </div>
  );
};

export default TicketsPage;
