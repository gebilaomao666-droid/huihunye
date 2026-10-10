package com.horror.h5.repository;

import com.horror.h5.entity.DeathRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeathRecordRepository extends JpaRepository<DeathRecord, Long> {
    DeathRecord findTopByOrderByDiedAtDesc();
}
