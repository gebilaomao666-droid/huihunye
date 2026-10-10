package com.horror.h5.dto;

import com.horror.h5.entity.DeathRecord;
import com.horror.h5.entity.EndingRecord;
import com.horror.h5.entity.LastWord;
import com.horror.h5.entity.Progress;
import com.horror.h5.entity.SessionInfo;

/**
 * 接口响应 DTO。
 * record 组件用 camelCase, 经全局 spring.jackson.property-naming-strategy=SNAKE_CASE
 * 自动序列化为 snake_case, 取代 Controller 里手拼的 Map<String,Object>(消除手敲字段名漂移)。
 * 时间戳沿用 .toString() 保持与原 wire 格式一致; null 字段经全局 non_null 策略省略。
 */
public final class Dtos {
    private Dtos() {}

    public record SessionCreatedResponse(String sessionId, String startedAt, String message) {}

    public record SessionResponse(
            String sessionId, String name, String startedAt,
            Double fearScore, String endingType, Integer deathCount) {
        public static SessionResponse from(SessionInfo s) {
            return new SessionResponse(
                    s.sessionId, s.name,
                    s.startedAt != null ? s.startedAt.toString() : null,
                    s.fearScore, s.endingType, s.deathCount);
        }
    }

    public record ProgressResponse(
            String sessionId, String nodeId, String chapter, String timeInGame,
            String choicePath, Double ghostOpacity, String inventory, String flags, String savedAt) {
        public static ProgressResponse from(Progress p) {
            return new ProgressResponse(
                    p.sessionId, p.nodeId, p.chapter, p.timeInGame,
                    p.choicePath, p.ghostOpacity, p.inventory, p.flags,
                    p.updatedAt != null ? p.updatedAt.toString() : null);
        }
    }

    public record DeathLoggedResponse(String sessionId, String deathName, String message) {}

    public record LastDeathResponse(
            String sessionId, String deathName, String deathDesc, String chapter, String diedAt) {
        public static LastDeathResponse from(DeathRecord d) {
            return new LastDeathResponse(
                    d.sessionId, d.deathName, d.deathDesc, d.chapter,
                    d.diedAt != null ? d.diedAt.toString() : null);
        }
    }

    public record RandomLastWordResponse(
            boolean hasWord, String content, String endingName, String playerName, String createdAt) {
        public static RandomLastWordResponse from(LastWord lw) {
            return new RandomLastWordResponse(
                    true, lw.content, lw.endingName, lw.playerName,
                    lw.createdAt != null ? lw.createdAt.toString() : null);
        }
        public static RandomLastWordResponse empty() {
            return new RandomLastWordResponse(false, null, null, null, null);
        }
    }

    public record NodeStatsResponse(
            String nodeId, Integer visits, Integer deaths, Integer passes,
            double survivalRate, double deathRate) {}

    public record EndingResponse(
            String endingCode, String endingName, String title, String reportText,
            String rarity, String unlockHint, String endingImage) {
        public static EndingResponse from(EndingRecord e) {
            return new EndingResponse(
                    e.endingCode, e.endingName, e.title, e.reportText,
                    e.rarity, e.unlockHint, e.endingImage);
        }
    }
}
