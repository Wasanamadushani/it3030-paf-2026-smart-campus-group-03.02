package com.paf.backend.controller;

import com.paf.backend.dto.LoginRequest;
import com.paf.backend.dto.LoginResponse;
import com.paf.backend.dto.RegisterRequest;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final Map<String, UserAccount> users = new ConcurrentHashMap<>();

    @Value("${app.auth.email}")
    private String configuredEmail;

    @Value("${app.auth.password}")
    private String configuredPassword;

    @Value("${app.auth.name}")
    private String configuredName;

    @Value("${app.auth.role}")
    private String configuredRole;

    @PostConstruct
    public void initDefaultUser() {
        users.put(normalizeEmail(configuredEmail),
                new UserAccount(configuredEmail, configuredPassword, configuredName, configuredRole));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        UserAccount account = users.get(normalizeEmail(request.email()));
        boolean isAuthorized = account != null && account.password().equals(request.password());

        if (!isAuthorized) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        return ResponseEntity.ok(new LoginResponse(
                account.email(),
                account.fullName(),
                account.role(),
                "Login successful"
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (users.containsKey(normalizedEmail)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "This email is already registered"));
        }

        UserAccount account = new UserAccount(
                request.email().trim(),
                request.password(),
                request.fullName().trim(),
                "USER"
        );
        users.put(normalizedEmail, account);

        return ResponseEntity.status(HttpStatus.CREATED).body(new LoginResponse(
                account.email(),
                account.fullName(),
                account.role(),
                "Registration successful"
        ));
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private record UserAccount(String email, String password, String fullName, String role) {
    }
}
