package com.gameshop.controller;

import com.gameshop.model.User;
import com.gameshop.model.UserBoost;
import com.gameshop.repository.UserBoostRepository;
import com.gameshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/boosts")
public class BoostController {

    @Autowired
    private UserBoostRepository userBoostRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user/{apiKey}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getUserBoosts(@PathVariable String apiKey) {
        Optional<User> userOpt = userRepository.findByApiKey(java.util.UUID.fromString(apiKey));
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Utente non trovato"));
        }

        List<UserBoost> boosts = userBoostRepository.findByUserIdOrderByCreatedAtDesc(userOpt.get().getId());
        List<Map<String, Object>> result = boosts.stream().map(this::boostToMap).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/active/{apiKey}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getActiveBoosts(@PathVariable String apiKey) {
        Optional<User> userOpt = userRepository.findByApiKey(java.util.UUID.fromString(apiKey));
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Utente non trovato"));
        }

        List<UserBoost> active = userBoostRepository.findActiveBoosts(userOpt.get().getId());
        List<Map<String, Object>> result = active.stream().map(this::boostToMap).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/activate")
    @Transactional
    public ResponseEntity<?> activateBoost(@RequestBody Map<String, Object> request) {
        String apiKey = (String) request.get("apiKey");
        Long boostId = ((Number) request.get("boostId")).longValue();

        Optional<User> userOpt = userRepository.findByApiKey(java.util.UUID.fromString(apiKey));
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Utente non trovato"));
        }

        Optional<UserBoost> boostOpt = userBoostRepository.findById(boostId);
        if (boostOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Boost non trovato"));
        }

        UserBoost boost = boostOpt.get();
        if (!boost.getUserId().equals(userOpt.get().getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Boost non appartenente all'utente"));
        }

        if (boost.getIsActive() && boost.getExpiresAt() != null && boost.getExpiresAt().isAfter(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Boost già attivo"));
        }

        boost.setIsActive(true);
        boost.setActivatedAt(LocalDateTime.now());
        boost.setExpiresAt(LocalDateTime.now().plusMinutes(boost.getDurationMinutes()));
        userBoostRepository.save(boost);

        return ResponseEntity.ok(Map.of(
            "message", "Boost attivato",
            "expiresAt", boost.getExpiresAt().toString()
        ));
    }

    @PostMapping("/grant")
    @Transactional
    public ResponseEntity<?> grantBoost(@RequestBody Map<String, Object> request) {
        String apiKey = (String) request.get("apiKey");
        String productName = (String) request.get("productName");
        String boostType = (String) request.get("boostType");
        int durationMinutes = ((Number) request.get("durationMinutes")).intValue();
        double multiplier = request.get("multiplier") != null ? ((Number) request.get("multiplier")).doubleValue() : 2.0;

        Optional<User> userOpt = userRepository.findByApiKey(java.util.UUID.fromString(apiKey));
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Utente non trovato"));
        }

        UserBoost boost = new UserBoost();
        boost.setUserId(userOpt.get().getId());
        boost.setProductName(productName);
        boost.setBoostType(boostType);
        boost.setDurationMinutes(durationMinutes);
        boost.setMultiplier(multiplier);
        boost.setIsActive(false);
        userBoostRepository.save(boost);

        return ResponseEntity.ok(Map.of("message", "Boost assegnato", "boostId", boost.getId()));
    }

    private Map<String, Object> boostToMap(UserBoost boost) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", boost.getId());
        map.put("productName", boost.getProductName());
        map.put("boostType", boost.getBoostType());
        map.put("durationMinutes", boost.getDurationMinutes());
        map.put("multiplier", boost.getMultiplier());
        map.put("isActive", boost.getIsActive());
        map.put("activatedAt", boost.getActivatedAt() != null ? boost.getActivatedAt().toString() : null);
        map.put("expiresAt", boost.getExpiresAt() != null ? boost.getExpiresAt().toString() : null);

        boolean isExpired = boost.getIsActive() && boost.getExpiresAt() != null && boost.getExpiresAt().isBefore(LocalDateTime.now());
        map.put("isExpired", isExpired);

        if (boost.getIsActive() && !isExpired && boost.getExpiresAt() != null) {
            long remainingSeconds = java.time.Duration.between(LocalDateTime.now(), boost.getExpiresAt()).getSeconds();
            map.put("remainingSeconds", Math.max(0, remainingSeconds));
        } else {
            map.put("remainingSeconds", 0);
        }

        return map;
    }
}
