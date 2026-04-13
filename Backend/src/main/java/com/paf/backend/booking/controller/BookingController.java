package com.paf.backend.booking.controller;

import com.paf.backend.booking.dto.BookingActionRequest;
import com.paf.backend.booking.dto.BookingRequest;
import com.paf.backend.booking.dto.BookingResponse;
import com.paf.backend.booking.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Member 2 – Booking Management REST Controller
 *
 * Endpoints:
 *   POST   /api/bookings                        – create booking request
 *   GET    /api/bookings?userEmail=&status=     – list bookings (admin: all, user: by email)
 *   GET    /api/bookings/{id}                   – get single booking
 *   PATCH  /api/bookings/{id}/action            – admin approve / reject
 *   PATCH  /api/bookings/{id}/cancel            – user cancel
 *   DELETE /api/bookings/{id}                   – admin hard delete
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // GET /api/bookings/timeline?facilityId=1&date=2026-04-25
    @GetMapping("/timeline")
    public ResponseEntity<?> getTimeline(
            @RequestParam Long facilityId,
            @RequestParam String date
    ) {
        try {
            return ResponseEntity.ok(bookingService.getTimelineForDay(facilityId, date));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // POST /api/bookings
    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest request) {
        try {
            BookingResponse created = bookingService.createBooking(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // GET /api/bookings?userEmail=xxx&status=yyy
    @GetMapping
    public ResponseEntity<?> listBookings(
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) String status
    ) {
        try {
            List<BookingResponse> bookings;
            if (userEmail != null && !userEmail.isBlank()) {
                bookings = bookingService.getBookingsByUser(userEmail);
            } else {
                bookings = bookingService.getAllBookings(status);
            }
            return ResponseEntity.ok(bookings);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // GET /api/bookings/{id}
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<?> getBooking(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(bookingService.getBookingById(id));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        }
    }

    // PATCH /api/bookings/{id}/action  (admin: APPROVED or REJECTED)
    @PatchMapping("/{id:\\d+}/action")
    public ResponseEntity<?> processBooking(
            @PathVariable Long id,
            @RequestBody BookingActionRequest request
    ) {
        try {
            return ResponseEntity.ok(bookingService.processBooking(id, request));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // PATCH /api/bookings/{id}/cancel?userEmail=xxx  (user cancel)
    @PatchMapping("/{id:\\d+}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id,
            @RequestParam String userEmail
    ) {
        try {
            return ResponseEntity.ok(bookingService.cancelBooking(id, userEmail));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    // DELETE /api/bookings/{id}  (admin hard delete)
    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        }
    }
}
