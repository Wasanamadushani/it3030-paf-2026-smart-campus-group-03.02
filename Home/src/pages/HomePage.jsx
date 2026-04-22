import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import QuickActions from "../components/QuickActions";
import FeaturesSection from "../components/FeaturesSection";
import DashboardPreview from "../components/DashboardPreview";
import NotificationsPanel from "../components/NotificationsPanel";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";

const AUTH_KEY = "sch.currentUser";

function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function HomePage() {
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    function onAuthChange() { setUser(getStoredUser()); }

    window.addEventListener("sch:authchange", onAuthChange);
    window.addEventListener("storage", onAuthChange);
    return () => {
      window.removeEventListener("sch:authchange", onAuthChange);
      window.removeEventListener("storage", onAuthChange);
    };
  }, []);

  const role = user?.role === "ADMIN" ? "ADMIN" : "USER";

  return (
    <div className="app-shell">
      <Navbar role={role} />
      <main className="main-content">
        <HeroSection />
        <QuickActions role={role} />
        <FeaturesSection />
        <DashboardPreview />
        <NotificationsPanel />
      </main>
      <Footer />
    </div>
  );
}
