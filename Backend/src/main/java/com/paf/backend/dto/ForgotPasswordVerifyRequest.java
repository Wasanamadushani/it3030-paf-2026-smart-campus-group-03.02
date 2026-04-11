package com.paf.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ForgotPasswordVerifyRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email")
        String email,
        @NotBlank(message = "Verification code is required")
        @Size(min = 6, max = 6, message = "Verification code must be 6 digits")
        String verificationCode
) {
}
