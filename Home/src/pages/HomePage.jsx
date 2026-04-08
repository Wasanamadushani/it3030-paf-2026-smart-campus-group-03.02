import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import QuickActions from "../components/QuickActions";
import FeaturesSection from "../components/FeaturesSection";
import DashboardPreview from "../components/DashboardPreview";
import NotificationsPanel from "../components/NotificationsPanel";
import Footer from "../components/Footer";

export default function HomePage() {
  const role = "ADMIN";

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
