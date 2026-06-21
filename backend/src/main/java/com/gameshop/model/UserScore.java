package com.gameshop.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_scores")
@Data
public class UserScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;

    @Column(name = "monthly_score")
    private Long monthlyScore = 0L;

    @Column(name = "total_score")
    private Long totalScore = 0L;

    @Column(name = "national_rank")
    private Integer nationalRank = 0;

    @Column(name = "global_rank")
    private Integer globalRank = 0;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}