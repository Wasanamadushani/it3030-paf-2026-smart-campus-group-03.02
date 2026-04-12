import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FacilitiesPage from "./pages/FacilitiesPage";
import ViewFacilities from "./pages/ViewFacilities";
import FacilityDetails from "./pages/FacilityDetails";
import "./styles/home.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/view-facilities" element={<ViewFacilities />} />
        <Route path="/facilities/view" element={<Navigate to="/view-facilities" replace />} />
        <Route path="/facility-details" element={<FacilityDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
