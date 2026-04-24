package com.paf.backend.repository;

import com.paf.backend.model.Facility;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FacilityRepository extends MongoRepository<Facility, Long> {
}
