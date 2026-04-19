import { useEffect, useState } from "react";
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

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [noteMap, setNoteMap] = useState({});
  const [error, setError] = useState("");

  async function fetchBookings() {
    setLoading(true);
    try {
      const params = filterStatus ? `?status=${filterStatus}` : "";
      const res = await fetch(`${API}/api/bookings${params}`);
      setBookings(await res.json());
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBookings(); }, [filterStatus]);

  async function handleStatusUpdate(id, status) {
    try {
      const res = await fetch(`${API}/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: noteMap[id] || "" }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      fetchBookings();
    } catch {
      alert("Failed to update booking.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Permanently delete this booking record?")) return;
    try {
      await fetch(`${API}/api/bookings/${id}`, { method: "DELETE" });
      fetchBookings();
    } catch {
      alert("Failed to delete booking.");
    }
  }

  return (
    <div className="app-shell bk-shell">
      <Navbar />
      <main className="bk-page">
        <div className="bk-container">
          <header className="bk-header">
            <h1>Admin — Manage Bookings</h1>
            <p>Review, approve, reject, or delete booking requests.</p>
          </header>

          <div className="bk-filter-bar">
            <label htmlFor="adminStatusFilter">Filter by status:</label>
            <select id="adminStatusFilter" value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              <option>PENDING</option>
              <option>APPROVED</option>
              <option>REJECTED</option>
              <option>CANCELLED</option>
            </select>
          </div>

          {loading && <p className="bk-loading">Loading...</p>}
          {error && <p className="bk-error">{error}</p>}
          {!loading && bookings.length === 0 && <p className="bk-empty">No bookings found.</p>}

          <div className="bk-list">
            {bookings.map((b) => (
              <article key={b.id} className="bk-card">
                <div className="bk-card-top">
                  <div>
                    <h2>{b.resourceName}</h2>
                    <p className="bk-card-sub">{b.location} · {b.resourceType}</p>
                    <p className="bk-card-user">Requested by: {b.userName} ({b.userEmail})</p>
                  </div>
                  <span className={`bk-badge ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                </div>

                <div className="bk-card-meta">
                  <span>📅 {b.date}</span>
                  <span>🕐 {b.startTime} – {b.endTime}</span>
                  <span>👥 {b.attendees} attendees</span>
                </div>
                <p className="bk-card-purpose">{b.purpose}</p>
                {b.adminNote && <p className="bk-admin-note">Note: {b.adminNote}</p>}

                {b.status === "PENDING" && (
                  <div className="bk-admin-actions">
                    <input
                      type="text"
                      placeholder="Optional note (reason for rejection, etc.)"
                      value={noteMap[b.id] || ""}
                      onChange={(e) => setNoteMap((prev) => ({ ...prev, [b.id]: e.target.value }))}
                      className="bk-note-input"
                    />
                    <div className="bk-action-btns">
                      <button className="bk-btn-approve"
                        onClick={() => handleStatusUpdate(b.id, "APPROVED")}>Approve</button>
                      <button className="bk-btn-reject"
                        onClick={() => handleStatusUpdate(b.id, "REJECTED")}>Reject</button>
                    </div>
                  </div>
                )}

                <div className="bk-card-actions">
                  <span className="bk-id">ID: {b.id}</span>
                  <button className="bk-btn-delete" onClick={() => handleDelete(b.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
