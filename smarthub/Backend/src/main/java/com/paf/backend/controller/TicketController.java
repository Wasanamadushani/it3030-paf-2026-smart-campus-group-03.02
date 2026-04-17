package com.paf.backend.controller;

import com.paf.backend.dto.TicketDTO;
import com.paf.backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {
    
    @Autowired
    private TicketService ticketService;
    
    // Create a new ticket
    @PostMapping
    public ResponseEntity<TicketDTO> createTicket(@RequestBody TicketDTO ticketDTO) {
        TicketDTO createdTicket = ticketService.createTicket(ticketDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTicket);
    }
    
    // Get all tickets for a student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<TicketDTO>> getStudentTickets(@PathVariable String studentId) {
        List<TicketDTO> tickets = ticketService.getStudentTickets(studentId);
        return ResponseEntity.ok(tickets);
    }
    
    // Get a specific ticket
    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> getTicketById(@PathVariable Long id) {
        Optional<TicketDTO> ticket = ticketService.getTicketById(id);
        return ticket.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // Get all tickets (admin view)
    @GetMapping
    public ResponseEntity<List<TicketDTO>> getAllTickets() {
        List<TicketDTO> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }
    
    // Get tickets by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TicketDTO>> getTicketsByStatus(@PathVariable String status) {
        List<TicketDTO> tickets = ticketService.getTicketsByStatus(status);
        return ResponseEntity.ok(tickets);
    }
    
    // Update ticket status
    @PutMapping("/{id}/status")
    public ResponseEntity<TicketDTO> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        TicketDTO updatedTicket = ticketService.updateTicketStatus(id, status);
        if (updatedTicket != null) {
            return ResponseEntity.ok(updatedTicket);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Add admin comments
    @PutMapping("/{id}/comments")
    public ResponseEntity<TicketDTO> addAdminComments(
            @PathVariable Long id,
            @RequestParam String comments) {
        TicketDTO updatedTicket = ticketService.addAdminComments(id, comments);
        if (updatedTicket != null) {
            return ResponseEntity.ok(updatedTicket);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Delete ticket
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        if (ticketService.deleteTicket(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
