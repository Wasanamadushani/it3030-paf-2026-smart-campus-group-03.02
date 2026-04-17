package com.paf.backend.service;

import com.paf.backend.dto.TicketDTO;
import com.paf.backend.entity.Ticket;
import com.paf.backend.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TicketService {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    // Create a new ticket
    public TicketDTO createTicket(TicketDTO ticketDTO) {
        Ticket ticket = new Ticket();
        ticket.setStudentId(ticketDTO.getStudentId());
        ticket.setTitle(ticketDTO.getTitle());
        ticket.setDescription(ticketDTO.getDescription());
        ticket.setCategory(Ticket.Category.valueOf(ticketDTO.getCategory()));
        ticket.setPriority(Ticket.Priority.valueOf(ticketDTO.getPriority()));
        ticket.setStatus(Ticket.Status.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        
        Ticket savedTicket = ticketRepository.save(ticket);
        return new TicketDTO(savedTicket);
    }
    
    // Get all tickets for a student
    public List<TicketDTO> getStudentTickets(String studentId) {
        List<Ticket> tickets = ticketRepository.findByStudentId(studentId);
        return tickets.stream().map(TicketDTO::new).collect(Collectors.toList());
    }
    
    // Get a specific ticket
    public Optional<TicketDTO> getTicketById(Long id) {
        Optional<Ticket> ticket = ticketRepository.findById(id);
        return ticket.map(TicketDTO::new);
    }
    
    // Get all tickets by status
    public List<TicketDTO> getTicketsByStatus(String status) {
        List<Ticket> tickets = ticketRepository.findByStatus(Ticket.Status.valueOf(status));
        return tickets.stream().map(TicketDTO::new).collect(Collectors.toList());
    }
    
    // Get all tickets
    public List<TicketDTO> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAll();
        return tickets.stream().map(TicketDTO::new).collect(Collectors.toList());
    }
    
    // Update ticket status
    public TicketDTO updateTicketStatus(Long id, String status) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();
            ticket.setStatus(Ticket.Status.valueOf(status));
            ticket.setUpdatedAt(LocalDateTime.now());
            Ticket updatedTicket = ticketRepository.save(ticket);
            return new TicketDTO(updatedTicket);
        }
        return null;
    }
    
    // Add admin comments to ticket
    public TicketDTO addAdminComments(Long id, String comments) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(id);
        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();
            ticket.setAdminComments(comments);
            ticket.setUpdatedAt(LocalDateTime.now());
            Ticket updatedTicket = ticketRepository.save(ticket);
            return new TicketDTO(updatedTicket);
        }
        return null;
    }
    
    // Delete ticket
    public boolean deleteTicket(Long id) {
        if (ticketRepository.existsById(id)) {
            ticketRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
