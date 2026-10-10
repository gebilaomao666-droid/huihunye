package com.horror.h5;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.horror.h5.dto.Dtos;
import com.horror.h5.entity.EndingRecord;
import com.horror.h5.entity.LastWord;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * 锁定响应 DTO 序列化后的 snake_case 字段契约 (与前端 api.js 约定一致)。
 * 用与生产相同的 Jackson 配置: SNAKE_CASE 命名 + non_null 省略。
 * 纯单测, 不加载 Spring 上下文 / 不连数据库。
 */
class DtoContractTest {

    private final ObjectMapper mapper = new ObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
            .setSerializationInclusion(JsonInclude.Include.NON_NULL);

    private Set<String> keys(Object dto) throws Exception {
        String json = mapper.writeValueAsString(dto);
        @SuppressWarnings("unchecked")
        Map<String, Object> m = mapper.readValue(json, Map.class);
        return m.keySet();
    }

    @Test
    void sessionResponse() throws Exception {
        assertEquals(Set.of("session_id", "name", "started_at", "fear_score", "ending_type", "death_count"),
                keys(new Dtos.SessionResponse("s1", "名", "2026-06-01T03:33", 88.5, "A", 2)));
    }

    @Test
    void sessionCreatedResponse() throws Exception {
        assertEquals(Set.of("session_id", "started_at", "message"),
                keys(new Dtos.SessionCreatedResponse("s1", "2026-06-01T03:33", "它已注意到你。")));
    }

    @Test
    void progressResponse() throws Exception {
        assertEquals(Set.of("session_id", "node_id", "chapter", "time_in_game", "choice_path",
                        "ghost_opacity", "inventory", "flags", "saved_at"),
                keys(new Dtos.ProgressResponse("s1", "node01", "第一章", "03:33", "[]", 0.5, "[]", "{}", "2026-06-01T03:33")));
    }

    @Test
    void deathLoggedResponse() throws Exception {
        assertEquals(Set.of("session_id", "death_name", "message"),
                keys(new Dtos.DeathLoggedResponse("s1", "血池吞噬", "它很满意。")));
    }

    @Test
    void lastDeathResponse() throws Exception {
        assertEquals(Set.of("session_id", "death_name", "death_desc", "chapter", "died_at"),
                keys(new Dtos.LastDeathResponse("s1", "血池吞噬", "...", "第六章", "2026-06-01T03:33")));
    }

    @Test
    void randomLastWordFull() throws Exception {
        LastWord lw = new LastWord();
        lw.content = "再见";
        lw.endingName = "逃脱";
        lw.playerName = "无名";
        lw.createdAt = LocalDateTime.now();
        assertEquals(Set.of("has_word", "content", "ending_name", "player_name", "created_at"),
                keys(Dtos.RandomLastWordResponse.from(lw)));
    }

    @Test
    void randomLastWordEmptyOmitsNulls() throws Exception {
        // non_null: 空响应只保留 has_word:false, 其余 null 字段省略
        assertEquals(Set.of("has_word"), keys(Dtos.RandomLastWordResponse.empty()));
    }

    @Test
    void nodeStatsResponse() throws Exception {
        assertEquals(Set.of("node_id", "visits", "deaths", "passes", "survival_rate", "death_rate"),
                keys(new Dtos.NodeStatsResponse("node01", 10, 3, 7, 70.0, 30.0)));
    }

    @Test
    void endingResponse() throws Exception {
        EndingRecord e = new EndingRecord();
        e.endingCode = "A";
        e.endingName = "逃脱";
        e.title = "标题";
        e.reportText = "报告";
        e.rarity = "common";
        e.unlockHint = "提示";
        e.endingImage = "img/ending/ending_a_escape.png";
        assertEquals(Set.of("ending_code", "ending_name", "title", "report_text", "rarity", "unlock_hint", "ending_image"),
                keys(Dtos.EndingResponse.from(e)));
    }
}
