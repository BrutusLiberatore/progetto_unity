package com.gameshop.repository;

import com.gameshop.model.GameRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameRunRepository extends JpaRepository<GameRun, Long> {
    List<GameRun> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<GameRun> findTop100ByOrderByScoreDesc();

    @Query("SELECT MAX(r.score) FROM GameRun r WHERE r.userId = :userId")
    Long findBestScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(r.score) FROM GameRun r WHERE r.userId = :userId")
    Long findTotalScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(r.enemiesKilled) FROM GameRun r WHERE r.userId = :userId")
    Long findTotalEnemiesByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(r.bossesKilled) FROM GameRun r WHERE r.userId = :userId")
    Long findTotalBossesByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(r.goldEarned) FROM GameRun r WHERE r.userId = :userId")
    Long findTotalGoldEarnedByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(r.durationSeconds) FROM GameRun r WHERE r.userId = :userId")
    Integer findBestDurationByUserId(@Param("userId") Long userId);

    @Query("SELECT CAST(AVG(r.durationSeconds) AS integer) FROM GameRun r WHERE r.userId = :userId")
    Integer findAvgDurationByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM GameRun r WHERE r.userId = :userId")
    Long countRunsByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM GameRun r WHERE r.userId = :userId AND r.outcome = 'victory'")
    Long countVictoriesByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT character_name FROM game_runs WHERE user_id = :userId GROUP BY character_name ORDER BY COUNT(character_name) DESC LIMIT 1", nativeQuery = true)
    String findMostPlayedCharacter(@Param("userId") Long userId);

    @Query("SELECT MAX(r.wavesReached) FROM GameRun r WHERE r.userId = :userId")
    Integer findBestWavesByUserId(@Param("userId") Long userId);
}
