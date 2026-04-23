package com.paf.backend.booking.service;

import com.paf.backend.booking.dto.BookingActionRequest;
import com.paf.backend.booking.dto.BookingRequest;
import com.paf.backend.booking.dto.BookingResponse;
import com.paf.backend.booking.model.Booking;
import com.paf.backend.booking.repository.BookingRepository;
import com.paf.backend.service.SequenceGeneratorService;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    private static final String BOOKING_SEQUENCE = "bookings_sequence";
    private static final DateTimeFormatter DT_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final BookingRepository bookingRepository;
    private final SequenceGeneratorService sequenceGeneratorService;

    public BookingService(BookingRepository bookingRepository,
                          SequenceGeneratorService sequenceGeneratorService) {
        this.bookingRepository = bookingRepository;
        this.sequenceGeneratorService = sequenceGeneratorService;
    }

    // ── CREATE ──────────────────────────────────────────────────────────────

    public BookingResponse createBooking(BookingRequest request) {
        String userEmail = requireNonBlank(request.userEmail(), "User email is required")
                .toLowerCase(Locale.ROOT);
        String userName = requireNonBlank(request.userName(), "User name is required");
        Long facilityId = requireNonNull(request.facilityId(), "Facility ID is required");
        String facilityName = requireNonBlank(request.facilityName(), "Facility name is required");
        String purpose = requireNonBlank(request.purpose(), "Purpose is required");

        if (request.expectedAttendees() < 1) {
            throw new IllegalArgumentException("Expected attendees must be at least 1");
        }

        LocalDateTime startTime = parseDateTime(request.startTime(), "startTime");
        LocalDateTime endTime = parseDateTime(request.endTime(), "endTime");

        validateTimeRange(startTime, endTime);

        List<Booking> conflicts = bookingRepository.findConflictingBookings(facilityId, startTime, endTime);
        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException(
                    "This facility is already booked during the requested time slot");
        }

        long nextId = sequenceGeneratorService.generateSequence(BOOKING_SEQUENCE);
        Booking booking = new Booking();
        booking.setId(nextId);
        booking.setUserEmail(userEmail);
        booking.setUserName(userName);
        booking.setFacilityId(facilityId);
        booking.setFacilityName(facilityName);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setPurpose(purpose);
        booking.setExpectedAttendees(request.expectedAttendees());
        booking.setStatus("PENDING");
        booking.setAdminReason("");
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        return toResponse(bookingRepository.save(booking));
    }

    // ── LIST (user) ──────────────────────────────────────────────────────────

    public List<BookingResponse> getBookingsByUser(String userEmail) {
        String normalized = requireNonBlank(userEmail, "User email is required").toLowerCase(Locale.ROOT);
        return bookingRepository.findByUserEmailIgnoreCase(normalized)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── LIST (admin) ─────────────────────────────────────────────────────────

    public List<BookingResponse> getAllBookings(String status) {
        List<Booking> bookings;
        if (status != null && !status.isBlank()) {
            String normalized = status.trim().toUpperCase(Locale.ROOT);
            bookings = bookingRepository.findByStatus(normalized);
        } else {
            bookings = bookingRepository.findAll();
        }
        return bookings.stream().map(this::toResponse).toList();
    }

    // ── GET ONE ──────────────────────────────────────────────────────────────

    public BookingResponse getBookingById(Long id) {
        return toResponse(findById(id));
    }

    // ── ADMIN ACTION (APPROVE / REJECT) ──────────────────────────────────────

    public BookingResponse processBooking(Long id, BookingActionRequest request) {
        Booking booking = findById(id);
        String action = requireNonBlank(request.action(), "Action is required")
                .toUpperCase(Locale.ROOT);

        switch (action) {
            case "APPROVED" -> {
                if (!"PENDING".equals(booking.getStatus())) {
                    throw new IllegalArgumentException("Only PENDING bookings can be approved");
                }
                // Re-check conflicts (another booking may have been approved in the meantime)
                List<Booking> conflicts = bookingRepository.findConflictingBookingsExcluding(
                        booking.getFacilityId(), booking.getStartTime(), booking.getEndTime(), id);
                if (!conflicts.isEmpty()) {
                    throw new IllegalArgumentException(
                            "Cannot approve: a conflicting booking already exists for this time slot");
                }
                booking.setStatus("APPROVED");
                booking.setAdminReason("");
            }
            case "REJECTED" -> {
                if (!"PENDING".equals(booking.getStatus())) {
                    throw new IllegalArgumentException("Only PENDING bookings can be rejected");
                }
                String reason = requireNonBlank(request.reason(), "Reason is required for rejection");
                booking.setStatus("REJECTED");
                booking.setAdminReason(reason);
            }
            default -> throw new IllegalArgumentException("Invalid action. Use APPROVED or REJECTED");
        }

        booking.setUpdatedAt(LocalDateTime.now());
        return toResponse(bookingRepository.save(booking));
    }

    // ── USER CANCEL ──────────────────────────────────────────────────────────

    public BookingResponse cancelBooking(Long id, String userEmail) {
        Booking booking = findById(id);
        String normalized = requireNonBlank(userEmail, "User email is required").toLowerCase(Locale.ROOT);

        if (!booking.getUserEmail().equalsIgnoreCase(normalized)) {
            throw new IllegalArgumentException("You can only cancel your own bookings");
        }

        if (!"PENDING".equals(booking.getStatus()) && !"APPROVED".equals(booking.getStatus())) {
            throw new IllegalArgumentException("Only PENDING or APPROVED bookings can be cancelled");
        }

        booking.setStatus("CANCELLED");
        booking.setUpdatedAt(LocalDateTime.now());
        return toResponse(bookingRepository.save(booking));
    }

    // ── TIMELINE: bookings for a facility on a given date ────────────────────

    public List<BookingResponse> getTimelineForDay(Long facilityId, String date) {
        if (facilityId == null) throw new IllegalArgumentException("Facility ID is required");
        LocalDateTime dayStart;
        try {
            dayStart = java.time.LocalDate.parse(date).atStartOfDay();
        } catch (Exception ex) {
            throw new IllegalArgumentException("Date must be in yyyy-MM-dd format");
        }
        LocalDateTime dayEnd = dayStart.plusDays(1);
        return bookingRepository.findByFacilityIdAndDay(facilityId, dayStart, dayEnd)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── DELETE (admin hard delete) ────────────────────────────────────────────

    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new NoSuchElementException("Booking not found");
        }
        bookingRepository.deleteById(id);
    }

    // ── HELPERS ──────────────────────────────────────────────────────────────

    private Booking findById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));
    }

    private BookingResponse toResponse(Booking b) {
        return new BookingResponse(
                b.getId(),
                b.getUserEmail(),
                b.getUserName(),
                b.getFacilityId(),
                b.getFacilityName(),
                b.getStartTime(),
                b.getEndTime(),
                b.getPurpose(),
                b.getExpectedAttendees(),
                b.getStatus(),
                b.getAdminReason(),
                b.getCreatedAt(),
                b.getUpdatedAt()
        );
    }

    private LocalDateTime parseDateTime(String value, String fieldName) {
        try {
            return LocalDateTime.parse(requireNonBlank(value, fieldName + " is required"), DT_FORMATTER);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException(fieldName + " must be in ISO format (yyyy-MM-ddTHH:mm:ss)");
        }
    }

    private void validateTimeRange(LocalDateTime start, LocalDateTime end) {
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        if (start.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start time cannot be in the past");
        }
    }

    private String requireNonBlank(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private <T> T requireNonNull(T value, String message) {
        if (value == null) {
            throw new IllegalArgumentException(message);
        }
        return value;
    }
}
