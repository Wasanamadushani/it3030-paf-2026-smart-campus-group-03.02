import { useEffect, useState } from "react";
import "../../styles/manageFacilities.css";
import {
  addFacility,
  getFacilities,
  removeFacility,
  subscribeFacilities,
  updateFacility,
} from "../../data/facilitiesStore";

const FACILITY_TYPE_OPTIONS = ["Room", "Lab", "Lecture Hall", "Equipment"];

const BUILDING_FLOOR_MAP = {
  Main: 6,
  New: 14,
  Engineering: 5,
  Business: 4,
};

const NEW_BUILDING_BLOCK_OPTIONS = ["F Block (Lecture Halls)", "G Block (Labs)"];

const EMPTY_FORM = {
  name: "",
  type: "Room",
  status: "ACTIVE",
  building: "",
  floor: "",
  block: "",
  capacity: "",
};

function getStatusClass(status) {
  return status === "ACTIVE" ? "mf-status mf-status-active" : "mf-status mf-status-out";
}

function getCapacityLimitByType(type) {
  if (type === "Lab") {
    return 40;
  }

  if (type === "Lecture Hall") {
    return 500;
  }

  return null;
}

function getCapacityLimitError(type) {
  if (type === "Lab") {
    return "Lab capacity cannot exceed 40";
  }

  if (type === "Lecture Hall") {
    return "Lecture Hall capacity cannot exceed 500";
  }

  return "";
}

function buildLocation(building, floor, block) {
  if (!building || !floor) {
    return "";
  }

  const buildingLabel = `${building} Building`;
  const isNewBuilding = building === "New";

  return [buildingLabel, `Floor ${floor}`, isNewBuilding && block ? block : null]
    .filter(Boolean)
    .join(" - ");
}

