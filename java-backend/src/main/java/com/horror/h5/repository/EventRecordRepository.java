package com.horror.h5.repository;

import com.horror.h5.entity.EventRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRecordRepository extends JpaRepository<EventRecord, Long> {
    List<EventRecord> findBySessionId(String sessionId);
}
