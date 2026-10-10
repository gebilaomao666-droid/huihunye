package com.horror.h5.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
public class SessionInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "session_id", length = 64, unique = true, nullable = false)
    public String sessionId;

    @Column(name = "ip_address", length = 45)
    public String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    public String userAgent;

    @Column(name = "name", length = 64)
    public String name;

    @Column(name = "started_at")
    public LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "ended_at")
    public LocalDateTime endedAt;

    @Column(name = "fear_score", columnDefinition = "DECIMAL(5,2)")
    public Double fearScore;

    @Column(name = "ending_type", length = 16)
    public String endingType;

    @Column(name = "report_text", columnDefinition = "TEXT")
    public String reportText;

    @Column(name = "choice_count")
    public Integer choiceCount = 0;

    @Column(name = "death_count")
    public Integer deathCount = 0;

    @Column(name = "survive_time")
    public Integer surviveTime = 0;

    @Column(name = "created_at", updatable = false)
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    public LocalDateTime updatedAt = LocalDateTime.now();
}
