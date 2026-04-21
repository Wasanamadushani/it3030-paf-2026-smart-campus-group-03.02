package com.paf.backend.dto;

public record TicketAttachmentRequest(
        String fileName,
        String contentType,
        Long sizeInBytes,
        String dataBase64
) {
}
