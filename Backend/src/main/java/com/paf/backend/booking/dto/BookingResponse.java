package com.paf.backend.booking.dto;

import java.time.LocalDateTime;

public record BookingResponse(
        Long id,
        String userEmail,
        String userName,
        Long facilityId,
        String facilityName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String purpose,
        int expectedAttendees,
        String status,
        String adminReason,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
