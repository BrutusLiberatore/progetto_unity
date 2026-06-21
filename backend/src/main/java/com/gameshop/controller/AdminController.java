package com.gameshop.controller;

import com.gameshop.model.Order;
import com.gameshop.model.User;
import com.gameshop.repository.OrderRepository;
import com.gameshop.repository.UserRepository;
import com.gameshop.service.EmailService;
import com.gameshop.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email e password richiesti"));
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Utente non trovato"));
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("message", "Password non valida"));
        }

        if (!user.getIsAdmin()) {
            return ResponseEntity.status(403).body(Map.of("message", "Accesso negato - non sei un amministratore"));
        }

        String token = jwtUtil.generateAdminToken(email);

        return ResponseEntity.ok(Map.of(
            "token", token,
            "message", "Login admin riuscito"
        ));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestBody Map<String, String> body) {
        String token = body.get("token");

        if (token == null) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Token richiesto"));
        }

        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.ok(Map.of("valid", false, "message", "Token non valido"));
        }

        if (jwtUtil.isTokenExpired(token)) {
            return ResponseEntity.ok(Map.of("valid", false, "message", "Token scaduto"));
        }

        String role = jwtUtil.getRoleFromToken(token);
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.ok(Map.of("valid", false, "message", "Token non admin"));
        }

        String email = jwtUtil.getEmailFromToken(token);
        User user = userRepository.findByEmail(email).orElse(null);

        return ResponseEntity.ok(Map.of(
            "valid", true,
            "user", Map.of(
                "id", user != null ? user.getId() : null,
                "email", email,
                "username", user != null ? user.getUsername() : null
            )
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Logout effettuato - revoca il token lato client"));
    }

    @GetMapping("/status")
    public ResponseEntity<?> status() {
        return ResponseEntity.ok(Map.of(
            "message", "Admin API attiva",
            "version", "1.0.0"
        ));
    }

    @PostMapping("/confirm-order")
    public ResponseEntity<?> confirmOrder(@RequestBody Map<String, Object> body) {
        try {
            Long orderId = ((Number) body.get("orderId")).longValue();

            Order order = orderRepository.findById(orderId)
                .orElse(null);

            if (order == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ordine non trovato"));
            }

            if (order.getStatus() == Order.OrderStatus.COMPLETED) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ordine già confermato"));
            }

            order.setStatus(Order.OrderStatus.COMPLETED);
            orderRepository.save(order);

            // Send order confirmation email
            try {
                User user = userRepository.findById(order.getUserId()).orElse(null);
                if (user != null) {
                    Map<String, Object> orderMap = Map.of(
                        "id", order.getId(),
                        "totalCents", order.getTotalCents()
                    );
                    emailService.sendOrderConfirmationEmail(
                        user.getEmail(),
                        user.getUsername(),
                        orderMap
                    );
                }
            } catch (Exception e) {
                System.out.println("Email error: " + e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                "message", "Ordine confermato",
                "orderId", orderId
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}