package com.horror.h5.repository;

import com.horror.h5.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    Achievement findByAchievementCode(String code);
}
