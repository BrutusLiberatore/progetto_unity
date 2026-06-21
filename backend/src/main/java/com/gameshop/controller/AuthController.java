package com.gameshop.controller;

import com.gameshop.model.User;
import com.gameshop.repository.UserRepository;
import com.gameshop.service.EmailService;
import com.gameshop.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String username = body.get("username");

        if (email == null || password == null || username == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Compila tutti i campi"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(409).body(Map.of("message", "Email gia registrata"));
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.status(400).body(Map.of("message", "Username gia in uso", "code", "USERNAME_TAKEN"));
        }

        String avatarSeed = username + "_" + System.currentTimeMillis();
        String avatarUrl = "https://api.dicebear.com/7.x/adventurer/svg?seed=" + avatarSeed;

        String verificationCode = String.format("%06d", new Random().nextInt(999999));

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setUsername(username);
        user.setIsVerified(false);
        user.setVerificationCode(verificationCode);
        user.setVerificationExpires(LocalDateTime.now().plusMinutes(30));
        user.setApiKey(UUID.randomUUID());
        user.setAvatarUrl(avatarUrl);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        try {
            boolean emailSent = emailService.sendVerificationEmail(email, username, verificationCode);
            System.out.println("Verification email sent: " + emailSent);
        } catch (Exception e) {
            System.out.println("Verification email error: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
            "message", "Registrazione completata",
            "needsVerification", true,
            "avatarUrl", avatarUrl
        ));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Utente non trovato"));
        }

        User user = userOpt.get();

        if (user.getIsVerified()) {
            return ResponseEntity.ok(Map.of("message", "Email gia verificata"));
        }

        if (!code.equals(user.getVerificationCode())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Codice non valido"));
        }

        if (user.getVerificationExpires() != null && user.getVerificationExpires().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Codice scaduto", "code", "EXPIRED"));
        }

        user.setIsVerified(true);
        user.setVerificationCode(null);
        user.setVerificationExpires(null);
        userRepository.save(user);

        try {
            emailService.sendWelcomeEmail(email, user.getUsername());
        } catch (Exception e) {
            System.out.println("Welcome email error: " + e.getMessage());
        }

        String token = jwtUtil.generateUserToken(email);

        return ResponseEntity.ok(Map.of(
            "message", "Email verificata",
            "token", token,
            "user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "username", user.getUsername(),
                "isVerified", true,
                "apiKey", user.getApiKey(),
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                "createdAt", user.getCreatedAt().toString()
            )
        ));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> body) {
        String email = body.get("email");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "Se l'email esiste, riceverai il codice"));
        }

        User user = userOpt.get();

        if (user.getIsVerified()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email gia verificata"));
        }

        String verificationCode = String.format("%06d", new Random().nextInt(999999));
        user.setVerificationCode(verificationCode);
        user.setVerificationExpires(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(email, user.getUsername(), verificationCode);
        } catch (Exception e) {
            System.out.println("Verification email error: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Codice reinviato"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Nessun account trovato con questa email"));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("message", "Email o password non validi"));
        }

        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            return ResponseEntity.status(403).body(Map.of(
                "message", "Email non verificata",
                "code", "NOT_VERIFIED",
                "needsVerification", true
            ));
        }

        String token = jwtUtil.generateUserToken(email);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "username", user.getUsername(),
            "isVerified", user.getIsVerified(),
            "apiKey", user.getApiKey(),
            "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
            "createdAt", user.getCreatedAt().toString()
        ));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "Se l'email esiste, riceverai il codice"));
        }

        User user = userOpt.get();
        String code = String.format("%06d", new Random().nextInt(999999));
        user.setResetCode(code);
        user.setResetExpires(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        try {
            emailService.sendPasswordResetEmail(email, user.getUsername(), code);
        } catch (Exception e) {
            System.out.println("Password reset email error: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Codice inviato"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        String newPassword = body.get("newPassword");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Utente non trovato"));
        }

        User user = userOpt.get();
        if (!code.equals(user.getResetCode())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Codice non valido"));
        }

        if (user.getResetExpires().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Codice scaduto"));
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetCode(null);
        user.setResetExpires(null);
        user.setIsVerified(true);
        userRepository.save(user);

        String token = jwtUtil.generateUserToken(email);

        return ResponseEntity.ok(Map.of(
            "message", "Password resettata con successo",
            "token", token,
            "user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "username", user.getUsername(),
                "isVerified", user.getIsVerified(),
                "apiKey", user.getApiKey(),
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                "createdAt", user.getCreatedAt().toString()
            )
        ));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("message", "Token non valido"));
        }

        String token = authHeader.substring(7);
        
        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body(Map.of("message", "Token non valido"));
        }

        if (jwtUtil.isTokenExpired(token)) {
            return ResponseEntity.status(401).body(Map.of("message", "Token scaduto"));
        }

        String email = jwtUtil.getEmailFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);

        return ResponseEntity.ok(Map.of(
            "valid", true,
            "email", email,
            "role", role
        ));
    }

    @GetMapping("/user-info")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("message", "Token non valido"));
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token) || jwtUtil.isTokenExpired(token)) {
            return ResponseEntity.status(401).body(Map.of("message", "Token non valido"));
        }
        String email = jwtUtil.getEmailFromToken(token);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Utente non trovato"));
        }
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "username", user.getUsername(),
            "apiKey", user.getApiKey(),
            "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
            "isVerified", user.getIsVerified()
        ));
    }
}