export default function ManageFacilities() {
  // TODO: Connect to backend and role-based authentication

  const [facilities, setFacilities] = useState(() => getFacilities());
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFacilityId, setEditingFacilityId] = useState(null);

  useEffect(() => {
    setFacilities(getFacilities());
    return subscribeFacilities(setFacilities);
  }, []);

  const isEditing = editingFacilityId !== null;
  const isNewBuilding = formData.building === "New";
  const floorOptions = formData.building
    ? Array.from({ length: BUILDING_FLOOR_MAP[formData.building] }, (_, index) => String(index + 1))
    : [];
  const capacityLimit = getCapacityLimitByType(formData.type);
  const capacityErrorMessage = getCapacityLimitError(formData.type);
  const formattedLocation = buildLocation(formData.building, formData.floor, formData.block);

  function setFormFieldError(field, value) {
    setFormErrors((prev) => {
      const next = { ...prev };

      if (value) {
        next[field] = value;
      } else {
        delete next[field];
      }

      return next;
    });
  }

  function handleCapacityChange(rawValue, nextType = formData.type) {
    if (rawValue === "") {
      setFormData((prev) => ({ ...prev, capacity: "" }));
      setFormFieldError("capacity", "");
      return;
    }

    const parsedCapacity = Number(rawValue);

    if (Number.isNaN(parsedCapacity) || parsedCapacity < 1) {
      setFormData((prev) => ({ ...prev, capacity: rawValue }));
      setFormFieldError("capacity", "Capacity must be greater than 0");
      return;
    }

    const nextLimit = getCapacityLimitByType(nextType);
    if (nextLimit && parsedCapacity > nextLimit) {
      setFormData((prev) => ({ ...prev, capacity: String(nextLimit) }));
      setFormFieldError("capacity", getCapacityLimitError(nextType));
      return;
    }

    setFormData((prev) => ({ ...prev, capacity: rawValue }));
    setFormFieldError("capacity", "");
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setSuccessMessage("");

    if (name === "building") {
      setFormData((prev) => ({
        ...prev,
        building: value,
        floor: "",
        block: "",
      }));
      setFormFieldError("building", "");
      setFormFieldError("floor", "");
      setFormFieldError("block", "");
      return;
    }

    if (name === "type") {
      setFormData((prev) => ({ ...prev, type: value }));
      setFormFieldError("type", "");
      handleCapacityChange(formData.capacity, value);
      return;
    }

    if (name === "capacity") {
      handleCapacityChange(value);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormFieldError(name, "");
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!formData.type) {
      nextErrors.type = "Type is required";
    }

    if (!formData.status) {
      nextErrors.status = "Status is required";
    }

    if (!formData.building) {
      nextErrors.building = "Building is required";
    }

    if (!formData.floor) {
      nextErrors.floor = "Floor is required";
    }

    if (isNewBuilding && !formData.block) {
      nextErrors.block = "Block is required for New Building";
    }

    if (!formData.capacity) {
      nextErrors.capacity = "Capacity is required";
    } else {
      const parsedCapacity = Number(formData.capacity);
      if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
        nextErrors.capacity = "Capacity must be greater than 0";
      } else if (capacityLimit && parsedCapacity > capacityLimit) {
        nextErrors.capacity = capacityErrorMessage;
      }
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function toFormData(facility) {
    return {
      name: facility.name,
      type: facility.type,
      status: facility.status,
      building: facility.building || "",
      floor: facility.floor ? String(facility.floor) : "",
      block: facility.block || "",
      capacity: String(facility.capacity),
    };
  }

  function handleOpenAddForm() {
    setEditingFacilityId(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setSuccessMessage("");
    setIsFormOpen(true);
  }

  function handleOpenEditForm(facility) {
    setEditingFacilityId(facility.id);
    setFormData(toFormData(facility));
    setFormErrors({});
    setSuccessMessage("");
    setIsFormOpen(true);
  }

  function handleDeleteFacility(id) {
    setFacilities(removeFacility(id));

    if (editingFacilityId === id) {
      setEditingFacilityId(null);
      setFormData(EMPTY_FORM);
      setIsFormOpen(false);
    }
  }

  function handleCancelForm() {
    setEditingFacilityId(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setIsFormOpen(false);
  }

  function handleSubmitForm(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      building: formData.building,
      floor: Number(formData.floor),
      block: isNewBuilding ? formData.block : "",
      location: formattedLocation,
      capacity: Number(formData.capacity),
      status: formData.status,
    };

    if (isEditing) {
      setFacilities(updateFacility(editingFacilityId, payload));
    } else {
      setFacilities(addFacility(payload));
    }

    setEditingFacilityId(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setSuccessMessage(isEditing ? "Facility updated successfully" : "Facility added successfully");
    setIsFormOpen(false);
  }

  return (
    <div className="mf-container">
        <header className="mf-header">
          <div>
            <h1>Manage Facilities</h1>
            <p>
              Add, edit, and remove facilities using structured building, floor, and capacity rules.
            </p>
          </div>

          <button type="button" className="mf-btn mf-btn-primary" onClick={handleOpenAddForm}>
            Add Facility
          </button>
        </header>

        {successMessage && <p className="mf-form-success">{successMessage}</p>}

        {isFormOpen && (
          <section className="mf-form-card" aria-label="Facility form">
            <h2>{isEditing ? "Edit Facility" : "Add Facility"}</h2>
            <p className="mf-form-subtitle">Location is auto-generated from building and floor.</p>

            <form className="mf-form-grid" onSubmit={handleSubmitForm}>
              <label>
                Name
                <input
                  required
                  name="name"
                  type="text"
                  className={formErrors.name ? "mf-input-error" : ""}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter facility name"
                />
                {formErrors.name && <p className="mf-field-error">{formErrors.name}</p>}
              </label>

              <label>
                Type
                <select
                  name="type"
                  className={formErrors.type ? "mf-input-error" : ""}
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  {FACILITY_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {formErrors.type && <p className="mf-field-error">{formErrors.type}</p>}
              </label>

              <label>
                Status
                <select
                  name="status"
                  className={formErrors.status ? "mf-input-error" : ""}
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                </select>
                {formErrors.status && <p className="mf-field-error">{formErrors.status}</p>}
              </label>

              <label>
                Building
                <select
                  name="building"
                  className={formErrors.building ? "mf-input-error" : ""}
                  value={formData.building}
                  onChange={handleInputChange}
                >
                  <option value="">Select building</option>
                  {Object.keys(BUILDING_FLOOR_MAP).map((building) => (
                    <option key={building} value={building}>
                      {building}
                    </option>
                  ))}
                </select>
                {formErrors.building && <p className="mf-field-error">{formErrors.building}</p>}
              </label>

              {formData.building && (
                <label>
                  Floor
                  <select
                    name="floor"
                    className={formErrors.floor ? "mf-input-error" : ""}
                    value={formData.floor}
                    onChange={handleInputChange}
                  >
                    <option value="">Select floor</option>
                    {floorOptions.map((floor) => (
                      <option key={floor} value={floor}>
                        Floor {floor}
                      </option>
                    ))}
                  </select>
                  {formErrors.floor && <p className="mf-field-error">{formErrors.floor}</p>}
                </label>
              )}

              {isNewBuilding && (
                <label>
                  Block
                  <select
                    name="block"
                    className={formErrors.block ? "mf-input-error" : ""}
                    value={formData.block}
                    onChange={handleInputChange}
                  >
                    <option value="">Select block</option>
                    {NEW_BUILDING_BLOCK_OPTIONS.map((block) => (
                      <option key={block} value={block}>
                        {block}
                      </option>
                    ))}
                  </select>
                  {formErrors.block && <p className="mf-field-error">{formErrors.block}</p>}
                </label>
              )}

              <label>
                Capacity
                <input
                  required
                  min="1"
                  max={capacityLimit ?? undefined}
                  name="capacity"
                  type="number"
                  className={formErrors.capacity ? "mf-input-error" : ""}
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder={capacityLimit ? `Max ${capacityLimit}` : "Enter capacity"}
                />
                {capacityLimit && <p className="mf-field-hint">Maximum allowed: {capacityLimit}</p>}
                {formErrors.capacity && <p className="mf-field-error">{formErrors.capacity}</p>}
              </label>

              <label className="mf-form-field-full">
                Formatted Location
                <input
                  type="text"
                  value={formattedLocation}
                  readOnly
                  placeholder="Select building and floor to generate location"
                />
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
  );
}
