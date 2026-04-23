package com.paf.backend.dto;

public record TicketAttachmentResponse(
        String fileName,
        String contentType,
        Long sizeInBytes,
        String dataBase64,
        String uploadedBy
) {
}
