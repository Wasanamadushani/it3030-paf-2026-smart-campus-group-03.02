// Member 2 – Admin QR Verify Page
// Reached by scanning a booking QR code: /admin/verify?id=X
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getBookingById } from "../../data/bookingStore";
import "../../styles/booking/adminVerify.css";

function pad(n) { return String(n).padStart(2, "0"); }

function formatDT(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isCurrentlyActive(startTime, endTime) {
  const now  = Date.now();
  const start = new Date(startTime).getTime();
  const end   = new Date(endTime).getTime();
  return now >= start && now <= end;
}

export default function AdminVerifyBooking() {
  const [params] = useSearchParams();
  const bookingId = params.get("id");

  const [booking,   setBooking]   = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState("");
  const [manualId,  setManualId]  = useState("");

  useEffect(() => {
    if (!bookingId) { setIsLoading(false); return; }
    lookup(bookingId);
  }, [bookingId]);

  async function lookup(id) {
    setIsLoading(true);
    setError("");
    setBooking(null);
    try {
      const data = await getBookingById(Number(id));
      setBooking(data);
    } catch (err) {
      setError(err.message || "Booking not found.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleManualLookup(e) {
    e.preventDefault();
    if (manualId.trim()) lookup(manualId.trim());
  }

  const active = booking ? isCurrentlyActive(booking.startTime, booking.endTime) : false;
  const isApproved = booking?.status === "APPROVED";

  let verdict = null;
  if (booking) {
    if (!isApproved) {
      verdict = { ok: false, msg: `Booking is ${booking.status} — entry not permitted.` };
    } else if (!active) {
      verdict = { ok: false, msg: "Booking is approved but outside the scheduled time window." };
    } else {
      verdict = { ok: true,  msg: "✓ Valid — entry permitted." };
    }
  }

  return (
    <div className="av-page">
      <div className="av-card">
        <div className="av-header">
          <Link to="/admin/bookings" className="av-back">← Back to Bookings</Link>
          <h1 className="av-title">QR Check-in Verify</h1>
          <p className="av-sub">Scan a booking QR code or enter a booking ID manually</p>
        </div>

        {/* Manual lookup */}
        <form className="av-form" onSubmit={handleManualLookup}>
          <input
            className="av-input"
            type="number"
            min="1"
            placeholder="Enter Booking ID…"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
          />
          <button className="av-btn" type="submit">Verify</button>
        </form>

        {isLoading && <p className="av-loading">Looking up booking…</p>}
        {error     && <p className="av-error">{error}</p>}

        {booking && verdict && (
          <div className={`av-result ${verdict.ok ? "av-result--ok" : "av-result--fail"}`}>
            <p className="av-verdict">{verdict.msg}</p>

            <div className="av-details">
              <div className="av-row"><span>Booking ID</span><strong>#{booking.id}</strong></div>
              <div className="av-row"><span>Name</span><strong>{booking.userName}</strong></div>
              <div className="av-row"><span>Email</span><strong>{booking.userEmail}</strong></div>
              <div className="av-row"><span>Facility</span><strong>{booking.facilityName}</strong></div>
              <div className="av-row"><span>From</span><strong>{formatDT(booking.startTime)}</strong></div>
              <div className="av-row"><span>To</span><strong>{formatDT(booking.endTime)}</strong></div>
              <div className="av-row"><span>Purpose</span><strong>{booking.purpose}</strong></div>
              <div className="av-row"><span>Attendees</span><strong>{booking.expectedAttendees}</strong></div>
              <div className="av-row">
                <span>Status</span>
                <strong className={`av-status av-status--${booking.status.toLowerCase()}`}>
                  {booking.status}
                </strong>
              </div>
              <div className="av-row">
                <span>Time window</span>
                <strong className={active ? "av-active" : "av-inactive"}>
                  {active ? "Currently active" : "Not in window"}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
