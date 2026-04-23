package com.paf.backend.booking.dto;

public record BookingActionRequest(
        // APPROVED | REJECTED | CANCELLED
        String action,
        // Optional reason (required for REJECTED)
        String reason
) {}
