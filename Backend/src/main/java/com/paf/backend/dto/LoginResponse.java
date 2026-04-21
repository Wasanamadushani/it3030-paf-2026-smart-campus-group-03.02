package com.paf.backend.dto;

public record LoginResponse(
        String email,
        String fullName,
        String role,
        String message
) {
}
