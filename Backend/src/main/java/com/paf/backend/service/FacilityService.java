package com.paf.backend.service;

import com.paf.backend.dto.FacilityRequest;
import com.paf.backend.dto.FacilityResponse;
import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class FacilityService {

    private static final Map<String, String> TYPE_NORMALIZATION = Map.of(
            "ROOM", "Room",
            "LAB", "Lab",
            "LECTURE HALL", "Lecture Hall",
            "EQUIPMENT", "Equipment"
    );

    private static final Map<String, String> BUILDING_NORMALIZATION = Map.of(
            "MAIN", "Main",
            "NEW", "New",
            "ENGINEERING", "Engineering",
            "BUSINESS", "Business"
    );

    private static final Map<String, String> STATUS_NORMALIZATION = Map.of(
            "ACTIVE", "ACTIVE",
            "OUT_OF_SERVICE", "OUT_OF_SERVICE"
    );

    private final Map<Long, FacilityResponse> facilities = new ConcurrentHashMap<>();
    private final AtomicLong idCounter = new AtomicLong(0);

    @PostConstruct
    public void seedFacilities() {
        createFacility(new FacilityRequest(
                "Lecture Hall A1",
                "Lecture Hall",
                "ACTIVE",
                "Main",
                1,
                "",
                "Main Building - Floor 1",
                220
        ));

        createFacility(new FacilityRequest(
                "Advanced Networking Lab",
                "Lab",
                "ACTIVE",
                "Engineering",
                3,
                "",
                "Engineering Building - Floor 3",
                40
        ));

        createFacility(new FacilityRequest(
                "Portable PA System",
                "Equipment",
                "OUT_OF_SERVICE",
                "Business",
                1,
                "",
                "Business Building - Floor 1",
                1
        ));
    }

    public List<FacilityResponse> listFacilities(String search, String type, String status) {
        String normalizedSearch = normalizeFilterValue(search).toLowerCase(Locale.ROOT);
        String normalizedTypeFilter = normalizeEnumFilter(type, TYPE_NORMALIZATION, "type");
        String normalizedStatusFilter = normalizeEnumFilter(status, STATUS_NORMALIZATION, "status");

        return facilities.values().stream()
                .sorted((left, right) -> Long.compare(left.id(), right.id()))
                .filter(facility -> normalizedSearch.isBlank() || matchesSearch(facility, normalizedSearch))
                .filter(facility -> normalizedTypeFilter.isBlank() || facility.type().equals(normalizedTypeFilter))
                .filter(facility -> normalizedStatusFilter.isBlank() || facility.status().equals(normalizedStatusFilter))
                .toList();
    }

    public FacilityResponse getFacilityById(Long id) {
        FacilityResponse facility = facilities.get(id);
        if (facility == null) {
            throw new NoSuchElementException("Facility not found");
        }

        return facility;
    }

    public FacilityResponse createFacility(FacilityRequest request) {
        ValidatedFacility validated = validateAndNormalize(request);

        long nextId = idCounter.incrementAndGet();
        FacilityResponse created = new FacilityResponse(
                nextId,
                validated.name(),
                validated.type(),
                validated.building(),
                validated.floor(),
                validated.block(),
                validated.location(),
                validated.capacity(),
                validated.status()
        );

        facilities.put(nextId, created);
        return created;
    }

    public FacilityResponse updateFacility(Long id, FacilityRequest request) {
        if (!facilities.containsKey(id)) {
            throw new NoSuchElementException("Facility not found");
        }

        ValidatedFacility validated = validateAndNormalize(request);
        FacilityResponse updated = new FacilityResponse(
                id,
                validated.name(),
                validated.type(),
                validated.building(),
                validated.floor(),
                validated.block(),
                validated.location(),
                validated.capacity(),
                validated.status()
        );

        facilities.put(id, updated);
        return updated;
    }

    public void deleteFacility(Long id) {
        if (facilities.remove(id) == null) {
            throw new NoSuchElementException("Facility not found");
        }
    }

    public Map<String, Object> getFacilitySummary() {
        List<FacilityResponse> allFacilities = new ArrayList<>(facilities.values());
        int totalFacilities = allFacilities.size();
        int activeFacilities = (int) allFacilities.stream()
                .filter(facility -> "ACTIVE".equals(facility.status()))
                .count();

        Map<String, Long> facilitiesByType = allFacilities.stream()
                .collect(LinkedHashMap::new,
                        (map, facility) -> map.merge(facility.type(), 1L, Long::sum),
                        Map::putAll);

        return Map.of(
                "totalFacilities", totalFacilities,
                "activeFacilities", activeFacilities,
                "outOfServiceFacilities", totalFacilities - activeFacilities,
                "facilitiesByType", facilitiesByType
        );
    }

    private boolean matchesSearch(FacilityResponse facility, String normalizedSearch) {
        return facility.name().toLowerCase(Locale.ROOT).contains(normalizedSearch)
                || facility.location().toLowerCase(Locale.ROOT).contains(normalizedSearch);
    }

    private ValidatedFacility validateAndNormalize(FacilityRequest request) {
        String normalizedName = normalizeRequiredText(request.name(), "Name is required");
        String normalizedType = normalizeRequiredEnum(request.type(), TYPE_NORMALIZATION, "type");
        String normalizedStatus = normalizeRequiredEnum(request.status(), STATUS_NORMALIZATION, "status");
        String normalizedBuilding = normalizeRequiredEnum(request.building(), BUILDING_NORMALIZATION, "building");

        int normalizedFloor = request.floor();
        int normalizedCapacity = request.capacity();
        String normalizedBlock = normalizeOptionalText(request.block());

        if ("New".equals(normalizedBuilding) && normalizedBlock.isBlank()) {
            throw new IllegalArgumentException("Block is required for New building");
        }

        if (!"New".equals(normalizedBuilding)) {
            normalizedBlock = "";
        }

        if ("Lab".equals(normalizedType) && normalizedCapacity > 40) {
            throw new IllegalArgumentException("Lab capacity cannot exceed 40");
        }

        if ("Lecture Hall".equals(normalizedType) && normalizedCapacity > 500) {
            throw new IllegalArgumentException("Lecture Hall capacity cannot exceed 500");
        }

        String normalizedLocation = buildLocation(normalizedBuilding, normalizedFloor, normalizedBlock);

        return new ValidatedFacility(
                normalizedName,
                normalizedType,
                normalizedStatus,
                normalizedBuilding,
                normalizedFloor,
                normalizedBlock,
                normalizedLocation,
                normalizedCapacity
        );
    }

    private String normalizeRequiredText(String value, String errorMessage) {
        String normalized = normalizeFilterValue(value);
        if (normalized.isBlank()) {
            throw new IllegalArgumentException(errorMessage);
        }

        return normalized;
    }

    private String normalizeOptionalText(String value) {
        return normalizeFilterValue(value);
    }

    private String normalizeRequiredEnum(String value, Map<String, String> normalizationMap, String fieldName) {
        String normalized = normalizeEnumFilter(value, normalizationMap, fieldName);
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("Invalid " + fieldName + " value");
        }

        return normalized;
    }

    private String normalizeEnumFilter(String value, Map<String, String> normalizationMap, String fieldName) {
        String normalizedInput = normalizeFilterValue(value);
        if (normalizedInput.isBlank()) {
            return "";
        }

        String normalized = normalizationMap.get(normalizedInput.toUpperCase(Locale.ROOT));
        if (normalized == null) {
            throw new IllegalArgumentException("Invalid " + fieldName + " value");
        }

        return normalized;
    }

    private String normalizeFilterValue(String value) {
        return value == null ? "" : value.trim();
    }

    private String buildLocation(String building, int floor, String block) {
        List<String> parts = new ArrayList<>();
        parts.add(building + " Building");
        parts.add("Floor " + floor);
        if ("New".equals(building) && !block.isBlank()) {
            parts.add(block);
        }

        return String.join(" - ", parts);
    }

    private record ValidatedFacility(
            String name,
            String type,
            String status,
            String building,
            int floor,
            String block,
            String location,
            int capacity
    ) {
    }
}
