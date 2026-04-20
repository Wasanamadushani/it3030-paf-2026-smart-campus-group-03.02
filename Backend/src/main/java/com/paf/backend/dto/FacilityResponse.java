package com.paf.backend.dto;

public record FacilityResponse(
        Long id,
        String name,
        String type,
        String building,
        Integer floor,
        String block,
        String location,
        Integer capacity,
        String status
) {
}
