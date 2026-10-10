package com.horror.h5.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "deaths")
public class DeathRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "session_id", length = 64, nullable = false)
    public String sessionId;

    @Column(name = "node_id", length = 32, nullable = false)
    public String nodeId;

    @Column(name = "death_name", length = 64, nullable = false)
    public String deathName;

    @Column(name = "death_desc", columnDefinition = "TEXT")
    public String deathDesc;

    @Column(name = "chapter", length = 64)
    public String chapter;

    @Column(name = "died_at", updatable = false)
    public LocalDateTime diedAt = LocalDateTime.now();
}
