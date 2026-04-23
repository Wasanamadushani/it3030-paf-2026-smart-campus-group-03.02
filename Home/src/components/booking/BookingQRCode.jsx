// Member 2 – QR Code modal for approved bookings
import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "../../styles/booking/bookingQR.css";

function pad(n) { return String(n).padStart(2, "0"); }

function formatDT(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BookingQRCode({ booking, onClose }) {
  const canvasRef = useRef();

  const verifyUrl = `${window.location.origin}/admin/verify?id=${booking.id}`;

  function handleDownload() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-pass-${booking.id}.png`;
    a.click();
  }

  return (
    <div className="qr-overlay" role="dialog" aria-modal="true" aria-label="Booking QR Code">
      <div className="qr-modal">
        <button className="qr-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="qr-content">
          <h2 className="qr-title">Booking Pass</h2>
          <p className="qr-subtitle">Show this QR code at the facility entrance</p>

          <div className="qr-code-wrap" ref={canvasRef}>
            <QRCodeCanvas
              value={verifyUrl}
              size={200}
              level="H"
              includeMargin
            />
          </div>

          <div className="qr-details">
            <div className="qr-detail-row">
              <span className="qr-label">Booking ID</span>
              <span className="qr-value">#{booking.id}</span>
            </div>
            <div className="qr-detail-row">
              <span className="qr-label">Facility</span>
              <span className="qr-value">{booking.facilityName}</span>
            </div>
            <div className="qr-detail-row">
              <span className="qr-label">From</span>
              <span className="qr-value">{formatDT(booking.startTime)}</span>
            </div>
            <div className="qr-detail-row">
              <span className="qr-label">To</span>
              <span className="qr-value">{formatDT(booking.endTime)}</span>
            </div>
            <div className="qr-detail-row">
              <span className="qr-label">Name</span>
              <span className="qr-value">{booking.userName}</span>
            </div>
            <div className="qr-detail-row">
              <span className="qr-label">Purpose</span>
              <span className="qr-value">{booking.purpose}</span>
            </div>
          </div>

          <p className="qr-id-text">ID: {booking.id}</p>
        </div>

        <div className="qr-actions">
          <button className="qr-btn qr-btn--print" onClick={handleDownload}>
            ⬇ Download QR
          </button>
          <button className="qr-btn qr-btn--close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
