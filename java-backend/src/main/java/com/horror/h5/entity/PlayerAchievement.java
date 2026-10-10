package com.horror.h5.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "player_achievements")
public class PlayerAchievement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "player_id", nullable = false, length = 64)
    public String playerId;

    @Column(name = "achievement_code", nullable = false, length = 32)
    public String achievementCode;

    @Column(name = "unlocked_at")
    public LocalDateTime unlockedAt;

    @Column(name = "session_id", length = 32)
    public String sessionId;
}
