package com.gameshop.controller;

import com.gameshop.model.User;
import com.gameshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return userRepository.findById(id)
            .map(user -> {
                if (updates.containsKey("username")) {
                    user.setUsername((String) updates.get("username"));
                }
                if (updates.containsKey("email")) {
                    user.setEmail((String) updates.get("email"));
                }
                if (updates.containsKey("isAdmin")) {
                    user.setIsAdmin((Boolean) updates.get("isAdmin"));
                }
                if (updates.containsKey("password") && updates.get("password") != null) {
                    String newPassword = (String) updates.get("password");
                    if (!newPassword.isEmpty()) {
                        user.setPasswordHash(passwordEncoder.encode(newPassword));
                    }
                }
                return ResponseEntity.ok(userRepository.save(user));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> {
                user.setIsVerified(false);
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "Utente disattivato"));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> {
                String temporaryPassword = UUID.randomUUID().toString().substring(0, 8);
                user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
                userRepository.save(user);
                return ResponseEntity.ok(Map.of(
                    "message", "Password resettata",
                    "tempPassword", temporaryPassword
                ));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}