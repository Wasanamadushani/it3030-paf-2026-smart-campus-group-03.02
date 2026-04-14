import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FacilitiesPage from "./pages/FacilitiesPage";
import ViewFacilities from "./pages/ViewFacilities";
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
        <Route path="/view-facilities" element={<ViewFacilities />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-facilities" element={<ManageFacilities />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/facilities/view" element={<Navigate to="/view-facilities" replace />} />
        <Route path="/facility-details" element={<FacilityDetails />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
