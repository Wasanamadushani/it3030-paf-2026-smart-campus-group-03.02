// Member 2 – Admin Bookings Management Page
import { useEffect, useState } from "react";
import { deleteBooking, getAllBookings, processBooking } from "../../data/bookingStore";
import "../../styles/booking/adminBookings.css";

const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

const STATUS_CLS = {
  PENDING: "abk-status--pending",
  APPROVED: "abk-status--approved",
  REJECTED: "abk-status--rejected",
  CANCELLED: "abk-status--cancelled",
};

function formatDT(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionState, setActionState] = useState({ id: null, type: null });
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTargetId, setRejectTargetId] = useState(null);

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  async function loadBookings() {
    setIsLoading(true);
    setError("");
    try {
      const data = await getAllBookings(statusFilter === "ALL" ? "" : statusFilter);
      setBookings(data);
    } catch (err) {
      setError(err.message || "Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(id) {
    setActionState({ id, type: "approve" });
    try {
      const updated = await processBooking(id, "APPROVED");
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      alert(err.message || "Failed to approve.");
    } finally {
      setActionState({ id: null, type: null });
    }
  }

  function openRejectModal(id) {
    setRejectTargetId(id);
    setRejectReason("");
  }

  async function handleReject() {
    if (!rejectReason.trim()) { alert("Please provide a reason."); return; }
    setActionState({ id: rejectTargetId, type: "reject" });
    try {
      const updated = await processBooking(rejectTargetId, "REJECTED", rejectReason.trim());
      setBookings((prev) => prev.map((b) => (b.id === rejectTargetId ? updated : b)));
      setRejectTargetId(null);
    } catch (err) {
      alert(err.message || "Failed to reject.");
    } finally {
      setActionState({ id: null, type: null });
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Permanently delete this booking?")) return;
    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete.");
    }
  }

  return (
    <div className="admin-bookings">
      <div className="abk-header">
        <h2>Booking Management</h2>
        <div className="abk-filters">
          <label htmlFor="abk-status-filter">Filter by status:</label>
          <select
            id="abk-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="abk-refresh" onClick={loadBookings}>Refresh</button>
        </div>
      </div>

      {error && <p className="abk-error">{error}</p>}
      {isLoading && <p className="abk-loading">Loading…</p>}

      {!isLoading && bookings.length === 0 && (
        <p className="abk-empty">No bookings found.</p>
      )}

      {!isLoading && bookings.length > 0 && (
        <div className="abk-table-wrap">
          <table className="abk-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Facility</th>
                <th>Start</th>
                <th>End</th>
                <th>Attendees</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>
                    <span className="abk-user-name">{b.userName}</span>
                    <br />
                    <span className="abk-user-email">{b.userEmail}</span>
                  </td>
                  <td>{b.facilityName}</td>
                  <td>{formatDT(b.startTime)}</td>
                  <td>{formatDT(b.endTime)}</td>
                  <td>{b.expectedAttendees}</td>
                  <td className="abk-purpose">{b.purpose}</td>
                  <td>
                    <span className={`abk-status ${STATUS_CLS[b.status] || ""}`}>
                      {b.status}
                    </span>
                    {b.adminReason && (
                      <p className="abk-reason">{b.adminReason}</p>
                    )}
                  </td>
                  <td className="abk-actions">
                    {b.status === "PENDING" && (
                      <>
                        <button
                          className="abk-btn abk-btn--approve"
                          onClick={() => handleApprove(b.id)}
                          disabled={actionState.id === b.id}
                        >
                          {actionState.id === b.id && actionState.type === "approve"
                            ? "…" : "Approve"}
                        </button>
                        <button
                          className="abk-btn abk-btn--reject"
                          onClick={() => openRejectModal(b.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      className="abk-btn abk-btn--delete"
                      onClick={() => handleDelete(b.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject modal */}
      {rejectTargetId !== null && (
        <div className="abk-modal-overlay" role="dialog" aria-modal="true">
          <div className="abk-modal">
            <h3>Reject Booking #{rejectTargetId}</h3>
            <label htmlFor="abk-reject-reason">Reason (required)</label>
            <textarea
              id="abk-reject-reason"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this booking is rejected…"
            />
            <div className="abk-modal-actions">
              <button
                className="abk-btn abk-btn--reject"
                onClick={handleReject}
                disabled={actionState.id === rejectTargetId}
              >
                {actionState.id === rejectTargetId ? "Rejecting…" : "Confirm Reject"}
              </button>
              <button className="abk-btn" onClick={() => setRejectTargetId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
