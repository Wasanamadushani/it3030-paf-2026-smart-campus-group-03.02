package com.paf.backend.controller;

import com.paf.backend.dto.ForgotPasswordCodeRequest;
import com.paf.backend.dto.ForgotPasswordRequest;
import com.paf.backend.dto.ForgotPasswordVerifyRequest;
import com.paf.backend.dto.LoginRequest;
import com.paf.backend.dto.LoginResponse;
import com.paf.backend.dto.RegisterRequest;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private static final long RESET_CODE_TTL_MS = 5 * 60 * 1000;

    private final JavaMailSender mailSender;
    private final Map<String, UserAccount> users = new ConcurrentHashMap<>();
    private final Map<String, String> passwordResetCodes = new ConcurrentHashMap<>();
    private final Map<String, Long> passwordResetExpiry = new ConcurrentHashMap<>();
    private final Map<String, String> passwordResetTokens = new ConcurrentHashMap<>();
    private final Map<String, Long> passwordResetTokenExpiry = new ConcurrentHashMap<>();

    public AuthController(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Value("${app.auth.email}")
    private String configuredEmail;

    @Value("${app.auth.password}")
    private String configuredPassword;

    @Value("${app.auth.name}")
    private String configuredName;

    @Value("${app.auth.role}")
    private String configuredRole;

    @Value("${app.mail.from}")
    private String fromEmail;

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

    @PostMapping("/forgot-password/send-code")
    public ResponseEntity<?> sendForgotPasswordCode(@Valid @RequestBody ForgotPasswordCodeRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        UserAccount account = users.get(normalizedEmail);

        if (account == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No account found for this email"));
        }

        String verificationCode = generateVerificationCode();
        passwordResetCodes.put(normalizedEmail, verificationCode);
        passwordResetExpiry.put(normalizedEmail, System.currentTimeMillis() + RESET_CODE_TTL_MS);
        passwordResetTokens.remove(normalizedEmail);
        passwordResetTokenExpiry.remove(normalizedEmail);

        try {
            sendResetCodeEmail(account, verificationCode);
        } catch (Exception exception) {
            logger.error("Failed to send reset code email to {}", account.email(), exception);
            passwordResetCodes.remove(normalizedEmail);
            passwordResetExpiry.remove(normalizedEmail);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to send reset code email"));
        }

        return ResponseEntity.ok(Map.of("message", "Verification code sent to your email"));
    }

    @PostMapping("/forgot-password/verify")
    public ResponseEntity<?> verifyForgotPasswordCode(@Valid @RequestBody ForgotPasswordVerifyRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        UserAccount account = users.get(normalizedEmail);

        if (account == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No account found for this email"));
        }

        String storedCode = passwordResetCodes.get(normalizedEmail);
        Long expiresAt = passwordResetExpiry.get(normalizedEmail);

        if (storedCode == null || expiresAt == null || System.currentTimeMillis() > expiresAt) {
            passwordResetCodes.remove(normalizedEmail);
            passwordResetExpiry.remove(normalizedEmail);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Reset code expired. Please request a new code."));
        }

        if (!storedCode.equals(request.verificationCode().trim())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid verification code"));
        }

        String resetToken = UUID.randomUUID().toString();
        passwordResetTokens.put(normalizedEmail, resetToken);
        passwordResetTokenExpiry.put(normalizedEmail, System.currentTimeMillis() + RESET_CODE_TTL_MS);

        return ResponseEntity.ok(Map.of(
                "message", "OTP verified successfully.",
                "resetToken", resetToken
        ));
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        UserAccount account = users.get(normalizedEmail);

        if (account == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No account found for this email"));
        }

        String providedToken = request.resetToken() == null ? "" : request.resetToken().trim();

        if (!providedToken.isEmpty()) {
            String storedToken = passwordResetTokens.get(normalizedEmail);
            Long tokenExpiresAt = passwordResetTokenExpiry.get(normalizedEmail);

            if (storedToken == null || tokenExpiresAt == null || System.currentTimeMillis() > tokenExpiresAt) {
                passwordResetTokens.remove(normalizedEmail);
                passwordResetTokenExpiry.remove(normalizedEmail);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Reset session expired. Please verify OTP again."));
            }

            if (!storedToken.equals(providedToken)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid reset session token"));
            }
        } else {
            String storedCode = passwordResetCodes.get(normalizedEmail);
            Long expiresAt = passwordResetExpiry.get(normalizedEmail);

            if (storedCode == null || expiresAt == null || System.currentTimeMillis() > expiresAt) {
                passwordResetCodes.remove(normalizedEmail);
                passwordResetExpiry.remove(normalizedEmail);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Reset code expired. Please request a new code."));
            }

            if (request.verificationCode() == null || !storedCode.equals(request.verificationCode().trim())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid verification code"));
            }
        }

        users.put(normalizedEmail, new UserAccount(
                account.email(),
                request.newPassword(),
                account.fullName(),
                account.role()
        ));

        passwordResetCodes.remove(normalizedEmail);
        passwordResetExpiry.remove(normalizedEmail);
        passwordResetTokens.remove(normalizedEmail);
        passwordResetTokenExpiry.remove(normalizedEmail);

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    private String generateVerificationCode() {
        return String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1_000_000));
    }

    private void sendResetCodeEmail(UserAccount account, String verificationCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(account.email());
        message.setSubject("Smart Campus Hub - Password Reset Code");
        message.setText("Hello " + account.fullName() + ",\n\n"
                + "Your password reset verification code is: " + verificationCode + "\n"
                + "This code will expire in 5 minutes.\n\n"
                + "If you did not request this, please ignore this email.");
        mailSender.send(message);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private record UserAccount(String email, String password, String fullName, String role) {
    }
}
