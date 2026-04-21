import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getFacilityById } from "../data/facilitiesStore";
import "../styles/facilityDetails.css";

function getStatusClass(status) {
  return status === "ACTIVE"
    ? "fd-status fd-status-active"
    : "fd-status fd-status-out-of-service";
}

export default function FacilityDetails() {
  const role = "USER";
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const { state } = useLocation();
  const [facility, setFacility] = useState(() => {
    if (state && typeof state === "object" && Number(state.id) > 0) {
      return state;
    }

    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const resolvedFacilityId = useMemo(() => {
    const numericRouteId = Number(routeId);
    if (Number.isFinite(numericRouteId) && numericRouteId > 0) {
      return numericRouteId;
    }

    const stateId = Number(state?.id ?? state?.facilityId);
    if (Number.isFinite(stateId) && stateId > 0) {
      return stateId;
    }

    return null;
  }, [routeId, state]);

  useEffect(() => {
    let isMounted = true;

    const loadFacility = async () => {
      if (!resolvedFacilityId) {
        setIsLoading(false);
        setFacility(null);
        setErrorMessage("No facility id was provided");
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const nextFacility = await getFacilityById(resolvedFacilityId);
        if (isMounted) {
          setFacility(nextFacility);
        }
      } catch (error) {
        if (isMounted) {
          setFacility(null);
          setErrorMessage(error.message || "Failed to load facility details");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadFacility();

    return () => {
      isMounted = false;
    };
  }, [resolvedFacilityId]);

  return (
    <div className="app-shell fd-page-shell">
      <Navbar role={role} />

      <main className="fd-page">
        <div className="fd-container">
          <header className="fd-header">
            <h1>Facility Details</h1>
            <p>Detailed view of the selected facility resource.</p>
          </header>

          {isLoading ? (
            <section className="fd-card" aria-label="Loading facility details">
              <p className="fd-empty-message">Loading facility details...</p>
            </section>
          ) : facility ? (
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
                onClick={() => navigate("/view-facilities")}
              >
                Back to Facilities List
              </button>
            </section>
          ) : (
            <section className="fd-card" aria-label="No facility selected">
              <p className="fd-empty-message">
                {errorMessage || "No facility was selected. Please return to the facilities list and choose a facility."}
              </p>
              <button
                type="button"
                className="fd-back-btn"
                onClick={() => navigate("/view-facilities")}
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
