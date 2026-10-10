package com.horror.h5.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "node_stats")
public class NodeStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "node_id", length = 32, unique = true, nullable = false)
    public String nodeId;

    @Column(name = "visits")
    public Integer visits = 0;

    @Column(name = "deaths")
    public Integer deaths = 0;

    @Column(name = "passes")
    public Integer passes = 0;

    @Column(name = "avg_stay_seconds")
    public Integer avgStaySeconds = 0;

    @Column(name = "updated_at")
    public LocalDateTime updatedAt = LocalDateTime.now();
}
