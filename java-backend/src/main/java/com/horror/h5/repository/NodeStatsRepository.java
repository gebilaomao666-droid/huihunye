package com.horror.h5.repository;

import com.horror.h5.entity.NodeStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface NodeStatsRepository extends JpaRepository<NodeStats, Long> {
    NodeStats findByNodeId(String nodeId);

    // 原子 upsert + 自增: 消除"读-改-写"丢更新, 并发首次插入也不会撞 node_id 唯一约束报 500。
    // 依赖 MySQL 的 ON DUPLICATE KEY UPDATE (node_stats.node_id 为 UNIQUE)。
    @Modifying
    @Query(value = "INSERT INTO node_stats (node_id, visits, deaths, passes, avg_stay_seconds, updated_at) " +
            "VALUES (?1, 1, 0, 0, 0, NOW()) " +
            "ON DUPLICATE KEY UPDATE visits = visits + 1, updated_at = NOW()", nativeQuery = true)
    void upsertVisit(String nodeId);

    @Modifying
    @Query(value = "INSERT INTO node_stats (node_id, visits, deaths, passes, avg_stay_seconds, updated_at) " +
            "VALUES (?1, 0, 1, 0, 0, NOW()) " +
            "ON DUPLICATE KEY UPDATE deaths = deaths + 1, updated_at = NOW()", nativeQuery = true)
    void upsertDeath(String nodeId);

    @Modifying
    @Query(value = "INSERT INTO node_stats (node_id, visits, deaths, passes, avg_stay_seconds, updated_at) " +
            "VALUES (?1, 0, 0, 1, 0, NOW()) " +
            "ON DUPLICATE KEY UPDATE passes = passes + 1, updated_at = NOW()", nativeQuery = true)
    void upsertPass(String nodeId);
}
