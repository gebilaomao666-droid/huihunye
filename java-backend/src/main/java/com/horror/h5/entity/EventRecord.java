package com.horror.h5.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class EventRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "session_id", length = 64, nullable = false)
    public String sessionId;

    @Column(name = "event_type", length = 32, nullable = false)
    public String eventType;

    @Column(name = "node_id", length = 32)
    public String nodeId;

    @Column(name = "payload", columnDefinition = "JSON")
    public String payload;

    @Column(name = "created_at", updatable = false)
    public LocalDateTime createdAt = LocalDateTime.now();
}
