import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/manageFacilities.css";

const INITIAL_FACILITIES = [
  {
    id: 1,
    name: "Lecture Hall A1",
    type: "Room",
    location: "Faculty of Computing - Block A",
    capacity: 220,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Advanced Networking Lab",
    type: "Lab",
    location: "Engineering Complex - Level 3",
    capacity: 40,
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Portable PA System",
    type: "Equipment",
    location: "Equipment Store - Sports Wing",
    capacity: 1,
    status: "OUT_OF_SERVICE",
  },
];

const EMPTY_FORM = {
  name: "",
  type: "Room",
  location: "",
  capacity: "",
  status: "ACTIVE",
};

function getStatusClass(status) {
  return status === "ACTIVE" ? "mf-status mf-status-active" : "mf-status mf-status-out";
}

export default function ManageFacilities() {
  const [userRole] = useState(() => {
    const storedRole = localStorage.getItem("sch.mockRole");
    return storedRole === "ADMIN" ? "ADMIN" : "USER";
  });
  const role = userRole;
  const isAdmin = userRole === "ADMIN";
  // TODO: Connect to backend and role-based authentication

  const [facilities, setFacilities] = useState(INITIAL_FACILITIES);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFacilityId, setEditingFacilityId] = useState(null);

  const isEditing = editingFacilityId !== null;

  const nextFacilityId = useMemo(() => {
    return facilities.reduce((maxId, facility) => Math.max(maxId, facility.id), 0) + 1;
  }, [facilities]);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleOpenAddForm() {
    setEditingFacilityId(null);
    setFormData(EMPTY_FORM);
    setIsFormOpen(true);
  }

  function handleOpenEditForm(facility) {
    setEditingFacilityId(facility.id);
    setFormData({
      name: facility.name,
      type: facility.type,
      location: facility.location,
      capacity: String(facility.capacity),
      status: facility.status,
    });
    setIsFormOpen(true);
  }

  function handleDeleteFacility(id) {
    setFacilities((prev) => prev.filter((facility) => facility.id !== id));

    if (editingFacilityId === id) {
      setEditingFacilityId(null);
      setFormData(EMPTY_FORM);
      setIsFormOpen(false);
    }
  }

  function handleCancelForm() {
    setEditingFacilityId(null);
    setFormData(EMPTY_FORM);
    setIsFormOpen(false);
  }

  function handleSubmitForm(event) {
    event.preventDefault();

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      location: formData.location.trim(),
      capacity: Number.parseInt(formData.capacity, 10) || 0,
      status: formData.status,
    };

    if (isEditing) {
      setFacilities((prev) =>
        prev.map((facility) => {
          if (facility.id !== editingFacilityId) {
            return facility;
          }

          return { ...facility, ...payload };
        })
      );
    } else {
      setFacilities((prev) => [...prev, { id: nextFacilityId, ...payload }]);
    }

    setEditingFacilityId(null);
    setFormData(EMPTY_FORM);
    setIsFormOpen(false);
  }

  if (!isAdmin) {
    return (
      <div className="app-shell mf-shell">
        <Navbar role={role} />
        <main className="mf-page">
          <section className="mf-denied-card">
            <h1>Manage Facilities</h1>
            <p>Admin access is required to manage facilities.</p>
            <Link to="/facilities" className="mf-back-link">
              Back to Facilities Dashboard
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-shell mf-shell">
      <Navbar role={role} />

      <main className="mf-page">
        <div className="mf-container">
          <header className="mf-header">
            <div>
              <h1>Manage Facilities</h1>
              <p>Add, edit, and remove facilities using this admin interface.</p>
            </div>

            <button type="button" className="mf-btn mf-btn-primary" onClick={handleOpenAddForm}>
              Add Facility
            </button>
          </header>

          {isFormOpen && (
            <section className="mf-form-card" aria-label="Facility form">
              <h2>{isEditing ? "Edit Facility" : "Add Facility"}</h2>

              <form className="mf-form-grid" onSubmit={handleSubmitForm}>
                <label>
                  Name
                  <input
                    required
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter facility name"
                  />
                </label>

                <label>
                  Type
                  <select name="type" value={formData.type} onChange={handleInputChange}>
                    <option value="Room">Room</option>
                    <option value="Lab">Lab</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </label>

                <label>
                  Location
                  <input
                    required
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter location"
                  />
                </label>

                <label>
                  Capacity
                  <input
                    required
                    min="0"
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="Enter capacity"
                  />
                </label>

                <label>
                  Status
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                  </select>
                </label>

                <div className="mf-form-actions">
                  <button type="submit" className="mf-btn mf-btn-primary">
                    {isEditing ? "Save Changes" : "Add Facility"}
                  </button>
                  <button type="button" className="mf-btn mf-btn-secondary" onClick={handleCancelForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="mf-table-card" aria-label="Managed facilities table">
            <div className="mf-table-wrap" role="region" aria-label="Facilities table">
              <table className="mf-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((facility) => (
                    <tr key={facility.id}>
                      <td>{facility.name}</td>
                      <td>{facility.type}</td>
                      <td>{facility.location}</td>
                      <td>{facility.capacity}</td>
                      <td>
                        <span className={getStatusClass(facility.status)}>{facility.status}</span>
                      </td>
                      <td>
                        <div className="mf-row-actions">
                          <button
                            type="button"
                            className="mf-btn mf-btn-secondary"
                            onClick={() => handleOpenEditForm(facility)}
                          >
                            Edit Facility
                          </button>
                          <button
                            type="button"
                            className="mf-btn mf-btn-danger"
                            onClick={() => handleDeleteFacility(facility.id)}
                          >
                            Delete Facility
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mf-mobile-grid">
              {facilities.map((facility) => (
                <article key={`mobile-${facility.id}`} className="mf-mobile-card">
                  <div className="mf-mobile-top">
                    <h3>{facility.name}</h3>
                    <span className={getStatusClass(facility.status)}>{facility.status}</span>
                  </div>

                  <p>
                    <span>Type</span>
                    <strong>{facility.type}</strong>
                  </p>
                  <p>
                    <span>Location</span>
                    <strong>{facility.location}</strong>
                  </p>
                  <p>
                    <span>Capacity</span>
                    <strong>{facility.capacity}</strong>
                  </p>

                  <div className="mf-row-actions">
                    <button
                      type="button"
                      className="mf-btn mf-btn-secondary"
                      onClick={() => handleOpenEditForm(facility)}
                    >
                      Edit Facility
                    </button>
                    <button
                      type="button"
                      className="mf-btn mf-btn-danger"
                      onClick={() => handleDeleteFacility(facility.id)}
                    >
                      Delete Facility
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
