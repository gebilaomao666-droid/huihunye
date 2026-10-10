package com.horror.h5.repository;

import com.horror.h5.entity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {
    Progress findBySessionId(String sessionId);
}
