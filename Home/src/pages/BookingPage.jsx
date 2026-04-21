import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function BookingPage() {
  const role = "ADMIN";

  return (
    <div className="app-shell" style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <Navbar role={role} />

      <main
        style={{
          minHeight: "calc(100vh - 180px)",
          display: "grid",
          placeItems: "center",
          padding: "1.2rem",
        }}
      >
        <section
          style={{
            width: "min(720px, 100%)",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
            padding: "1.8rem 1.2rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ margin: 0, color: "#0f172a", fontSize: "clamp(1.8rem, 3.2vw, 2.2rem)" }}>
            Booking Page
          </h1>
          <p style={{ marginTop: "0.7rem", color: "#475569", lineHeight: 1.6 }}>
            Booking feature will be implemented soon
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
