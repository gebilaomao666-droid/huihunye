package com.horror.h5.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "progress")
public class Progress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "session_id", length = 64, nullable = false)
    public String sessionId;

    @Column(name = "node_id", length = 32, nullable = false)
    public String nodeId;

    @Column(name = "chapter", length = 64)
    public String chapter;

    @Column(name = "time_in_game", length = 16)
    public String timeInGame;

    @Column(name = "choice_path", columnDefinition = "JSON")
    public String choicePath;

    @Column(name = "ghost_opacity", columnDefinition = "DECIMAL(4,3)")
    public Double ghostOpacity = 0.01;

    @Column(name = "inventory", columnDefinition = "JSON")
    public String inventory;

    @Column(name = "flags", columnDefinition = "JSON")
    public String flags;

    @Column(name = "updated_at")
    public LocalDateTime updatedAt = LocalDateTime.now();
}
