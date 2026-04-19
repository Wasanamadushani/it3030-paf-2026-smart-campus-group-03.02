import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FacilitiesPage from "./pages/FacilitiesPage";
import ViewFacilities from "./pages/ViewFacilities";
import FacilityDetails from "./pages/FacilityDetails";
import BookingPage from "./pages/BookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import AdminSidebarLayout from "./components/AdminSidebarLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageFacilities from "./pages/Admin/ManageFacilities";
import AdminTickets from "./pages/Admin/AdminTickets";
import AdminNotifications from "./pages/Admin/AdminNotifications";
import "./styles/home.css";

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("sch.currentUser")); } catch { return null; }
}

function BookingsRedirect() {
  const user = getStoredUser();
  if (user?.role === "ADMIN") return <Navigate to="/admin/bookings" replace />;
  return <Navigate to="/bookings/my" replace />;
}

function AdminGuard({ children }) {
  const user = getStoredUser();
  if (!user || user.role !== "ADMIN") return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/facilities/view" element={<ViewFacilities />} />
        <Route path="/facility-details" element={<FacilityDetails />} />
        <Route path="/bookings" element={<BookingsRedirect />} />
        <Route path="/bookings/new" element={<BookingPage />} />
        <Route path="/bookings/my" element={<MyBookingsPage />} />

        {/* Admin routes — protected, with sidebar layout */}
        <Route path="/admin" element={<AdminGuard><AdminSidebarLayout /></AdminGuard>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="facilities" element={<ManageFacilities />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
