package com.gameshop.controller;

import com.gameshop.model.User;
import com.gameshop.model.UserScore;
import com.gameshop.repository.UserRepository;
import com.gameshop.repository.UserScoreRepository;
import com.gameshop.repository.GameRunRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    @Autowired
    private UserScoreRepository userScoreRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRunRepository gameRunRepository;

    @GetMapping("/monthly")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getMonthlyLeaderboard() {
        List<UserScore> scores = userScoreRepository.findTop100ByOrderByMonthlyScoreDesc();
        return ResponseEntity.ok(buildLeaderboardResponse(scores));
    }

    @GetMapping("/global")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getGlobalLeaderboard() {
        List<UserScore> scores = userScoreRepository.findTop100ByOrderByTotalScoreDesc();
        return ResponseEntity.ok(buildLeaderboardResponse(scores));
    }

    @GetMapping("/national")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getNationalLeaderboard() {
        List<UserScore> scores = userScoreRepository.findTop100ByOrderByNationalRankAsc();
        return ResponseEntity.ok(buildLeaderboardResponse(scores));
    }

    @GetMapping("/stats")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getStatsLeaderboard() {
        List<UserScore> scores = userScoreRepository.findTop100ByOrderByTotalScoreDesc();
        List<Map<String, Object>> result = new ArrayList<>();
        int rank = 1;

        for (UserScore score : scores) {
            Optional<User> userOpt = userRepository.findById(score.getUserId());
            if (userOpt.isEmpty()) continue;
            User user = userOpt.get();

            Map<String, Object> entry = new HashMap<>();
            entry.put("rank", rank);

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("username", user.getUsername());
            userMap.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");
            entry.put("user", userMap);

            entry.put("totalScore", score.getTotalScore());
            entry.put("monthlyScore", score.getMonthlyScore());

            Long totalEnemies = gameRunRepository.findTotalEnemiesByUserId(score.getUserId());
            Integer bestDuration = gameRunRepository.findBestDurationByUserId(score.getUserId());
            Long totalRuns = gameRunRepository.countRunsByUserId(score.getUserId());
            String mostPlayed = gameRunRepository.findMostPlayedCharacter(score.getUserId());
            Integer bestWaves = gameRunRepository.findBestWavesByUserId(score.getUserId());

            entry.put("totalEnemiesKilled", totalEnemies != null ? totalEnemies : 0);
            entry.put("bestDurationSeconds", bestDuration != null ? bestDuration : 0);
            entry.put("totalRuns", totalRuns != null ? totalRuns : 0);
            entry.put("mostPlayedCharacter", mostPlayed != null ? mostPlayed : "");
            entry.put("bestWaves", bestWaves != null ? bestWaves : 0);

            result.add(entry);
            rank++;
        }

        return ResponseEntity.ok(result);
    }

    private List<Map<String, Object>> buildLeaderboardResponse(List<UserScore> scores) {
        List<Map<String, Object>> result = new ArrayList<>();
        int rank = 1;
        
        for (UserScore score : scores) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("rank", rank);
            entry.put("monthlyScore", score.getMonthlyScore());
            entry.put("totalScore", score.getTotalScore());
            entry.put("nationalRank", score.getNationalRank());
            entry.put("globalRank", score.getGlobalRank());
            entry.put("lastUpdated", score.getLastUpdated() != null ? score.getLastUpdated().toLocalDate().toString() : null);

            Optional<User> userOpt = userRepository.findById(score.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("username", user.getUsername());
                userMap.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");
                entry.put("user", userMap);

                Long totalEnemies = gameRunRepository.findTotalEnemiesByUserId(user.getId());
                Long totalRuns = gameRunRepository.countRunsByUserId(user.getId());
                String mostPlayed = gameRunRepository.findMostPlayedCharacter(user.getId());
                entry.put("totalEnemiesKilled", totalEnemies != null ? totalEnemies : 0);
                entry.put("totalRuns", totalRuns != null ? totalRuns : 0);
                entry.put("mostPlayedCharacter", mostPlayed != null ? mostPlayed : "");
            }
            
            result.add(entry);
            rank++;
        }
        
        return result;
    }

    @PostMapping("/update")
    @Transactional
    public ResponseEntity<?> updateScore(@RequestBody Map<String, Object> request) {
        Long userId = null;
        Object userIdObj = request.get("userId");
        Object apiKeyObj = request.get("apiKey");

        if (userIdObj != null) {
            userId = ((Number) userIdObj).longValue();
        } else if (apiKeyObj != null) {
            Optional<User> userOpt = userRepository.findByApiKey(java.util.UUID.fromString(apiKeyObj.toString()));
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Utente non trovato"));
            }
            userId = userOpt.get().getId();
        }

        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "userId o apiKey richiesto"));
        }

        final Long finalUserId = userId;
        Long scoreToAdd = ((Number) request.get("score")).longValue();
        
        Optional<User> userOpt = userRepository.findById(finalUserId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Utente non trovato"));
        }
        
        UserScore score = userScoreRepository.findByUserId(finalUserId)
            .orElseGet(() -> {
                UserScore newScore = new UserScore();
                newScore.setUserId(finalUserId);
                newScore.setMonthlyScore(0L);
                newScore.setTotalScore(0L);
                newScore.setNationalRank(0);
                newScore.setGlobalRank(0);
                return newScore;
            });
        
        score.setMonthlyScore(score.getMonthlyScore() + scoreToAdd);
        score.setTotalScore(score.getTotalScore() + scoreToAdd);
        score.setLastUpdated(LocalDateTime.now());
        
        userScoreRepository.save(score);
        
        recalculateRanks();
        
        return ResponseEntity.ok(Map.of("message", "Punteggio aggiornato"));
    }

    private void recalculateRanks() {
        List<UserScore> allScores = userScoreRepository.findAll();
        
        List<UserScore> sortedByTotal = allScores.stream()
            .sorted(Comparator.comparing(UserScore::getTotalScore).reversed())
            .collect(Collectors.toList());
        
        int globalRank = 1;
        for (UserScore score : sortedByTotal) {
            score.setGlobalRank(globalRank);
            userScoreRepository.save(score);
            globalRank++;
        }
        
        List<UserScore> sortedByMonthly = allScores.stream()
            .sorted(Comparator.comparing(UserScore::getMonthlyScore).reversed())
            .collect(Collectors.toList());
        
        int nationalRank = 1;
        for (UserScore score : sortedByMonthly) {
            score.setNationalRank(nationalRank);
            userScoreRepository.save(score);
            nationalRank++;
        }
    }

    @PostMapping("/init")
    @Transactional
    public ResponseEntity<?> initTestData() {
        return ResponseEntity.ok(Map.of("message", "Init disabilitato"));
    }
}
