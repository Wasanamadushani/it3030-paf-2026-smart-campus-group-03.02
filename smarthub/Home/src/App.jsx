import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import HomePage from "./pages/HomePage";
import TicketsPage from "./pages/TicketsPage";
import AdminPage from "./pages/AdminPage";
import Navbar from "./components/Navbar";
import "./styles/home.css";

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [studentId] = useState('STU001'); // In a real app, this would come from authentication

  const renderPage = () => {
    switch(currentPage) {
      case 'tickets':
        return <TicketsPage studentId={studentId} isAdmin={false} />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <AuthProvider>
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
      />
      {renderPage()}
    </AuthProvider>
  );
}

export default App;
