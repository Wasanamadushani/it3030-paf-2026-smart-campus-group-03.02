import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/facilityDetails.css";

function getStatusClass(status) {
  return status === "ACTIVE"
    ? "fd-status fd-status-active"
    : "fd-status fd-status-out-of-service";
}

export default function FacilityDetails() {
  const role = "USER";
  const navigate = useNavigate();
  const { state: facility } = useLocation();

  // TODO: Replace with API data from backend

  return (
    <div className="app-shell fd-page-shell">
      <Navbar role={role} />

      <main className="fd-page">
        <div className="fd-container">
          <header className="fd-header">
            <h1>Facility Details</h1>
            <p>Detailed view of the selected facility resource.</p>
          </header>

          {facility ? (
            <section className="fd-card" aria-label="Selected facility details">
              <div className="fd-card-top">
                <h2>{facility.name}</h2>
                <span className={getStatusClass(facility.status)}>{facility.status}</span>
              </div>

              <div className="fd-meta-grid">
                <article className="fd-meta-item">
                  <span>Type</span>
                  <strong>{facility.type}</strong>
                </article>
                <article className="fd-meta-item">
                  <span>Location</span>
                  <strong>{facility.location}</strong>
                </article>
                <article className="fd-meta-item">
                  <span>Capacity</span>
                  <strong>{facility.capacity}</strong>
                </article>
              </div>

              {/* TODO: Booking functionality will be implemented by Booking module */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("/booking", { state: facility })}
              >
                Book Now
              </button>

              <button
                type="button"
                className="fd-back-btn"
                onClick={() => navigate("/facilities")}
              >
                Back to Facilities List
              </button>
            </section>
          ) : (
            <section className="fd-card" aria-label="No facility selected">
              <p className="fd-empty-message">
                No facility was selected. Please return to the facilities list and choose a
                facility.
              </p>
              <button
                type="button"
                className="fd-back-btn"
                onClick={() => navigate("/facilities")}
              >
                Back to Facilities List
              </button>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
