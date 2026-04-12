import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/viewFacilities.css";

const STATIC_FACILITIES_DATA = [
  {
    name: "Lecture Hall A1",
    type: "Room",
    location: "Faculty of Computing - Block A",
    capacity: 220,
    status: "ACTIVE",
  },
  {
    name: "Advanced Networking Lab",
    type: "Lab",
    location: "Engineering Complex - Level 3",
    capacity: 40,
    status: "ACTIVE",
  },
  {
    name: "Meeting Room Orion",
    type: "Room",
    location: "Admin Building - Level 2",
    capacity: 18,
    status: "OUT_OF_SERVICE",
  },
  {
    name: "Portable PA System",
    type: "Equipment",
    location: "Equipment Store - Sports Wing",
    capacity: 1,
    status: "ACTIVE",
  },
  {
    name: "Software Engineering Lab",
    type: "Lab",
    location: "Faculty of Computing - Block C",
    capacity: 55,
    status: "ACTIVE",
  },
  {
    name: "Seminar Room S2",
    type: "Room",
    location: "Business School - Level 1",
    capacity: 65,
    status: "OUT_OF_SERVICE",
  },
  {
    name: "Projector Kit PX-400",
    type: "Equipment",
    location: "Library Resource Counter",
    capacity: 1,
    status: "ACTIVE",
  },
  {
    name: "Innovation Lab",
    type: "Lab",
    location: "Research Center - Ground Floor",
    capacity: 32,
    status: "ACTIVE",
  },
];

function getStatusClass(status) {
  return status === "ACTIVE" ? "vf-status vf-status-active" : "vf-status vf-status-off";
}

export default function ViewFacilities() {
  const role = "ADMIN";
  const navigate = useNavigate();
  // TODO: Replace static data with API call from backend
  const [facilities, setFacilities] = useState(STATIC_FACILITIES_DATA);

  useEffect(() => {
    // TODO: Fetch facilities from backend API
    setFacilities(STATIC_FACILITIES_DATA);
  }, []);

  function handleViewDetails(facility) {
    navigate("/facility-details", { state: facility });
  }

  return (
    <div className="app-shell vf-page-shell">
      <Navbar role={role} />

      <main className="vf-page">
        <div className="vf-container">
          <header className="vf-header">
            <h1>Available Facilities</h1>
            <p>
              Explore campus facilities and resources currently listed in the catalogue.
            </p>
            <Link to="/facilities" className="vf-back-link">
              Back to Facilities Catalogue
            </Link>
          </header>

          <section className="vf-grid" aria-label="Available facility list">
            {facilities.map((facility) => (
              <article key={`${facility.name}-${facility.location}`} className="vf-card">
                <div className="vf-card-top">
                  <h2>{facility.name}</h2>
                  <span className={getStatusClass(facility.status)}>{facility.status}</span>
                </div>

                <div className="vf-meta">
                  <p>
                    <span>Type</span>
                    <strong>{facility.type}</strong>
                  </p>
                  <p>
                    <span>Location</span>
                    <strong>{facility.location}</strong>
                  </p>
                  <p>
                    <span>Capacity</span>
                    <strong>{facility.capacity}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  className="vf-view-details-btn"
                  onClick={() => handleViewDetails(facility)}
                >
                  View Details
                </button>
              </article>
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
