package com.paf.backend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

public record BookingRequest(
    @NotBlank(message = "Resource name is required")
    String resourceName,

    @NotBlank(message = "Resource type is required")
    String resourceType,

    @NotBlank(message = "Location is required")
    String location,

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Date must be today or in the future")
    LocalDate date,

    @NotNull(message = "Start time is required")
    LocalTime startTime,

    @NotNull(message = "End time is required")
    LocalTime endTime,

    @NotBlank(message = "Purpose is required")
    @Size(max = 300, message = "Purpose must be under 300 characters")
    String purpose,

    @Min(value = 1, message = "At least 1 attendee required")
    int attendees,

    @NotBlank(message = "User email is required")
    @Email(message = "Invalid email format")
    String userEmail,

    @NotBlank(message = "User name is required")
    String userName
) {}
