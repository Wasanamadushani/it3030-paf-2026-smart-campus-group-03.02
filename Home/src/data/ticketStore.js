const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
const TICKETS_API_URL = `${API_BASE_URL}/api/tickets`;

async function parseErrorMessage(response) {
  try {
    const payload = await response.json();
    if (payload && typeof payload.message === "string" && payload.message.trim().length > 0) {
      return payload.message;
    }
  } catch (error) {
    // Ignore parse errors and use fallback.
  }

  return `Request failed with status ${response.status}`;
}

function normalizeTicket(ticket) {
  return {
    id: Number(ticket?.id) || 0,
    reporterName: ticket?.reporterName || "",
    reporterEmail: ticket?.reporterEmail || "",
    registerNumber: ticket?.registerNumber || "",
    faculty: ticket?.faculty || "",
    contactNumber: ticket?.contactNumber || "",
    title: ticket?.title || "",
    category: ticket?.category || "OTHER",
    priority: ticket?.priority || "MEDIUM",
    location: ticket?.location || "",
    description: ticket?.description || "",
    status: ticket?.status || "OPEN",
    createdAt: ticket?.createdAt || null,
    updatedAt: ticket?.updatedAt || null,
    adminComment: ticket?.adminComment || "",
    attachments: Array.isArray(ticket?.attachments)
      ? ticket.attachments.map((attachment) => ({
          fileName: attachment?.fileName || "attachment",
          contentType: attachment?.contentType || "application/octet-stream",
          sizeInBytes: Number(attachment?.sizeInBytes) || 0,
          dataBase64: attachment?.dataBase64 || "",
        }))
      : [],
  };
}

function toQueryString(filters = {}) {
  const params = new URLSearchParams();

  const reporterEmail = String(filters.reporterEmail ?? "").trim();
  const status = String(filters.status ?? "").trim();

  if (reporterEmail) {
    params.set("reporterEmail", reporterEmail);
  }

  if (status && status !== "ALL") {
    params.set("status", status);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function requestTickets(path = "", options = {}) {
  const response = await fetch(`${TICKETS_API_URL}${path}`, {
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

export async function getTickets(filters = {}) {
  const payload = await requestTickets(toQueryString(filters), { method: "GET" });
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map(normalizeTicket);
}

export async function createTicket(ticketPayload) {
  const payload = await requestTickets("", {
    method: "POST",
    body: JSON.stringify(ticketPayload),
  });

  return normalizeTicket(payload);
}

export async function updateTicketStatus(id, status) {
  const payload = await requestTickets(`/${Number(id)}/status?status=${encodeURIComponent(status)}`, {
    method: "PATCH",
  });

  return normalizeTicket(payload);
}
