package com.horror.h5.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "last_words")
public class LastWord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "session_id", length = 64)
    public String sessionId;

    @Column(name = "content", length = 255, nullable = false)
    public String content;

    @Column(name = "ending_name", length = 64)
    public String endingName;

    @Column(name = "player_name", length = 64)
    public String playerName = "匿名";

    @Column(name = "likes")
    public Integer likes = 0;

    @Column(name = "created_at", updatable = false)
    public LocalDateTime createdAt = LocalDateTime.now();
}
