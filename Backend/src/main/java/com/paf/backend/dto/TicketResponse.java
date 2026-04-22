package com.paf.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tickets")
public record TicketResponse(
        @Id
        Long id,
        String reporterName,
        String reporterEmail,
        String registerNumber,
        String faculty,
        String contactNumber,
        String title,
        String category,
        String priority,
        String courseCode,
        String year,
        String semester,
        String description,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String adminComment,
        List<TicketAttachmentResponse> attachments
) {
}
