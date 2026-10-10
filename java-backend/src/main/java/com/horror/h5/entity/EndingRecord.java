package com.horror.h5.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "endings")
public class EndingRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "ending_code", length = 16, unique = true, nullable = false)
    public String endingCode;

    @Column(name = "ending_name", length = 64, nullable = false)
    public String endingName;

    @Column(name = "title", length = 128)
    public String title;

    @Column(name = "report_text", columnDefinition = "TEXT", nullable = false)
    public String reportText;

    @Column(name = "fear_score_min", columnDefinition = "DECIMAL(5,2)")
    public Double fearScoreMin = 0.0;

    @Column(name = "fear_score_max", columnDefinition = "DECIMAL(5,2)")
    public Double fearScoreMax = 100.0;

    @Column(name = "rarity", length = 16)
    public String rarity = "common";

    @Column(name = "unlock_hint", length = 255)
    public String unlockHint;

    @Column(name = "ending_image", length = 128)
    public String endingImage;

    @Column(name = "created_at", updatable = false)
    public LocalDateTime createdAt = LocalDateTime.now();
}
