package com.paf.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record TicketResponse(
        Long id,
        String reporterName,
        String reporterEmail,
        String title,
        String category,
        String priority,
        String location,
        String description,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String adminComment,
        List<TicketAttachmentResponse> attachments
) {
}
