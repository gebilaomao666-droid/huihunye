package com.horror.h5.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "answers")
public class AnswerRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "session_id", length = 64, nullable = false)
    public String sessionId;

    @Column(name = "question_index", nullable = false)
    public Integer questionIndex;

    @Column(name = "question_text", columnDefinition = "TEXT")
    public String questionText;

    @Column(name = "choice_index", nullable = false)
    public Integer choiceIndex;

    @Column(name = "choice_text", columnDefinition = "TEXT")
    public String choiceText;

    @Column(name = "node_id", length = 32)
    public String nodeId;

    @Column(name = "chapter", length = 64)
    public String chapter;

    @Column(name = "created_at", updatable = false)
    public LocalDateTime createdAt = LocalDateTime.now();
}
