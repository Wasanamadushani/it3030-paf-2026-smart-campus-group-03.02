package com.paf.backend.service;

import com.paf.backend.dto.TicketAttachmentRequest;
import com.paf.backend.dto.TicketAttachmentResponse;
import com.paf.backend.dto.TicketRequest;
import com.paf.backend.dto.TicketResponse;
import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
public class TicketService {

    private static final int MAX_ATTACHMENT_COUNT = 5;
    private static final long MAX_ATTACHMENT_BYTES = 5L * 1024L * 1024L;
    private static final Pattern REGISTER_NUMBER_PATTERN = Pattern.compile("^IT\\d{8}$");
        private static final Pattern CONTACT_NUMBER_PATTERN = Pattern.compile("^\\d{10}$");

        private static final Map<String, String> FACULTY_NORMALIZATION = Map.of(
            "FACULTY_OF_COMPUTING", "FACULTY_OF_COMPUTING",
            "FACULTY_OF_BUSINESS", "FACULTY_OF_BUSINESS",
            "FACULTY_OF_ARCHITECTURE", "FACULTY_OF_ARCHITECTURE"
        );

    private static final Map<String, String> CATEGORY_NORMALIZATION = Map.of(
            "REGISTRATION", "REGISTRATION",
            "EXAM", "EXAM",
            "EXAMS", "EXAM",
            "RESULT", "RESULTS",
            "RESULTS", "RESULTS",
            "ATTENDANCE", "ATTENDANCE",
            "COURSE_CONTENT", "COURSE_CONTENT",
            "ASSIGNMENT", "ASSIGNMENT",
            "FEE", "FEE",
            "OTHER", "OTHER"
    );

    private static final Map<String, String> PRIORITY_NORMALIZATION = Map.of(
            "LOW", "LOW",
            "MEDIUM", "MEDIUM",
            "HIGH", "HIGH",
            "URGENT", "URGENT"
    );

    private static final Map<String, String> STATUS_NORMALIZATION = Map.of(
            "OPEN", "OPEN",
            "IN_PROGRESS", "IN_PROGRESS",
            "RESOLVED", "RESOLVED",
            "CLOSED", "CLOSED"
    );

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final Map<Long, TicketResponse> tickets = new ConcurrentHashMap<>();
    private final AtomicLong idCounter = new AtomicLong(0);

    @PostConstruct
    public void seedTickets() {
        createTicket(new TicketRequest(
                "System User",
                "system@campus.local",
                "IT23986587",
                "FACULTY_OF_COMPUTING",
                "0771234567",
                "Registration not updated for semester 2",
                "REGISTRATION",
                "MEDIUM",
                "Reg No: 2026CS045",
                "Semester registration still shows pending even after payment.",
                List.of()
        ));
    }

    public TicketResponse createTicket(TicketRequest request) {
        ValidatedTicket validated = validateAndNormalize(request);

        long nextId = idCounter.incrementAndGet();
        TicketResponse created = new TicketResponse(
                nextId,
                validated.reporterName(),
                validated.reporterEmail(),
                validated.registerNumber(),
                validated.faculty(),
                validated.contactNumber(),
                validated.title(),
                validated.category(),
                validated.priority(),
                validated.location(),
                validated.description(),
                "OPEN",
                LocalDateTime.now(),
                null,
                "",
                validated.attachments()
        );

        tickets.put(nextId, created);
        return created;
    }

    public List<TicketResponse> listTickets(String reporterEmail, String status) {
        String normalizedReporterEmail = normalizeFilterValue(reporterEmail).toLowerCase(Locale.ROOT);
        String normalizedStatus = normalizeEnumFilter(status, STATUS_NORMALIZATION, "status");

        return tickets.values().stream()
                .sorted((left, right) -> Long.compare(right.id(), left.id()))
                .filter(ticket -> normalizedReporterEmail.isBlank()
                        || ticket.reporterEmail().equalsIgnoreCase(normalizedReporterEmail))
                .filter(ticket -> normalizedStatus.isBlank() || ticket.status().equals(normalizedStatus))
                .toList();
    }

    public TicketResponse updateTicketStatus(Long id, String status) {
        String normalizedStatus = normalizeRequiredEnum(status, STATUS_NORMALIZATION, "status");
        TicketResponse existing = findExistingTicket(id);

        TicketResponse updated = new TicketResponse(
                existing.id(),
                existing.reporterName(),
                existing.reporterEmail(),
                existing.registerNumber(),
                existing.faculty(),
                existing.contactNumber(),
                existing.title(),
                existing.category(),
                existing.priority(),
                existing.location(),
                existing.description(),
                normalizedStatus,
                existing.createdAt(),
                LocalDateTime.now(),
                existing.adminComment(),
                existing.attachments()
        );

        tickets.put(id, updated);
        return updated;
    }

    public TicketResponse addAdminComment(Long id, String comment) {
        TicketResponse existing = findExistingTicket(id);
        String normalizedComment = normalizeRequiredText(comment, "Comment cannot be empty");

        TicketResponse updated = new TicketResponse(
                existing.id(),
                existing.reporterName(),
                existing.reporterEmail(),
                existing.registerNumber(),
                existing.faculty(),
                existing.contactNumber(),
                existing.title(),
                existing.category(),
                existing.priority(),
                existing.location(),
                existing.description(),
                existing.status(),
                existing.createdAt(),
                LocalDateTime.now(),
                normalizedComment,
                existing.attachments()
        );

        tickets.put(id, updated);
        return updated;
    }

