import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/booking.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

const STATUS_COLORS = {
  PENDING: "bk-badge-pending",
  APPROVED: "bk-badge-approved",
  REJECTED: "bk-badge-rejected",
  CANCELLED: "bk-badge-cancelled",
};

const STATUS_ICONS = {
  PENDING: "⏳",
  APPROVED: "✅",
  REJECTED: "❌",
  CANCELLED: "🚫",
};

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("sch.currentUser")); } catch { return null; }
}

export default function MyBookingsPage() {
  const [storedUser] = useState(getStoredUser);
  const { state: navState } = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  async function fetchBookings() {
    if (!storedUser?.email) { setLoading(false); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ userEmail: storedUser.email });
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(`${API}/api/bookings?${params}`);
      if (!res.ok) throw new Error();
      setBookings(await res.json());
      setError("");
    } catch {
      setError("Failed to load bookings. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBookings(); }, [filterStatus]);

  async function handleCancel(id) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(id);
    try {
      const res = await fetch(
        `${API}/api/bookings/${id}/cancel?userEmail=${encodeURIComponent(storedUser.email)}`,
        { method: "PATCH" }
      );
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      fetchBookings();
    } catch {
      alert("Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  }

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="app-shell bk-shell">
      <Navbar />
      <main className="bk-page">
        <div className="bk-container">

          {/* Header */}
          <div className="bk-page-header">
            <div>
              <h1>My Bookings</h1>
              <p>Track and manage all your facility booking requests.</p>
            </div>
            <Link to="/facilities/view" className="bk-btn-primary bk-new-btn">
              + Book a Resource
            </Link>
          </div>

          {/* Success toast from redirect */}
          {navState?.successMsg && (
            <p className="bk-success" style={{ marginBottom: "1rem" }}>{navState.successMsg}</p>
          )}

          {/* Not logged in */}
          {!storedUser && (
            <div className="bk-login-prompt">
              <p>Please log in to view and manage your bookings.</p>
              <Link to="/" className="bk-btn-primary">Go to Home</Link>
            </div>
          )}

          {storedUser && (
            <>
              {/* Summary stats */}
              {!loading && bookings.length > 0 && (
                <div className="bk-stats">
                  {["PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((s) => (
                    <button
                      key={s}
                      className={`bk-stat-card ${filterStatus === s ? "bk-stat-active" : ""}`}
                      onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
                    >
                      <span className={`bk-badge ${STATUS_COLORS[s]}`}>{s}</span>
                      <strong>{counts[s] || 0}</strong>
                    </button>
                  ))}
                </div>
              )}

              {/* Filter bar */}
              <div className="bk-filter-bar">
                <label htmlFor="statusFilter">Filter:</label>
                <select id="statusFilter" value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All bookings</option>
                  <option>PENDING</option>
                  <option>APPROVED</option>
                  <option>REJECTED</option>
                  <option>CANCELLED</option>
                </select>
                {filterStatus && (
                  <button className="bk-clear-filter" onClick={() => setFilterStatus("")}>
                    Clear filter ✕
                  </button>
                )}
              </div>

              {loading && <p className="bk-loading">Loading your bookings...</p>}
              {error && <p className="bk-error">{error}</p>}

              {/* Empty state */}
              {!loading && !error && bookings.length === 0 && (
                <div className="bk-empty-state">
                  <div className="bk-empty-icon">📋</div>
                  <h3>{filterStatus ? `No ${filterStatus} bookings` : "No bookings yet"}</h3>
                  <p>
                    {filterStatus
                      ? "Try clearing the filter to see all bookings."
                      : "Browse available facilities and make your first booking."}
                  </p>
                  <Link to="/facilities/view" className="bk-btn-primary">
                    Browse Facilities
                  </Link>
                </div>
              )}

              {/* Booking cards */}
              <div className="bk-list">
                {bookings.map((b) => (
                  <article key={b.id} className={`bk-card bk-card-${b.status.toLowerCase()}`}>
                    <div className="bk-card-top">
                      <div className="bk-card-title-wrap">
                        <span className="bk-status-icon">{STATUS_ICONS[b.status]}</span>
                        <div>
                          <h2>{b.resourceName}</h2>
                          <p className="bk-card-sub">{b.location} · {b.resourceType}</p>
                        </div>
                      </div>
                      <span className={`bk-badge ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                    </div>

                    <div className="bk-card-meta">
                      <span>📅 {b.date}</span>
                      <span>🕐 {b.startTime} – {b.endTime}</span>
                      <span>👥 {b.attendees} {b.attendees === 1 ? "attendee" : "attendees"}</span>
                    </div>

                    <p className="bk-card-purpose">
                      <strong>Purpose:</strong> {b.purpose}
                    </p>

                    {b.adminNote && (
                      <div className="bk-admin-note">
                        <strong>Admin note:</strong> {b.adminNote}
                      </div>
                    )}

                    <div className="bk-card-actions">
                      <span className="bk-id">Booking ID: {b.id}</span>
                      {(b.status === "PENDING" || b.status === "APPROVED") && (
                        <button
                          className="bk-btn-cancel"
                          onClick={() => handleCancel(b.id)}
                          disabled={cancellingId === b.id}
                        >
                          {cancellingId === b.id ? "Cancelling..." : "Cancel Booking"}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
