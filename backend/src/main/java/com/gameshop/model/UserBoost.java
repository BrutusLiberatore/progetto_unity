package com.gameshop.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_boosts")
@Data
public class UserBoost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "boost_type", nullable = false)
    private String boostType;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "multiplier")
    private Double multiplier = 2.0;

    @Column(name = "is_active")
    private Boolean isActive = false;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
