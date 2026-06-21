package com.gameshop.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String username;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "verification_code")
    private String verificationCode;

    @Column(name = "verification_expires")
    private LocalDateTime verificationExpires;

    @Column(name = "reset_code")
    private String resetCode;

    @Column(name = "reset_expires")
    private LocalDateTime resetExpires;

    @Column(name = "api_key")
    private UUID apiKey;

    @Column(name = "is_admin")
    private Boolean isAdmin = false;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "admin_token")
    private String adminToken;

    @Column(name = "admin_token_expires")
    private LocalDateTime adminTokenExpires;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}