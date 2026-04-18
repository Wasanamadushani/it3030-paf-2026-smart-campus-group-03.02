package com.paf.backend.dto;

import com.paf.backend.entity.Ticket;
import java.time.LocalDateTime;

public class TicketDTO {
    private String id;
    private String studentId;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String adminComments;
    
    // Constructors
    public TicketDTO() {}
    
    public TicketDTO(Ticket ticket) {
        this.id = ticket.getId();
        this.studentId = ticket.getStudentId();
        this.title = ticket.getTitle();
        this.description = ticket.getDescription();
        this.category = ticket.getCategory().toString();
        this.priority = ticket.getPriority().toString();
        this.status = ticket.getStatus().toString();
        this.createdAt = ticket.getCreatedAt();
        this.updatedAt = ticket.getUpdatedAt();
        this.adminComments = ticket.getAdminComments();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getStudentId() {
        return studentId;
    }
    
    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getPriority() {
        return priority;
    }
    
    public void setPriority(String priority) {
        this.priority = priority;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getAdminComments() {
        return adminComments;
    }
    
    public void setAdminComments(String adminComments) {
        this.adminComments = adminComments;
    }
}
