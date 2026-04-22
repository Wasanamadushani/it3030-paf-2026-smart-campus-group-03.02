import { useEffect, useRef, useState } from "react";
import "../../styles/tickets.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
const MAX_ATTACHMENT_FILES = 5;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

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

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function buildAttachmentDataUrl(attachment) {
  if (!attachment?.dataBase64) {
    return "#";
  }

  const contentType = attachment.contentType || "application/octet-stream";
  return `data:${contentType};base64,${attachment.dataBase64}`;
}

function isAdminAttachment(attachment) {
  const normalizedSource = String(attachment?.uploadedBy || "").trim().toUpperCase();
  return normalizedSource === "UPLOADED_BY_ADMIN" || normalizedSource === "ADMIN";
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

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
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
    attachments: Array.isArray(ticket?.attachments)
      ? ticket.attachments.map((attachment) => ({
          fileName: attachment?.fileName || "attachment",
          contentType: attachment?.contentType || "application/octet-stream",
          sizeInBytes: Number(attachment?.sizeInBytes) || 0,
          dataBase64: attachment?.dataBase64 || "",
          uploadedBy: attachment?.uploadedBy || "UPLOADED_BY_STUDENT",
        }))
      : [],
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

async function respondToTicket(ticketId, payload) {
  return request(`/api/tickets/${ticketId}/comment`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export default function AdminTickets() {
  const fileInputRef = useRef(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [registerNumberFilter, setRegisterNumberFilter] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedTicketId = selectedTicket?.id || null;
  const studentAttachments = selectedTicket?.attachments?.filter((attachment) => !isAdminAttachment(attachment)) || [];
  const adminAttachments = selectedTicket?.attachments?.filter((attachment) => isAdminAttachment(attachment)) || [];

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

      const filteredTickets = data.filter((ticket) =>
        showHistory
          ? ticket.status === "RESOLVED" || ticket.status === "CLOSED"
          : ticket.status !== "RESOLVED" && ticket.status !== "CLOSED"
      );

      setTickets(filteredTickets);
      setSelectedTicket((currentSelected) => {
        if (!currentSelected) {
          return filteredTickets[0] || null;
        }

        return filteredTickets.find((ticket) => ticket.id === currentSelected.id) || filteredTickets[0] || null;
      });
    } catch (error) {
      setErrorMessage(error.message || "Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [showHistory]);

  function resetAttachmentInput() {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSelectTicket(ticket) {
    setSelectedTicket(ticket);
    setResponseMessage(ticket.adminComment || "");
    resetAttachmentInput();
    setSuccessMessage("");
    setErrorMessage("");
  }

  function handleAttachmentsChange(event) {
    const files = Array.from(event.target.files || []);
    setErrorMessage("");

    if (files.length > MAX_ATTACHMENT_FILES) {
      resetAttachmentInput();
      setErrorMessage(`You can attach up to ${MAX_ATTACHMENT_FILES} files.`);
      return;
    }

    const invalidFile = files.find((file) => file.size > MAX_ATTACHMENT_BYTES);
    if (invalidFile) {
      resetAttachmentInput();
      setErrorMessage(`Each file must be 5 MB or smaller. Invalid file: ${invalidFile.name}`);
      return;
    }

    setSelectedFiles(files);
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

    if (!responseMessage.trim() && selectedFiles.length === 0) {
      setErrorMessage("Please enter a response message or attach at least one file.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const attachments = await Promise.all(
        selectedFiles.map(async (file) => ({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          sizeInBytes: file.size,
          dataBase64: await readFileAsBase64(file),
          uploadedBy: "UPLOADED_BY_ADMIN",
        }))
      );

      await respondToTicket(selectedTicket.id, {
        comment: responseMessage.trim(),
        attachments,
      });

      resetAttachmentInput();
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
            <h3>{showHistory ? "Ticket History" : "Tickets"}</h3>
            <div className="admin-ticket-list-head-actions">
              <button
                type="button"
                className="admin-ticket-btn secondary"
                onClick={() => {
                  setShowHistory((currentValue) => !currentValue);
                  setSuccessMessage("");
                  setErrorMessage("");
                }}
              >
                {showHistory ? "Active Tickets" : "Tcket History"}
              </button>
              <button type="button" className="admin-ticket-btn secondary" onClick={loadTickets}>
                Refresh
              </button>
            </div>
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
          {!isLoading && tickets.length === 0 && (
            <p className="admin-ticket-note">
              {showHistory ? "No resolved tickets found in history." : "No active tickets found."}
            </p>
          )}

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
                  <span className={`admin-ticket-badge status-${String(ticket.status || "").toLowerCase()}`}>
                    {toLabel(ticket.status)}
                  </span>
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

              {studentAttachments.length > 0 && (
                <div className="ticket-attachments">
                  <strong>Student Attachments:</strong>
                  <ul>
                    {studentAttachments.map((attachment, index) => (
                      <li key={`${selectedTicket.id}-${attachment.fileName}-${index}`}>
                        <a
                          href={buildAttachmentDataUrl(attachment)}
                          download={attachment.fileName}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {attachment.fileName}
                        </a>
                        <span>{formatBytes(attachment.sizeInBytes)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <label htmlFor="adminResponse">Admin Response Message</label>
              <textarea
                id="adminResponse"
                value={responseMessage}
                onChange={(event) => setResponseMessage(event.target.value)}
                placeholder="Type your response to the student"
                rows={4}
                disabled={showHistory}
              />

              {adminAttachments.length > 0 && (
                <div className="ticket-admin-attachments">
                  <strong>Admin Attachments:</strong>
                  <ul>
                    {adminAttachments.map((attachment, index) => (
                      <li key={`${selectedTicket.id}-admin-${attachment.fileName}-${index}`}>
                        <a
                          href={buildAttachmentDataUrl(attachment)}
                          download={attachment.fileName}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {attachment.fileName}
                        </a>
                        <span>{formatBytes(attachment.sizeInBytes)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="admin-ticket-attachment-field">
                <label htmlFor="adminAttachments">Attachments for Student</label>
                <input
                  id="adminAttachments"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleAttachmentsChange}
                  disabled={showHistory || isSubmitting || selectedTicket.status !== "IN_PROGRESS"}
                />
                <p className="ticket-helper-text">Up to 5 files, each max 5 MB.</p>
                {selectedFiles.length > 0 && (
                  <div className="ticket-selected-files">
                    {selectedFiles.map((file) => (
                      <span key={`${file.name}-${file.size}`} className="ticket-file-chip">
                        {file.name} ({formatBytes(file.size)})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-ticket-actions">
                <button
                  type="button"
                  className="admin-ticket-btn"
                  disabled={showHistory || isSubmitting || selectedTicket.status !== "PENDING"}
                  onClick={handleOpenTicket}
                >
                  Open Ticket
                </button>
                <button
                  type="button"
                  className="admin-ticket-btn"
                  disabled={showHistory || isSubmitting || selectedTicket.status !== "IN_PROGRESS"}
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
