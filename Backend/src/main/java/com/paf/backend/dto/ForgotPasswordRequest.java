package com.paf.backend.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ForgotPasswordRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email")
        String email,
        @Size(min = 6, max = 6, message = "Verification code must be 6 digits")
        String verificationCode,
        String resetToken,
        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "New password must be at least 6 characters")
        String newPassword,
        @NotBlank(message = "Confirm password is required")
        String confirmPassword
) {
    @AssertTrue(message = "Passwords do not match")
    public boolean isPasswordsMatching() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }

    @AssertTrue(message = "Verification code or reset token is required")
    public boolean hasVerificationCodeOrToken() {
        return (verificationCode != null && !verificationCode.trim().isEmpty())
                || (resetToken != null && !resetToken.trim().isEmpty());
    }
}
