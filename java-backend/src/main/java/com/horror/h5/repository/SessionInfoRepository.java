package com.horror.h5.repository;

import com.horror.h5.entity.SessionInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionInfoRepository extends JpaRepository<SessionInfo, Long> {
    SessionInfo findBySessionId(String sessionId);

    List<SessionInfo> findTop10ByFearScoreIsNotNullOrderByFearScoreDesc();

    List<SessionInfo> findByFearScoreIsNotNullOrderByFearScoreDesc(Pageable pageable);

    long countByFearScoreIsNotNull();

    @Query("SELECT COUNT(s) FROM SessionInfo s WHERE s.fearScore > ?1")
    long countByFearScoreGreaterThan(Double fearScore);

    List<SessionInfo> findByEndingTypeIsNotNullOrderByEndedAtDesc();
}
