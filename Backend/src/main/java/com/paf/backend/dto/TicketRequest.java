package com.paf.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.util.List;

public record TicketRequest(
        @NotBlank(message = "Reporter name is required")
        String reporterName,
        @NotBlank(message = "Reporter email is required")
        @Email(message = "Reporter email must be valid")
        String reporterEmail,
        @NotBlank(message = "Register number is required")
        @Pattern(regexp = "^IT\\d{8}$", message = "Register number must follow IT######## format")
        String registerNumber,
        @NotBlank(message = "Ticket title is required")
        String title,
        @NotBlank(message = "Ticket category is required")
        String category,
        @NotBlank(message = "Ticket priority is required")
        String priority,
        @NotBlank(message = "Location is required")
        String location,
        @NotBlank(message = "Description is required")
        String description,
        List<TicketAttachmentRequest> attachments
) {
}
