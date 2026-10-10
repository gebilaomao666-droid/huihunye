package com.horror.h5.repository;

import com.horror.h5.entity.AnswerRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRecordRepository extends JpaRepository<AnswerRecord, Long> {
    List<AnswerRecord> findBySessionIdOrderByCreatedAtAsc(String sessionId);
}
