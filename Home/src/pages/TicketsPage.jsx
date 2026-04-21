import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { createTicket, getTickets } from "../data/ticketStore";
import "../styles/tickets.css";

const AUTH_STORAGE_KEY = "sch.currentUser";

const CATEGORY_OPTIONS = [
  { value: "REGISTRATION", label: "Registration" },
  { value: "EXAM", label: "Exam" },
  { value: "RESULTS", label: "Results" },
  { value: "ATTENDANCE", label: "Attendance" },
  { value: "COURSE_CONTENT", label: "Course Content" },
  { value: "ASSIGNMENT", label: "Assignment" },
  { value: "FEE", label: "Fee" },
  { value: "OTHER", label: "Other" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const MAX_ATTACHMENT_FILES = 5;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

const DEFAULT_FORM = {
  reporterName: "",
  reporterEmail: "",
  title: "",
  category: "REGISTRATION",
  priority: "MEDIUM",
  location: "",
  description: "",
};

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

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64Data = result.includes(",") ? result.split(",")[1] : "";

      if (!base64Data) {
        reject(new Error(`Failed to process ${file.name}`));
        return;
      }

      resolve(base64Data);
    };

    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function buildAttachmentDataUrl(attachment) {
  if (!attachment?.dataBase64) {
    return "#";
  }

  const contentType = attachment.contentType || "application/octet-stream";
  return `data:${contentType};base64,${attachment.dataBase64}`;
}

export default function TicketsPage() {
  const [loggedUser, setLoggedUser] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  const hasEmail = form.reporterEmail.trim().length > 0;

  useEffect(() => {
    try {
      const persistedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!persistedUser) {
        return;
      }

      const user = JSON.parse(persistedUser);
      const nextName = typeof user?.fullName === "string" ? user.fullName : "";
      const nextEmail = typeof user?.email === "string" ? user.email : "";

      setLoggedUser(user);

      setForm((prev) => ({
        ...prev,
        reporterName: nextName || prev.reporterName,
        reporterEmail: nextEmail || prev.reporterEmail,
      }));
    } catch (error) {
      // Ignore local storage parsing errors.
    }
  }, []);

  useEffect(() => {
    if (!hasEmail) {
      setTickets([]);
      return;
    }

    loadTickets();
  }, [statusFilter, hasEmail]);

  async function loadTickets() {
    if (!form.reporterEmail.trim()) {
      setTickets([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const items = await getTickets({
        reporterEmail: form.reporterEmail,
        status: statusFilter,
      });
      setTickets(items);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load your tickets");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFieldChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleAttachmentsChange(event) {
    const files = Array.from(event.target.files || []);
    setErrorMessage("");

    if (files.length > MAX_ATTACHMENT_FILES) {
      setSelectedFiles([]);
      setErrorMessage(`You can attach up to ${MAX_ATTACHMENT_FILES} files.`);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const invalidFile = files.find((file) => file.size > MAX_ATTACHMENT_BYTES);
    if (invalidFile) {
      setSelectedFiles([]);
      setErrorMessage(`Each file must be 5 MB or smaller. Invalid file: ${invalidFile.name}`);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSelectedFiles(files);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!loggedUser || !form.reporterName.trim() || !form.reporterEmail.trim()) {
      setErrorMessage("Please login first. Name and email are taken from your account.");
      return;
    }

    setIsSubmitting(true);

    try {
      const attachments = await Promise.all(
        selectedFiles.map(async (file) => ({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          sizeInBytes: file.size,
          dataBase64: await readFileAsBase64(file),
        }))
      );

      await createTicket({
        reporterName: form.reporterName,
        reporterEmail: form.reporterEmail,
        title: form.title,
        category: form.category,
        priority: form.priority,
        location: form.location,
        description: form.description,
        attachments,
      });

      setSuccessMessage("Ticket raised successfully.");
      setForm((prev) => ({
        ...prev,
        title: "",
        category: "REGISTRATION",
        priority: "MEDIUM",
        location: "",
        description: "",
      }));
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadTickets();
    } catch (error) {
      setErrorMessage(error.message || "Failed to raise ticket");
    } finally {
      setIsSubmitting(false);
    }
  }

  const ticketCountLabel = useMemo(() => {
    if (!hasEmail) {
      return "Enter your email to load your tickets.";
    }

    if (isLoading) {
      return "Loading your tickets...";
    }

    return `${tickets.length} ticket${tickets.length === 1 ? "" : "s"} found.`;
  }, [hasEmail, isLoading, tickets.length]);

  return (
    <div className="app-shell">
      <Navbar role="USER" />

      <main className="tickets-main-content">
        <section className="tickets-hero">
          <h1>Raise an Academic Support Ticket</h1>
          <p>
            Report issues related to registration, exams, results, attendance, or coursework.
            Once submitted, you can track progress from this page.
          </p>
        </section>

        <section className="tickets-layout">
          <article className="ticket-panel ticket-form-panel">
            <h2>Raise New Ticket</h2>
            <p>Fill in the details clearly so the support team can resolve it quickly.</p>

            <form className="ticket-form" onSubmit={handleSubmit}>
              <label htmlFor="reporterName">Your Name</label>
              <input
                id="reporterName"
                type="text"
                className="ticket-readonly-input"
                value={form.reporterName}
                placeholder="Name from login"
                readOnly
                required
              />

              <label htmlFor="reporterEmail">Your Email</label>
              <input
                id="reporterEmail"
                type="email"
                className="ticket-readonly-input"
                value={form.reporterEmail}
                placeholder="Email from login"
                readOnly
                required
              />
              <p className="ticket-helper-text">These fields are auto-filled from your logged-in account.</p>

              <label htmlFor="title">Ticket Title</label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(event) => handleFieldChange("title", event.target.value)}
                placeholder="Short summary of the academic issue"
                required
              />

              <div className="ticket-form-row">
                <div>
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={(event) => handleFieldChange("category", event.target.value)}
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    value={form.priority}
                    onChange={(event) => handleFieldChange("priority", event.target.value)}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label htmlFor="location">Reference Details</label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={(event) => handleFieldChange("location", event.target.value)}
                placeholder="Course code / semester / registration number"
                required
              />

              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(event) => handleFieldChange("description", event.target.value)}
                placeholder="Explain the issue clearly and include useful details"
                rows={5}
                required
              />

              <label htmlFor="attachments">Attachments (Optional)</label>
              <input
                id="attachments"
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleAttachmentsChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              />
              <p className="ticket-helper-text">Up to 5 files, max 5 MB each.</p>

              {selectedFiles.length > 0 && (
                <div className="ticket-selected-files">
                  {selectedFiles.map((file) => (
                    <span key={`${file.name}-${file.size}`} className="ticket-file-chip">
                      {file.name} ({formatBytes(file.size)})
                    </span>
                  ))}
                </div>
              )}

              {successMessage && <p className="ticket-message ticket-success">{successMessage}</p>}
              {errorMessage && <p className="ticket-message ticket-error">{errorMessage}</p>}

              <button className="ticket-submit-btn" type="submit" disabled={isSubmitting || !loggedUser}>
                {isSubmitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </form>
          </article>

          <article className="ticket-panel ticket-list-panel">
            <div className="ticket-list-head">
              <div>
                <h2>My Tickets</h2>
                <p>{ticketCountLabel}</p>
              </div>
              <button type="button" className="ticket-refresh-btn" onClick={loadTickets}>
                Refresh
              </button>
            </div>

            <div className="ticket-filter-row">
              <label htmlFor="statusFilter">Status</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {!hasEmail && <p className="ticket-note">Please login to view your submitted tickets.</p>}

            {hasEmail && tickets.length === 0 && !isLoading && (
              <p className="ticket-note">No tickets found for this email and status filter.</p>
            )}

            {tickets.length > 0 && (
              <div className="ticket-list">
                {tickets.map((ticket) => (
                  <article key={ticket.id} className="ticket-card">
                    <div className="ticket-card-head">
                      <h3>{ticket.title}</h3>
                      <span className={`ticket-status ticket-status-${ticket.status.toLowerCase()}`}>
                        {toLabel(ticket.status)}
                      </span>
                    </div>

                    <p className="ticket-description">{ticket.description}</p>

                    <div className="ticket-meta-grid">
                      <span>
                        <strong>Category:</strong> {toLabel(ticket.category)}
                      </span>
                      <span>
                        <strong>Priority:</strong> {toLabel(ticket.priority)}
                      </span>
                      <span>
                        <strong>Location:</strong> {ticket.location}
                      </span>
                      <span>
                        <strong>Created:</strong> {formatDateTime(ticket.createdAt)}
                      </span>
                    </div>

                    {ticket.adminComment && (
                      <p className="ticket-admin-comment">
                        <strong>Admin:</strong> {ticket.adminComment}
                      </p>
                    )}

                    {ticket.attachments?.length > 0 && (
                      <div className="ticket-attachments">
                        <strong>Attachments:</strong>
                        <ul>
                          {ticket.attachments.map((attachment, index) => (
                            <li key={`${ticket.id}-${attachment.fileName}-${index}`}>
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
                  </article>
                ))}
              </div>
            )}
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}
