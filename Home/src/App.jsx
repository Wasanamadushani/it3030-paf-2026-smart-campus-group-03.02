import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import FacilitiesPage from "./pages/FacilitiesPage";
import AdminSidebarLayout from "./components/AdminSidebarLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageFacilities from "./pages/Admin/ManageFacilities";
import AdminBookings from "./pages/Admin/AdminBookings";
import AdminTickets from "./pages/Admin/AdminTickets";
import AdminNotifications from "./pages/Admin/AdminNotifications";
import FacilityDetails from "./pages/FacilityDetails";
import BookingPage from "./pages/BookingPage";
import "./styles/home.css";


function App() {
  return (
    <BrowserRouter>
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/view-facilities" element={<Navigate to="/facilities" replace />} />

        <Route path="/admin" element={<AdminSidebarLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="facilities" element={<ManageFacilities />} />
          <Route path="manage-facilities" element={<Navigate to="../facilities" replace />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>

        <Route path="/facilities/view" element={<Navigate to="/facilities" replace />} />
        <Route path="/facility-details" element={<FacilityDetails />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
