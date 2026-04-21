const FACILITIES_UPDATED_EVENT = "smart-campus:facilities-updated";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
const FACILITIES_API_URL = `${API_BASE_URL}/api/facilities`;

function normalizeFacility(facility, fallbackId) {
  return {
    id: Number.isFinite(Number(facility.id)) ? Number(facility.id) : fallbackId,
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

function normalizeFacilityList(facilities) {
  if (!Array.isArray(facilities)) {
    return [];
  }

  return facilities.map((facility, index) => normalizeFacility(facility, index + 1));
}

function isBrowserEnvironment() {
  return typeof window !== "undefined";
}

async function parseErrorMessage(response) {
  try {
    const payload = await response.json();
    if (payload && typeof payload.message === "string" && payload.message.trim().length > 0) {
      return payload.message;
    }
  } catch (error) {
    // Ignore parse errors and use fallback message.
  }

  return `Request failed with status ${response.status}`;
}

async function requestFacilities(path = "", options = {}) {
  const response = await fetch(`${FACILITIES_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function toQueryString(filters = {}) {
  const params = new URLSearchParams();
  const search = String(filters.search ?? "").trim();
  const type = String(filters.type ?? "").trim();
  const status = String(filters.status ?? "").trim();

  if (search) {
    params.set("search", search);
  }

  if (type && type !== "ALL") {
    params.set("type", type);
  }

  if (status && status !== "ALL") {
    params.set("status", status);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function emitFacilitiesUpdated(nextFacilities) {
  if (!isBrowserEnvironment()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(FACILITIES_UPDATED_EVENT, {
      detail: nextFacilities,
    })
  );
}

export async function getFacilities(filters = {}) {
  const facilities = await requestFacilities(toQueryString(filters), { method: "GET" });
  return normalizeFacilityList(facilities);
}

export async function getFacilitiesSummary() {
  return requestFacilities("/summary", { method: "GET" });
}

export async function getFacilityById(id) {
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    throw new Error("Invalid facility id");
  }

  const facility = await requestFacilities(`/${numericId}`, { method: "GET" });
  return normalizeFacility(facility, numericId);
}

export async function addFacility(facilityPayload) {
  await requestFacilities("", {
    method: "POST",
    body: JSON.stringify(facilityPayload),
  });

  const nextFacilities = await getFacilities();
  await emitFacilitiesUpdated(nextFacilities);
  return nextFacilities;
}

export async function updateFacility(id, facilityPayload) {
  await requestFacilities(`/${Number(id)}`, {
    method: "PUT",
    body: JSON.stringify(facilityPayload),
  });

  const nextFacilities = await getFacilities();
  await emitFacilitiesUpdated(nextFacilities);
  return nextFacilities;
}

export async function removeFacility(id) {
  await requestFacilities(`/${Number(id)}`, {
    method: "DELETE",
  });

  const nextFacilities = await getFacilities();
  await emitFacilitiesUpdated(nextFacilities);
  return nextFacilities;
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

    getFacilities()
      .then(onFacilitiesChange)
      .catch(() => {
        // Ignore subscription refresh errors.
      });
  };

  window.addEventListener(FACILITIES_UPDATED_EVENT, handleInTabUpdate);

  return () => {
    window.removeEventListener(FACILITIES_UPDATED_EVENT, handleInTabUpdate);
  };
}
