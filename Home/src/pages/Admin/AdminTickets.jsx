import { useEffect, useState } from "react";
import "../../styles/tickets.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

function toLabel(value) {
  return String(value || "")
    .toLowerCase()
    .split("_")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
    .join(" ");
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

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

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
    status: ticket?.status || "PENDING",
    createdAt: ticket?.createdAt || null,
    updatedAt: ticket?.updatedAt || null,
    adminComment: ticket?.adminComment || "",
  };
}

async function getAdminTickets({ status = "ALL", registerNumber = "" } = {}) {
  const params = new URLSearchParams();

  if (status && status !== "ALL") {
    params.set("status", status);
  }

  if (registerNumber.trim()) {
    params.set("registerNumber", registerNumber.trim().toUpperCase());
  }

  const query = params.toString();
  const payload = await request(`/api/tickets${query ? `?${query}` : ""}`, { method: "GET" });

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map(normalizeTicket);
}

async function openTicket(ticketId) {
  return request(`/api/tickets/${ticketId}/status?status=IN_PROGRESS`, {
    method: "PATCH",
  });
}

async function respondToTicket(ticketId, comment) {
  return request(`/api/tickets/${ticketId}/comment?comment=${encodeURIComponent(comment)}`, {
    method: "PATCH",
  });
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [registerNumberFilter, setRegisterNumberFilter] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedTicketId = selectedTicket?.id || null;

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (!selectedTicketId) {
      return;
    }

    const latestSelected = tickets.find((ticket) => ticket.id === selectedTicketId);
    if (latestSelected) {
      setSelectedTicket(latestSelected);
      if (latestSelected.adminComment) {
        setResponseMessage(latestSelected.adminComment);
      }
    }
  }, [tickets, selectedTicketId]);

  async function loadTickets() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getAdminTickets({
        registerNumber: registerNumberFilter,
      });
      setTickets(data);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectTicket(ticket) {
    setSelectedTicket(ticket);
    setResponseMessage(ticket.adminComment || "");
    setSuccessMessage("");
    setErrorMessage("");
  }

  async function handleSearch(event) {
    event.preventDefault();
    await loadTickets();
  }

  async function handleOpenTicket() {
    if (!selectedTicket) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await openTicket(selectedTicket.id);
      setSuccessMessage("Ticket opened. Student now sees In Progress.");
      await loadTickets();
    } catch (error) {
      setErrorMessage(error.message || "Failed to open ticket");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRespondTicket() {
    if (!selectedTicket) {
      return;
    }

    if (!responseMessage.trim()) {
      setErrorMessage("Please enter a response message.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await respondToTicket(selectedTicket.id, responseMessage.trim());
      setSuccessMessage("Response sent. Ticket moved to Resolved.");
      await loadTickets();
    } catch (error) {
      setErrorMessage(error.message || "Failed to respond to ticket");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-ticket-page">
      <section className="admin-ticket-layout">
        <article className="admin-ticket-list-card">
          <div className="admin-ticket-list-head">
            <h3>Tickets</h3>
            <button type="button" className="admin-ticket-btn secondary" onClick={loadTickets}>
              Refresh
            </button>
          </div>

          <form className="admin-ticket-filter-form" onSubmit={handleSearch}>
            <div>
              <label htmlFor="adminRegFilter">Student Register No</label>
              <input
                id="adminRegFilter"
                type="text"
                value={registerNumberFilter}
                onChange={(event) => setRegisterNumberFilter(event.target.value.toUpperCase())}
                placeholder="IT23986587"
              />
            </div>

            <button type="submit" className="admin-ticket-btn">Search</button>
          </form>

          {isLoading && <p className="admin-ticket-note">Loading tickets...</p>}
          {!isLoading && tickets.length === 0 && <p className="admin-ticket-note">No tickets found.</p>}

          <div className="admin-ticket-list">
            {tickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;
              return (
                <button
                  key={ticket.id}
                  type="button"
                  className={isSelected ? "admin-ticket-item selected" : "admin-ticket-item"}
                  onClick={() => handleSelectTicket(ticket)}
                >
                  <div>
                    <strong>{ticket.title}</strong>
                    <p>{ticket.registerNumber}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        <article className="admin-ticket-detail-card">
          {!selectedTicket && <p className="admin-ticket-note">Select a ticket to manage.</p>}

          {selectedTicket && (
            <>
              <div className="admin-ticket-detail-head">
                <h3>{selectedTicket.title}</h3>
              </div>

              <div className="admin-ticket-detail-grid">
                <p><strong>Student:</strong> {selectedTicket.reporterName}</p>
                <p><strong>Email:</strong> {selectedTicket.reporterEmail}</p>
                <p><strong>Register No:</strong> {selectedTicket.registerNumber}</p>
                <p><strong>Faculty:</strong> {toLabel(selectedTicket.faculty)}</p>
                <p><strong>Contact:</strong> {selectedTicket.contactNumber}</p>
                <p><strong>Category:</strong> {toLabel(selectedTicket.category)}</p>
                <p><strong>Priority:</strong> {toLabel(selectedTicket.priority)}</p>
                <p><strong>Created:</strong> {formatDateTime(selectedTicket.createdAt)}</p>
              </div>

              <p className="admin-ticket-block"><strong>Reference:</strong> {selectedTicket.location}</p>
              <p className="admin-ticket-block"><strong>Description:</strong> {selectedTicket.description}</p>

              <label htmlFor="adminResponse">Admin Response Message</label>
              <textarea
                id="adminResponse"
                value={responseMessage}
                onChange={(event) => setResponseMessage(event.target.value)}
                placeholder="Type your response to the student"
                rows={4}
              />

              <div className="admin-ticket-actions">
                <button
                  type="button"
                  className="admin-ticket-btn"
                  disabled={isSubmitting || selectedTicket.status !== "PENDING"}
                  onClick={handleOpenTicket}
                >
                  Open Ticket
                </button>
                <button
                  type="button"
                  className="admin-ticket-btn"
                  disabled={isSubmitting || selectedTicket.status !== "IN_PROGRESS"}
                  onClick={handleRespondTicket}
                >
                  Respond & Resolve
                </button>
              </div>
            </>
          )}

          {successMessage && <p className="ticket-message ticket-success">{successMessage}</p>}
          {errorMessage && <p className="ticket-message ticket-error">{errorMessage}</p>}
        </article>
      </section>
    </div>
  );
}
