import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/booking.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export default function BookingPage() {
  const navigate = useNavigate();
  const { state: prefill } = useLocation();

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("sch.currentUser")); } catch { return null; }
  })();

  const [form, setForm] = useState({
    resourceName: prefill?.name || "",
    resourceType: prefill?.type || "",
    location: prefill?.location || "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: 1,
    userEmail: storedUser?.email || "",
    userName: storedUser?.fullName || "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.userEmail || !form.userName) {
      setError("Please log in before making a booking.");
      return;
    }
    if (form.endTime <= form.startTime) {
      setError("End time must be after start time.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, attendees: Number(form.attendees) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Booking failed."); return; }
      navigate("/bookings/my", { state: { successMsg: `Booking submitted! ID: ${data.id} — awaiting admin approval.` } });
    } catch {
      setError("Unable to reach server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell bk-shell">
      <Navbar />
      <main className="bk-page">
        <div className="bk-container">
          <header className="bk-header">
            <h1>Book a Resource</h1>
            <p>Fill in the details below to request a booking. Bookings require admin approval.</p>
          </header>

          <form className="bk-form" onSubmit={handleSubmit} noValidate>
            <div className="bk-row">
              <label htmlFor="resourceName">Resource Name</label>
              <input id="resourceName" name="resourceName" value={form.resourceName}
                onChange={handleChange} placeholder="e.g. Lecture Hall A1" required />
            </div>

            <div className="bk-row-2col">
              <div className="bk-row">
                <label htmlFor="resourceType">Type</label>
                <select id="resourceType" name="resourceType" value={form.resourceType} onChange={handleChange} required>
                  <option value="">Select type</option>
                  <option>Room</option>
                  <option>Lab</option>
                  <option>Equipment</option>
                </select>
              </div>
              <div className="bk-row">
                <label htmlFor="location">Location</label>
                <input id="location" name="location" value={form.location}
                  onChange={handleChange} placeholder="e.g. Block A" required />
              </div>
            </div>

            <div className="bk-row-3col">
              <div className="bk-row">
                <label htmlFor="date">Date</label>
                <input id="date" name="date" type="date" value={form.date}
                  onChange={handleChange} min={new Date().toISOString().split("T")[0]} required />
              </div>
              <div className="bk-row">
                <label htmlFor="startTime">Start Time</label>
                <input id="startTime" name="startTime" type="time" value={form.startTime}
                  onChange={handleChange} required />
              </div>
              <div className="bk-row">
                <label htmlFor="endTime">End Time</label>
                <input id="endTime" name="endTime" type="time" value={form.endTime}
                  onChange={handleChange} required />
              </div>
            </div>

            <div className="bk-row">
              <label htmlFor="purpose">Purpose</label>
              <textarea id="purpose" name="purpose" value={form.purpose}
                onChange={handleChange} rows={3} maxLength={300}
                placeholder="Describe the purpose of this booking..." required />
            </div>

            <div className="bk-row">
              <label htmlFor="attendees">Expected Attendees</label>
              <input id="attendees" name="attendees" type="number" min={1}
                value={form.attendees} onChange={handleChange} required />
            </div>

            {error && <p className="bk-error" role="alert">{error}</p>}

            <div className="bk-actions">
              <button type="button" className="bk-btn-secondary"
                onClick={() => navigate("/facilities/view")}>Cancel</button>
              <button type="submit" className="bk-btn-primary" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Booking Request"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
