package com.gameshop.repository;

import com.gameshop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByApiKey(UUID apiKey);
    Optional<User> findByAdminToken(String adminToken);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}