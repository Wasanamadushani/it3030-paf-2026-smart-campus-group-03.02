package com.paf.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FacilityRequest(
        @NotBlank(message = "Name is required")
        String name,
        @NotBlank(message = "Type is required")
        String type,
        @NotBlank(message = "Status is required")
        String status,
        @NotBlank(message = "Building is required")
        String building,
        @NotNull(message = "Floor is required")
        @Min(value = 1, message = "Floor must be greater than 0")
        Integer floor,
        String block,
        String location,
        @NotNull(message = "Capacity is required")
        @Min(value = 1, message = "Capacity must be greater than 0")
        Integer capacity
) {
}
