// src/pages/AdminPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';
import AdminDashboard from '../components/AdminDashboard';
import '../styles/adminPage.css';

const AdminPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  if (!isAuthenticated || !isAdmin) {
    return <LoginForm onLoginSuccess={() => setJustLoggedIn(true)} />;
  }

  return (
    <div className="admin-page">
      <AdminDashboard />
    </div>
  );
};

export default AdminPage;
