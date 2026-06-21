package com.gameshop.controller;

import com.gameshop.model.GameRun;
import com.gameshop.model.User;
import com.gameshop.repository.GameRunRepository;
import com.gameshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/runs")
public class GameRunController {

    @Autowired
    private GameRunRepository gameRunRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/save")
    @Transactional
    public ResponseEntity<?> saveRun(@RequestBody Map<String, Object> request) {
        String apiKey = (String) request.get("apiKey");
        if (apiKey == null || apiKey.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "apiKey mancante"));
        }

        Optional<User> userOpt = userRepository.findByApiKey(java.util.UUID.fromString(apiKey));
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Utente non trovato"));
        }
        User user = userOpt.get();

        GameRun run = new GameRun();
        run.setUserId(user.getId());
        run.setUsername(user.getUsername());
        run.setCharacterName(getString(request, "characterName", "Sconosciuto"));
        run.setScore(getLong(request, "score", 0));
        run.setWavesReached(getInt(request, "wavesReached", 0));
        run.setEnemiesKilled(getInt(request, "enemiesKilled", 0));
        run.setBossesKilled(getInt(request, "bossesKilled", 0));
        run.setGoldEarned(getInt(request, "goldEarned", 0));
        run.setGoldSpent(getInt(request, "goldSpent", 0));
        run.setLevelReached(getInt(request, "levelReached", 0));
        run.setDurationSeconds(getInt(request, "durationSeconds", 0));
        run.setOutcome(getString(request, "outcome", "death"));
        run.setWeapons(getString(request, "weapons", ""));
        run.setItems(getString(request, "items", ""));

        gameRunRepository.save(run);

        return ResponseEntity.ok(Map.of("message", "Run salvata", "runId", run.getId()));
    }

    @GetMapping("/user/{apiKey}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getUserRuns(@PathVariable String apiKey) {
        Optional<User> userOpt = userRepository.findByApiKey(java.util.UUID.fromString(apiKey));
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Utente non trovato"));
        }

        List<GameRun> runs = gameRunRepository.findByUserIdOrderByCreatedAtDesc(userOpt.get().getId());
        List<Map<String, Object>> result = runs.stream().limit(20).map(this::runToMap).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/profile/{userId}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Utente non trovato"));
        }
        User user = userOpt.get();

        Long totalScore = gameRunRepository.findTotalScoreByUserId(userId);
        Long totalEnemies = gameRunRepository.findTotalEnemiesByUserId(userId);
        Integer bestDuration = gameRunRepository.findBestDurationByUserId(userId);
        Long totalRuns = gameRunRepository.countRunsByUserId(userId);
        String mostPlayed = gameRunRepository.findMostPlayedCharacter(userId);
        Integer bestWaves = gameRunRepository.findBestWavesByUserId(userId);
        Long bestScore = gameRunRepository.findBestScoreByUserId(userId);
        Long totalBosses = gameRunRepository.findTotalBossesByUserId(userId);
        Long totalGoldEarned = gameRunRepository.findTotalGoldEarnedByUserId(userId);
        Integer avgDuration = gameRunRepository.findAvgDurationByUserId(userId);
        Long victories = gameRunRepository.countVictoriesByUserId(userId);

        Map<String, Object> profile = new HashMap<>();
        profile.put("userId", user.getId());
        profile.put("username", user.getUsername());
        profile.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalScore", totalScore != null ? totalScore : 0);
        stats.put("bestScore", bestScore != null ? bestScore : 0);
        stats.put("totalRuns", totalRuns != null ? totalRuns : 0);
        stats.put("victories", victories != null ? victories : 0);
        stats.put("totalEnemiesKilled", totalEnemies != null ? totalEnemies : 0);
        stats.put("totalBossesKilled", totalBosses != null ? totalBosses : 0);
        stats.put("bestWave", bestWaves != null ? bestWaves : 0);
        stats.put("bestDurationSeconds", bestDuration != null ? bestDuration : 0);
        stats.put("avgDurationSeconds", avgDuration != null ? avgDuration : 0);
        stats.put("totalGoldEarned", totalGoldEarned != null ? totalGoldEarned : 0);
        stats.put("mostPlayedCharacter", mostPlayed != null ? mostPlayed : "");

        List<GameRun> recentRuns = gameRunRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> runsList = recentRuns.stream().limit(10).map(this::runToMap).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("user", profile);
        result.put("stats", stats);
        result.put("recentRuns", runsList);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/best-scores")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getBestScores() {
        List<GameRun> runs = gameRunRepository.findTop100ByOrderByScoreDesc();

        Map<Long, Map<String, Object>> playerMap = new LinkedHashMap<>();
        for (GameRun run : runs) {
            if (playerMap.containsKey(run.getUserId())) continue;
            Map<String, Object> entry = new HashMap<>();
            entry.put("userId", run.getUserId());
            entry.put("username", run.getUsername());
            entry.put("bestScore", run.getScore());
            entry.put("characterName", run.getCharacterName());
            entry.put("wavesReached", run.getWavesReached());
            entry.put("enemiesKilled", run.getEnemiesKilled());
            entry.put("durationSeconds", run.getDurationSeconds());
            entry.put("outcome", run.getOutcome());

            Long totalEnemies = gameRunRepository.findTotalEnemiesByUserId(run.getUserId());
            Integer bestDuration = gameRunRepository.findBestDurationByUserId(run.getUserId());
            Long totalRuns = gameRunRepository.countRunsByUserId(run.getUserId());
            String mostPlayed = gameRunRepository.findMostPlayedCharacter(run.getUserId());

            entry.put("totalEnemiesKilled", totalEnemies != null ? totalEnemies : 0);
            entry.put("bestDurationSeconds", bestDuration != null ? bestDuration : 0);
            entry.put("totalRuns", totalRuns != null ? totalRuns : 0);
            entry.put("mostPlayedCharacter", mostPlayed != null ? mostPlayed : "");

            userRepository.findById(run.getUserId()).ifPresent(user -> {
                entry.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");
            });

            playerMap.put(run.getUserId(), entry);
        }

        List<Map<String, Object>> result = new ArrayList<>(playerMap.values());
        for (int i = 0; i < result.size(); i++) {
            result.get(i).put("rank", i + 1);
        }

        return ResponseEntity.ok(result);
    }

    private Map<String, Object> runToMap(GameRun run) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", run.getId());
        map.put("characterName", run.getCharacterName());
        map.put("score", run.getScore());
        map.put("wavesReached", run.getWavesReached());
        map.put("enemiesKilled", run.getEnemiesKilled());
        map.put("bossesKilled", run.getBossesKilled());
        map.put("goldEarned", run.getGoldEarned());
        map.put("goldSpent", run.getGoldSpent());
        map.put("levelReached", run.getLevelReached());
        map.put("durationSeconds", run.getDurationSeconds());
        map.put("outcome", run.getOutcome());
        map.put("weapons", run.getWeapons());
        map.put("items", run.getItems());
        map.put("createdAt", run.getCreatedAt() != null ? run.getCreatedAt().toString() : null);
        return map;
    }

    private String getString(Map<String, Object> map, String key, String def) {
        Object val = map.get(key);
        return val != null ? val.toString() : def;
    }

    private Long getLong(Map<String, Object> map, String key, long def) {
        Object val = map.get(key);
        return val != null ? ((Number) val).longValue() : def;
    }

    private int getInt(Map<String, Object> map, String key, int def) {
        Object val = map.get(key);
        return val != null ? ((Number) val).intValue() : def;
    }
}
