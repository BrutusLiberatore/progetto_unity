package com.gameshop.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_runs")
@Data
public class GameRun {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "username")
    private String username;

    @Column(name = "character_name")
    private String characterName;

    @Column(name = "score")
    private Long score = 0L;

    @Column(name = "waves_reached")
    private Integer wavesReached = 0;

    @Column(name = "enemies_killed")
    private Integer enemiesKilled = 0;

    @Column(name = "bosses_killed")
    private Integer bossesKilled = 0;

    @Column(name = "gold_earned")
    private Integer goldEarned = 0;

    @Column(name = "gold_spent")
    private Integer goldSpent = 0;

    @Column(name = "level_reached")
    private Integer levelReached = 0;

    @Column(name = "duration_seconds")
    private Integer durationSeconds = 0;

    @Column(name = "outcome")
    private String outcome;

    @Column(name = "weapons")
    private String weapons;

    @Column(name = "items")
    private String items;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
