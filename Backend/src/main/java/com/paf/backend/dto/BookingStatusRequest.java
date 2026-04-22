package com.paf.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record BookingStatusRequest(
    @NotBlank(message = "Status is required")
    String status,

    String adminNote
) {}
