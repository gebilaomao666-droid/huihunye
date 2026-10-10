package com.horror.h5.repository;

import com.horror.h5.entity.EndingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EndingRecordRepository extends JpaRepository<EndingRecord, Long> {
    EndingRecord findByEndingCode(String endingCode);
}
