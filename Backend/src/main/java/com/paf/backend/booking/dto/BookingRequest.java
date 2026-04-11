package com.paf.backend.booking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BookingRequest(
        @NotBlank(message = "User email is required")
        String userEmail,

        @NotBlank(message = "User name is required")
        String userName,

        @NotNull(message = "Facility ID is required")
        Long facilityId,

        @NotBlank(message = "Facility name is required")
        String facilityName,

        @NotBlank(message = "Start time is required")
        String startTime,

        @NotBlank(message = "End time is required")
        String endTime,

        @NotBlank(message = "Purpose is required")
        String purpose,

        @Min(value = 1, message = "Expected attendees must be at least 1")
        int expectedAttendees
) {}
