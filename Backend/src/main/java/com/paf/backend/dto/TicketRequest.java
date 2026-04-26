package com.paf.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.util.List;

/**
 * Data Transfer Object for Ticket creation and update requests.
 * Contains validation rules for all ticket fields.
 */
public record TicketRequest(
        // Reporter Information Validation
        @NotBlank(message = "Reporter name is required")  // Ensures name is not null, empty, or whitespace
        String reporterName,

        @NotBlank(message = "Reporter email is required")  // Ensures email is provided
        @Email(message = "Reporter email must be valid")   // Validates email format (e.g., user@example.com)
        String reporterEmail,

        // Student Information Validation
        @NotBlank(message = "Register number is required")  // Ensures register number is provided
        @Pattern(regexp = "^IT\\d{8}$", message = "Register number must follow IT######## format")  // Format: IT12345678
        String registerNumber,

        @NotBlank(message = "Faculty is required")  // Ensures faculty is selected
        String faculty,

        @NotBlank(message = "Contact number is required")  // Ensures contact number is provided
        @Pattern(regexp = "^\\d{10}$", message = "Contact number must contain exactly 10 digits")  // Format: 10 digits only
        String contactNumber,

        // Ticket Details Validation
        @NotBlank(message = "Ticket title is required")  // Ensures ticket has a title
        String title,

        @NotBlank(message = "Ticket category is required")  // Ensures category is selected
        String category,

        @NotBlank(message = "Ticket priority is required")  // Ensures priority level is set
        String priority,

        // Course Information Validation
        @NotBlank(message = "Course code is required")  // Ensures course code is provided
        @Pattern(regexp = "^IT\\d{4}$", message = "Course code must follow IT#### format")  // Format: IT1234
        String courseCode,

        @NotBlank(message = "Year is required")  // Ensures academic year is selected
        String year,

        @NotBlank(message = "Semester is required")  // Ensures semester is selected
        String semester,

        // Description Validation
        @NotBlank(message = "Description is required")  // Ensures ticket has a description
        String description,

        // Attachments (Optional - no validation, can be null or empty)
        List<TicketAttachmentRequest> attachments
) {
}
