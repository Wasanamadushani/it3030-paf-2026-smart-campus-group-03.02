import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CalendarView from "../components/CalendarView";
import { useNavigate } from "react-router-dom";
import "../styles/facilities.css";

const FACILITY_SNAPSHOT = [
  {
    name: "Lecture Hall A1",
    type: "Room",
    status: "ACTIVE",
  },
  {
    name: "Lecture Hall B2",
    type: "Room",
    status: "ACTIVE",
  },
  {
    name: "Networking Lab",
    type: "Lab",
    status: "ACTIVE",
  },
  {
    name: "Software Lab",
    type: "Lab",
    status: "OUT_OF_SERVICE",
  },
  {
    name: "Projector Kit",
    type: "Equipment",
    status: "ACTIVE",
  },
  {
    name: "Portable PA System",
    type: "Equipment",
    status: "OUT_OF_SERVICE",
  },
];

export default function FacilitiesPage() {
  const [userRole, setUserRole] = useState(() => {
    const storedRole = localStorage.getItem("sch.mockRole");
    return storedRole === "ADMIN" ? "ADMIN" : "USER";
  });
  const isAdmin = userRole === "ADMIN";
  // TODO: Remove temporary role switch after real authentication integration
  const role = userRole;
  const navigate = useNavigate();
  const totalFacilities = FACILITY_SNAPSHOT.length;
  const activeFacilities = FACILITY_SNAPSHOT.filter((facility) => facility.status === "ACTIVE").length;
  const outOfServiceFacilities = totalFacilities - activeFacilities;

  const facilitiesByType = ["Room", "Lab", "Equipment"].map((type) => {
    const count = FACILITY_SNAPSHOT.filter((facility) => facility.type === type).length;
    return { type, count };
  });

  const maxTypeCount = Math.max(...facilitiesByType.map((item) => item.count), 1);
  const activePercentage = Math.round((activeFacilities / totalFacilities) * 100);
  const outOfServicePercentage = 100 - activePercentage;

  useEffect(() => {
    localStorage.setItem("sch.mockRole", userRole);
  }, [userRole]);

  return (
    <div className="app-shell facilities-page-shell">
      <Navbar role={role} />

      <main className="facilities-page">
        <div className="facilities-container">
          <header className="facilities-header">
            <h1>Facilities Dashboard</h1>
            <p>
              Get a quick overview of facilities status, usage distribution, and access the complete
              facilities list from one place.
            </p>

            <div className="fac-role-switch" aria-label="Temporary role switcher">
              <p>
                Current Role: <strong>{userRole}</strong>
              </p>

              <div className="fac-role-switch-actions">
                <button
                  type="button"
                  className="facility-btn facility-btn-secondary"
                  onClick={() => setUserRole("ADMIN")}
                  disabled={userRole === "ADMIN"}
                >
                  Switch to Admin
                </button>
                <button
                  type="button"
                  className="facility-btn facility-btn-secondary"
                  onClick={() => setUserRole("USER")}
                  disabled={userRole === "USER"}
                >
                  Switch to User
                </button>
              </div>
            </div>
          </header>

          <section className="fac-stats-grid" aria-label="Facility summary statistics">
            <article className="fac-stat-card">
              <p>Total Facilities</p>
              <strong>{totalFacilities}</strong>
            </article>
            <article className="fac-stat-card">
              <p>Active Facilities</p>
              <strong>{activeFacilities}</strong>
            </article>
            <article className="fac-stat-card">
              <p>Out of Service</p>
              <strong>{outOfServiceFacilities}</strong>
            </article>
          </section>

          <section className="fac-action-wrap" aria-label="Primary facilities action">
            <article className="fac-action-card">
              <div className="fac-action-content">
                <h2>Explore All Facilities</h2>
                <p>Browse all available campus facilities or open the admin management view.</p>
              </div>

              <div className="fac-action-buttons">
                <button
                  type="button"
                  className="facility-btn facility-btn-primary"
                  onClick={() => navigate("/view-facilities")}
                >
                  Explore All
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    className="facility-btn facility-btn-secondary"
                    onClick={() => navigate("/manage-facilities")}
                  >
                    Manage Facilities
                  </button>
                )}
              </div>
            </article>
          </section>

          <section className="fac-main-grid" aria-label="Facilities visual overview and availability">
            <div className="fac-main-left">
              <article className="fac-visual-card">
                <h2>Facilities by Type</h2>
                <div className="fac-type-list">
                  {facilitiesByType.map((item) => (
                    <div key={item.type} className="fac-type-row">
                      <div className="fac-type-head">
                        <span>{item.type}</span>
                        <strong>{item.count}</strong>
                      </div>
                      <div className="fac-type-track">
                        <div
                          className="fac-type-fill"
                          style={{ width: `${(item.count / maxTypeCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="fac-visual-card">
                <h2>Status Distribution</h2>
                <div className="fac-status-track" aria-label="Status distribution bar">
                  <div className="fac-status-active" style={{ width: `${activePercentage}%` }} />
                  <div
                    className="fac-status-out"
                    style={{ width: `${outOfServicePercentage}%` }}
                  />
                </div>

                <div className="fac-status-legend">
                  <div>
                    <span className="fac-legend-dot fac-legend-active" />
                    <p>ACTIVE ({activePercentage}%)</p>
                  </div>
                  <div>
                    <span className="fac-legend-dot fac-legend-out" />
                    <p>OUT_OF_SERVICE ({outOfServicePercentage}%)</p>
                  </div>
                </div>
              </article>
            </div>

            <div className="fac-main-right">
              <CalendarView title="Availability Calendar" />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