    private TicketResponse findExistingTicket(Long id) {
        TicketResponse ticket = tickets.get(id);
        if (ticket == null) {
            throw new NoSuchElementException("Ticket not found");
        }

        return ticket;
    }

    private ValidatedTicket validateAndNormalize(TicketRequest request) {
        String reporterName = normalizeRequiredText(request.reporterName(), "Reporter name is required");
        String reporterEmail = normalizeRequiredText(request.reporterEmail(), "Reporter email is required")
                .toLowerCase(Locale.ROOT);
        String registerNumber = normalizeRequiredText(request.registerNumber(), "Register number is required")
                .toUpperCase(Locale.ROOT);
        String faculty = normalizeRequiredEnum(request.faculty(), FACULTY_NORMALIZATION, "faculty");
        String contactNumber = normalizeRequiredText(request.contactNumber(), "Contact number is required");

        if (!EMAIL_PATTERN.matcher(reporterEmail).matches()) {
            throw new IllegalArgumentException("Reporter email must be valid");
        }

        if (!REGISTER_NUMBER_PATTERN.matcher(registerNumber).matches()) {
            throw new IllegalArgumentException("Register number must follow IT######## format");
        }

        if (!CONTACT_NUMBER_PATTERN.matcher(contactNumber).matches()) {
            throw new IllegalArgumentException("Contact number must contain exactly 10 digits");
        }

        String title = normalizeRequiredText(request.title(), "Ticket title is required");
        String category = normalizeRequiredEnum(request.category(), CATEGORY_NORMALIZATION, "category");
        String priority = normalizeRequiredEnum(request.priority(), PRIORITY_NORMALIZATION, "priority");
        String location = normalizeRequiredText(request.location(), "Location is required");
        String description = normalizeRequiredText(request.description(), "Description is required");
        List<TicketAttachmentResponse> attachments = normalizeAttachments(request.attachments());

        return new ValidatedTicket(
                reporterName,
                reporterEmail,
                registerNumber,
                faculty,
                contactNumber,
                title,
                category,
                priority,
                location,
                description,
                attachments
        );
    }

    private List<TicketAttachmentResponse> normalizeAttachments(List<TicketAttachmentRequest> attachments) {
        if (attachments == null || attachments.isEmpty()) {
            return List.of();
        }

        if (attachments.size() > MAX_ATTACHMENT_COUNT) {
            throw new IllegalArgumentException("Maximum " + MAX_ATTACHMENT_COUNT + " attachments are allowed");
        }

        return attachments.stream()
                .map(this::normalizeAttachment)
                .toList();
    }

    private TicketAttachmentResponse normalizeAttachment(TicketAttachmentRequest attachment) {
        if (attachment == null) {
            throw new IllegalArgumentException("Attachment is missing");
        }

        String fileName = normalizeRequiredText(attachment.fileName(), "Attachment file name is required");
        String contentType = normalizeFilterValue(attachment.contentType());
        String dataBase64 = normalizeRequiredText(attachment.dataBase64(), "Attachment data is required");

        byte[] decoded;
        try {
            decoded = Base64.getDecoder().decode(dataBase64);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Attachment data is invalid base64");
        }

        if (decoded.length == 0) {
            throw new IllegalArgumentException("Attachment cannot be empty");
        }

        if (decoded.length > MAX_ATTACHMENT_BYTES) {
            throw new IllegalArgumentException("Each attachment must be 5 MB or smaller");
        }

        long normalizedSize = attachment.sizeInBytes() == null || attachment.sizeInBytes() <= 0
                ? decoded.length
                : attachment.sizeInBytes();

        String normalizedContentType = contentType.isBlank() ? "application/octet-stream" : contentType;

        return new TicketAttachmentResponse(
                fileName,
                normalizedContentType,
                normalizedSize,
                dataBase64
        );
    }

    private String normalizeRequiredText(String value, String message) {
        String normalized = normalizeFilterValue(value);
        if (normalized.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        return normalized;
    }

    private String normalizeRequiredEnum(String value, Map<String, String> normalizationMap, String fieldName) {
        String normalized = normalizeEnumFilter(value, normalizationMap, fieldName);
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("Invalid " + fieldName + " value");
        }

        return normalized;
    }

    private String normalizeEnumFilter(String value, Map<String, String> normalizationMap, String fieldName) {
        String normalizedInput = normalizeFilterValue(value)
                .replace('-', '_')
                .replace(' ', '_')
                .toUpperCase(Locale.ROOT);

        if (normalizedInput.isBlank()) {
            return "";
        }

        String normalized = normalizationMap.get(normalizedInput);
        if (normalized == null) {
            throw new IllegalArgumentException("Invalid " + fieldName + " value");
        }

        return normalized;
    }

    private String normalizeFilterValue(String value) {
        return value == null ? "" : value.trim();
    }

    private record ValidatedTicket(
            String reporterName,
            String reporterEmail,
            String registerNumber,
            String faculty,
            String contactNumber,
            String title,
            String category,
            String priority,
            String location,
            String description,
            List<TicketAttachmentResponse> attachments
    ) {
    }
}
