package com.horror.h5.repository;

import com.horror.h5.entity.PlayerAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerAchievementRepository extends JpaRepository<PlayerAchievement, Long> {
    List<PlayerAchievement> findByPlayerId(String playerId);
    PlayerAchievement findByPlayerIdAndAchievementCode(String playerId, String code);
    long countByPlayerId(String playerId);
}
