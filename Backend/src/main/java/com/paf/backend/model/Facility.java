package com.paf.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "facilities")
public class Facility {

    @Transient
    public static final String SEQUENCE_NAME = "facilities_sequence";

    @Id
    private Long id;
    private String name;
    private String type;
    private String building;
    private Integer floor;
    private String block;
    private String location;
    private Integer capacity;
    private String status;

    public Facility() {
    }

    public Facility(Long id, String name, String type, String building, Integer floor, String block, String location, Integer capacity, String status) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.building = building;
        this.floor = floor;
        this.block = block;
        this.location = location;
        this.capacity = capacity;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public Integer getFloor() {
        return floor;
    }

    public void setFloor(Integer floor) {
        this.floor = floor;
    }

    public String getBlock() {
        return block;
    }

    public void setBlock(String block) {
        this.block = block;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
