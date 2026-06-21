package com.gameshop.repository;

import com.gameshop.model.UserBoost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserBoostRepository extends JpaRepository<UserBoost, Long> {
    List<UserBoost> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT b FROM UserBoost b WHERE b.userId = :userId AND b.isActive = true AND b.expiresAt > CURRENT_TIMESTAMP")
    List<UserBoost> findActiveBoosts(@Param("userId") Long userId);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM UserBoost b WHERE b.userId = :userId AND b.boostType = :boostType AND b.isActive = true AND b.expiresAt > CURRENT_TIMESTAMP")
    boolean hasActiveBoostOfType(@Param("userId") Long userId, @Param("boostType") String boostType);
}
