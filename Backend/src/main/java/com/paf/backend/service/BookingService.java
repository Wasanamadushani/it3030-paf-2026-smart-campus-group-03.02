package com.paf.backend.service;

import com.paf.backend.dto.BookingRequest;
import com.paf.backend.dto.BookingStatusRequest;
import com.paf.backend.model.Booking;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final Map<String, Booking> store = new ConcurrentHashMap<>();
    private final AtomicLong counter = new AtomicLong(1);

    public Booking create(BookingRequest req) {
        // Conflict check: same resource, same date, overlapping time
        boolean conflict = store.values().stream()
            .filter(b -> b.getResourceName().equalsIgnoreCase(req.resourceName()))
            .filter(b -> b.getDate().equals(req.date()))
            .filter(b -> b.getStatus() == Booking.Status.PENDING || b.getStatus() == Booking.Status.APPROVED)
            .anyMatch(b -> req.startTime().isBefore(b.getEndTime()) && req.endTime().isAfter(b.getStartTime()));

        if (conflict) {
            throw new IllegalStateException("This resource is already booked for the selected time slot.");
        }

        if (!req.endTime().isAfter(req.startTime())) {
            throw new IllegalArgumentException("End time must be after start time.");
        }

        String id = "BK-" + counter.getAndIncrement();
        Booking booking = new Booking(id, req.resourceName(), req.resourceType(),
            req.location(), req.date(), req.startTime(), req.endTime(),
            req.purpose(), req.attendees(), req.userEmail(), req.userName());
        store.put(id, booking);
        return booking;
    }

    public List<Booking> getAll(String status, String userEmail) {
        return store.values().stream()
            .filter(b -> status == null || b.getStatus().name().equalsIgnoreCase(status))
            .filter(b -> userEmail == null || b.getUserEmail().equalsIgnoreCase(userEmail))
            .sorted(Comparator.comparing(Booking::getDate).thenComparing(Booking::getStartTime))
            .collect(Collectors.toList());
    }

    public Booking getById(String id) {
        Booking b = store.get(id);
        if (b == null) throw new NoSuchElementException("Booking not found: " + id);
        return b;
    }

    public Booking updateStatus(String id, BookingStatusRequest req) {
        Booking booking = getById(id);
        Booking.Status newStatus;
        try {
            newStatus = Booking.Status.valueOf(req.status().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + req.status());
        }

        // Workflow rules
        if (booking.getStatus() == Booking.Status.CANCELLED || booking.getStatus() == Booking.Status.REJECTED) {
            throw new IllegalStateException("Cannot change status of a " + booking.getStatus() + " booking.");
        }
        if (newStatus == Booking.Status.PENDING) {
            throw new IllegalArgumentException("Cannot revert booking to PENDING.");
        }

        booking.setStatus(newStatus);
        if (req.adminNote() != null && !req.adminNote().isBlank()) {
            booking.setAdminNote(req.adminNote());
        }
        return booking;
    }

    public void cancel(String id, String userEmail) {
        Booking booking = getById(id);
        if (!booking.getUserEmail().equalsIgnoreCase(userEmail)) {
            throw new IllegalStateException("You can only cancel your own bookings.");
        }
        if (booking.getStatus() != Booking.Status.APPROVED && booking.getStatus() != Booking.Status.PENDING) {
            throw new IllegalStateException("Only PENDING or APPROVED bookings can be cancelled.");
        }
        booking.setStatus(Booking.Status.CANCELLED);
    }

    public void delete(String id) {
        if (!store.containsKey(id)) throw new NoSuchElementException("Booking not found: " + id);
        store.remove(id);
    }
}
