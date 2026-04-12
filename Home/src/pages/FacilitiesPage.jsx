import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/facilities.css";

const facilityCategories = [
  {
    title: "Lecture Halls",
    description:
      "Spacious lecture halls suitable for classes, seminars, and academic presentations.",
  },
  {
    title: "Labs",
    description:
      "Well-equipped computing and science labs for practical sessions and research work.",
  },
  {
    title: "Meeting Rooms",
    description:
      "Professional meeting rooms for discussions, project reviews, and team collaboration.",
  },
  {
    title: "Equipment",
    description:
      "Shared campus equipment including projectors, sound systems, and support tools.",
  },
];

export default function FacilitiesPage() {
  const role = "ADMIN";

  return (
    <div className="app-shell facilities-page-shell">
      <Navbar role={role} />

      <main className="facilities-page">
        <div className="facilities-container">
          <header className="facilities-header">
            <h1>Facilities &amp; Assets Catalogue</h1>
            <p>
              Browse and manage available campus facilities including lecture halls, labs, meeting
              rooms, and equipment.
            </p>
          </header>

          <section className="facilities-grid" aria-label="Facility categories">
            {facilityCategories.map((category) => (
              <article key={category.title} className="facility-card">
                <div className="facility-card-top">
                  <h2>{category.title}</h2>
                  <span className="facility-status">ACTIVE</span>
                </div>
                <p className="facility-description">{category.description}</p>
                <button type="button" className="facility-btn">
                  View Details
                </button>
              </article>
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
