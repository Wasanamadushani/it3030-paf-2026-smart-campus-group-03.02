package com.paf.backend.controller;

import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary() {
        return ResponseEntity.ok(Map.of(
                "role", "ADMIN",
                "metrics", Map.of(
                        "todaysBookings", 48,
                        "openIncidents", 12,
                        "approvalsPending", 6
                ),
                "notifications", List.of(
                        "Lab booking approved",
                        "Ticket #352 updated",
                        "Maintenance completed"
                )
        ));
    }
}
