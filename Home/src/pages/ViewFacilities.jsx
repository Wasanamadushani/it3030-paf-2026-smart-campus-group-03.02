import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/viewFacilities.css";
import { getFacilities, subscribeFacilities } from "../data/facilitiesStore";

const FACILITY_TYPE_OPTIONS = ["Room", "Lab", "Lecture Hall", "Equipment"];

function getStatusClass(status) {
  return status === "ACTIVE" ? "vf-status vf-status-active" : "vf-status vf-status-off";
}

export default function ViewFacilities() {
  const role = "USER";
  const navigate = useNavigate();
  const location = useLocation();
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    let isMounted = true;

    const loadFacilities = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const nextFacilities = await getFacilities();
        if (isMounted) {
          setFacilities(nextFacilities);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Failed to load facilities");
          setFacilities([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadFacilities();

    const unsubscribe = subscribeFacilities((nextFacilities) => {
      if (!isMounted) {
        return;
      }

      setFacilities(nextFacilities);
      setErrorMessage("");
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const routeType = location.state?.type;

    if (FACILITY_TYPE_OPTIONS.includes(routeType)) {
      setSelectedType(routeType);
      return;
    }

    setSelectedType("ALL");
  }, [location.state]);

  function handleViewDetails(facility) {
    if (facility?.id) {
      navigate(`/facility-details/${facility.id}`, { state: facility });
      return;
    }

    navigate("/facility-details", { state: facility });
  }

  // function handleExploreAllFacilities() {
  //   alert("clicked");
  //   navigate("/facilities");
  // }
  async function handleExploreAllFacilities() {
    setSearchTerm("");
    setSelectedType("ALL");
    setSelectedStatus("ALL");
    navigate("/facilities");

    try {
      setFacilities(await getFacilities());
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "Failed to load facilities");
      setFacilities([]);
    }
  }

  const filteredFacilities = facilities.filter((facility) => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const matchesSearch =
      normalizedSearchTerm.length === 0 ||
      facility.name.toLowerCase().includes(normalizedSearchTerm) ||
      String(facility.location ?? "").toLowerCase().includes(normalizedSearchTerm);

    const matchesType = selectedType === "ALL" || facility.type === selectedType;
    const matchesStatus = selectedStatus === "ALL" || facility.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

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
            <button
              type="button"
              className="vf-explore-all-btn"
              onClick={handleExploreAllFacilities}
            >
              Explore All
            </button>
          </header>

          <section className="vf-filters" aria-label="Search and filter facilities">
            <input
              type="text"
              className="vf-search-input"
              placeholder="Search by facility name or location"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <select
              className="vf-filter-select"
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              aria-label="Filter by type"
            >
              <option value="ALL">All Types</option>
              {FACILITY_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              className="vf-filter-select"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
            </select>
          </section>

          <section className="vf-grid" aria-label="Available facility list">
            {isLoading && <p className="vf-no-results">Loading facilities...</p>}

            {!isLoading && errorMessage && <p className="vf-no-results">{errorMessage}</p>}

            {filteredFacilities.map((facility) => (
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

            {!isLoading && !errorMessage && filteredFacilities.length === 0 && (
              <p className="vf-no-results">No facilities found</p>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
