// Integration Example - Add this to your Home/src/App.jsx

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TicketsPage from './pages/TicketsPage';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
  const [currentStudentId] = useState('STU001'); // Get from auth/context in real app
  const [isAdminUser] = useState(false); // Get from auth/context in real app

  return (
    <Router>
      <div className="app">
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              SmartHub
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/tickets" className="nav-link">
                  Support Tickets {/* New link for tickets */}
                </Link>
              </li>
              <li className="nav-item">
                <a href="#profile" className="nav-link">
                  Profile
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Ticket System Route */}
          <Route 
            path="/tickets" 
            element={
              <TicketsPage 
                studentId={currentStudentId}
                isAdmin={isAdminUser}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

/*
  EXAMPLE: Admin View
  
  If you want to create an admin-only page, use:
  
  <Route 
    path="/admin/tickets" 
    element={
      isAdminUser ? (
        <TicketsPage 
          studentId={currentStudentId}
          isAdmin={true}
        />
      ) : (
        <Navigate to="/" />
      )
    } 
  />
*/

/*
  NOTE: Replace:
  - currentStudentId with value from auth system/context
  - isAdminUser with boolean from auth system/context
  
  Example using Context:
  
  const { user } = useAuth();
  
  <TicketsPage 
    studentId={user?.id}
    isAdmin={user?.role === 'ADMIN'}
  />
*/
