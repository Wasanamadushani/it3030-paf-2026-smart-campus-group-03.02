const FACILITIES_STORAGE_KEY = "sch.facilities";
const FACILITIES_UPDATED_EVENT = "smart-campus:facilities-updated";

const DEFAULT_FACILITIES = [
  {
    id: 1,
    name: "Lecture Hall A1",
    type: "Lecture Hall",
    building: "Main",
    floor: 1,
    block: "",
    location: "Main Building - Floor 1",
    capacity: 220,
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Advanced Networking Lab",
    type: "Lab",
    building: "Engineering",
    floor: 3,
    block: "",
    location: "Engineering Building - Floor 3",
    capacity: 40,
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Portable PA System",
    type: "Equipment",
    building: "Business",
    floor: 1,
    block: "",
    location: "Business Building - Floor 1",
    capacity: 1,
    status: "OUT_OF_SERVICE",
  },
];

function normalizeFacility(facility, fallbackId) {
  return {
    id: Number.isInteger(facility.id) ? facility.id : fallbackId,
    name: facility.name ?? "",
    type: facility.type ?? "Room",
    building: facility.building ?? "",
    floor: facility.floor ?? "",
    block: facility.block ?? "",
    location: facility.location ?? "",
    capacity: Number(facility.capacity) || 0,
    status: facility.status ?? "ACTIVE",
  };
}

function cloneDefaultFacilities() {
  return DEFAULT_FACILITIES.map((facility, index) => normalizeFacility(facility, index + 1));
}

function isBrowserEnvironment() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function persistFacilities(nextFacilities) {
  if (!isBrowserEnvironment()) {
    return;
  }

  window.localStorage.setItem(FACILITIES_STORAGE_KEY, JSON.stringify(nextFacilities));
  window.dispatchEvent(
    new CustomEvent(FACILITIES_UPDATED_EVENT, {
      detail: nextFacilities,
    })
  );
}

export function getFacilities() {
  if (!isBrowserEnvironment()) {
    return cloneDefaultFacilities();
  }

  try {
    const rawValue = window.localStorage.getItem(FACILITIES_STORAGE_KEY);

    if (!rawValue) {
      return cloneDefaultFacilities();
    }

    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return cloneDefaultFacilities();
    }

    return parsed.map((facility, index) => normalizeFacility(facility, index + 1));
  } catch (error) {
    return cloneDefaultFacilities();
  }
}

export function addFacility(facilityPayload) {
  const current = getFacilities();
  const nextId = current.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  const created = normalizeFacility({ ...facilityPayload, id: nextId }, nextId);
  const next = [...current, created];

  persistFacilities(next);
  return next;
}

export function updateFacility(id, facilityPayload) {
  const numericId = Number(id);
  const next = getFacilities().map((facility) => {
    if (facility.id !== numericId) {
      return facility;
    }

    return normalizeFacility({ ...facility, ...facilityPayload, id: numericId }, numericId);
  });

  persistFacilities(next);
  return next;
}

export function removeFacility(id) {
  const numericId = Number(id);
  const next = getFacilities().filter((facility) => facility.id !== numericId);

  persistFacilities(next);
  return next;
}

export function subscribeFacilities(onFacilitiesChange) {
  if (!isBrowserEnvironment()) {
    return () => {};
  }

  const handleInTabUpdate = (event) => {
    if (Array.isArray(event.detail)) {
      onFacilitiesChange(event.detail);
      return;
    }

    onFacilitiesChange(getFacilities());
  };

  const handleStorageUpdate = (event) => {
    if (event.key !== FACILITIES_STORAGE_KEY) {
      return;
    }

    onFacilitiesChange(getFacilities());
  };

  window.addEventListener(FACILITIES_UPDATED_EVENT, handleInTabUpdate);
  window.addEventListener("storage", handleStorageUpdate);

  return () => {
    window.removeEventListener(FACILITIES_UPDATED_EVENT, handleInTabUpdate);
    window.removeEventListener("storage", handleStorageUpdate);
  };
}
