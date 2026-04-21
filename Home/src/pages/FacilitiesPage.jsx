import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CalendarView from "../components/CalendarView";
import { useNavigate } from "react-router-dom";
import { getFacilitiesSummary } from "../data/facilitiesStore";
import "../styles/facilities.css";

export default function FacilitiesPage() {
  const role = "USER";
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    totalFacilities: 0,
    activeFacilities: 0,
    outOfServiceFacilities: 0,
    facilitiesByType: {},
  });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        const nextSummary = await getFacilitiesSummary();
        if (isMounted) {
          setSummary({
            totalFacilities: Number(nextSummary.totalFacilities || 0),
            activeFacilities: Number(nextSummary.activeFacilities || 0),
            outOfServiceFacilities: Number(nextSummary.outOfServiceFacilities || 0),
            facilitiesByType: nextSummary.facilitiesByType || {},
          });
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setSummary({
            totalFacilities: 0,
            activeFacilities: 0,
            outOfServiceFacilities: 0,
            facilitiesByType: {},
          });
          setErrorMessage(error.message || "Failed to load facilities summary");
        }
      }
    };

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalFacilities = summary.totalFacilities;
  const activeFacilities = summary.activeFacilities;
  const outOfServiceFacilities = summary.outOfServiceFacilities;

  const facilitiesByType = useMemo(() => {
    const counts = summary.facilitiesByType || {};
    return ["Room", "Lab", "Lecture Hall", "Equipment"].map((type) => ({
      type,
      count: Number(counts[type] || 0),
    }));
  }, [summary.facilitiesByType]);

  const maxTypeCount = Math.max(...facilitiesByType.map((item) => item.count), 1);
  const activePercentage = totalFacilities > 0
    ? Math.round((activeFacilities / totalFacilities) * 100)
    : 0;
  const outOfServicePercentage = totalFacilities > 0
    ? Math.max(0, 100 - activePercentage)
    : 0;

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
            {errorMessage && <p>{errorMessage}</p>}
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
                <p>Browse all available campus facilities.</p>
              </div>

              <div className="fac-action-buttons">
                <button
                  type="button"
                  className="facility-btn facility-btn-primary"
                  onClick={() => navigate("/view-facilities")}
                >
                  Explore All
                </button>
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
