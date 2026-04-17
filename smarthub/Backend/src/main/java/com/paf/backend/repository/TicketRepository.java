package com.paf.backend.repository;

import com.paf.backend.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByStudentId(String studentId);
    List<Ticket> findByStatus(Ticket.Status status);
    List<Ticket> findByCategory(Ticket.Category category);
    List<Ticket> findByPriority(Ticket.Priority priority);
}
