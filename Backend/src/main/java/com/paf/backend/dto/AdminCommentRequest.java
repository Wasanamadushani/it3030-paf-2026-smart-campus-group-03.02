package com.paf.backend.dto;

import java.util.List;

public record AdminCommentRequest(
        String comment,
        List<TicketAttachmentRequest> attachments
) {
}