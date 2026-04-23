package com.paf.backend.controller;

import com.paf.backend.dto.FacilityRequest;
import com.paf.backend.dto.FacilityResponse;
import com.paf.backend.service.FacilityService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @GetMapping
    public ResponseEntity<?> getFacilities(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status
    ) {
        try {
            List<FacilityResponse> facilities = facilityService.listFacilities(search, type, status);
            return ResponseEntity.ok(facilities);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getFacilitiesSummary() {
        return ResponseEntity.ok(facilityService.getFacilitySummary());
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<?> getFacility(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(facilityService.getFacilityById(id));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createFacility(@Valid @RequestBody FacilityRequest request) {
        try {
            FacilityResponse created = facilityService.createFacility(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<?> updateFacility(@PathVariable Long id, @Valid @RequestBody FacilityRequest request) {
        try {
            return ResponseEntity.ok(facilityService.updateFacility(id, request));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<?> deleteFacility(@PathVariable Long id) {
        try {
            facilityService.deleteFacility(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        }
    }
}
