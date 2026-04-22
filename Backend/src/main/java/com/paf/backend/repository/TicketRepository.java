package com.paf.backend.repository;

import com.paf.backend.dto.TicketResponse;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketRepository extends MongoRepository<TicketResponse, Long> {
}