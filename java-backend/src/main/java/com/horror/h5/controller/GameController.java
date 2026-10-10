package com.horror.h5.controller;



import com.horror.h5.entity.*;

import com.horror.h5.service.GameService;

import com.horror.h5.dto.Dtos;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.*;



import java.util.*;



@RestController

@RequestMapping("/api")

@CrossOrigin(origins = "*")

public class GameController {



    @Autowired

    private GameService service;



    @GetMapping("/health")

    public Map<String, String> health() {

        return Map.of("status", "alive", "whisper", "它没睡。");

    }



    // ========== 会话 ==========

    @PostMapping("/session")

    public Object createSession(@RequestBody Map<String, String> body, HttpServletRequest req) {

        String ua = body.get("user_agent");

        String name = body.get("name");

        String ip = req.getHeader("X-Forwarded-For");

        if (ip == null || ip.isEmpty()) ip = req.getRemoteAddr();

        SessionInfo s = service.createSession(ua, ip, name);

        return new Dtos.SessionCreatedResponse(s.sessionId, s.startedAt.toString(), "它已注意到你。");

    }



    @GetMapping("/session/{sessionId}")

    public Object getSession(@PathVariable String sessionId) {

        SessionInfo s = service.getSession(sessionId);

        if (s == null) return Map.of("error", "会话不存在。");

        return Dtos.SessionResponse.from(s);

    }



    // ========== 进度存档 ==========

    @PostMapping("/progress")

    public Map<String, String> saveProgress(@RequestBody Progress p) {

        service.saveProgress(p);

        return Map.of("status", "saved", "session_id", p.sessionId, "node", p.nodeId);

    }



    @GetMapping("/progress/{sessionId}")

    public Object getProgress(@PathVariable String sessionId) {

        Progress p = service.getProgress(sessionId);

        if (p == null) return Map.of("error", "没有存档。也许你从未踏入过那扇门。");

        return Dtos.ProgressResponse.from(p);

    }



    // ========== 死亡宣告板 ==========

    @GetMapping("/death-count")

    public Map<String, Long> getDeathCount() {

        return Map.of("count", service.getDeathCount());

    }



    // ========== 死亡档案 ==========

    @PostMapping("/death")

    public Object logDeath(@RequestBody DeathRecord d) {

        service.logDeath(d);

        String[] msgs = {

            "又一个人留在了老宅里。",

            "纸人名单中多了一个名字。",

            "黄裱纸上的朱砂还未干透。",

            "它很满意。"

        };

        return new Dtos.DeathLoggedResponse(d.sessionId, d.deathName, msgs[new Random().nextInt(msgs.length)]);

    }



    @GetMapping("/last_death")

    public Object getLastDeath() {

        DeathRecord d = service.getLastDeath();

        if (d == null) return Map.of("error", "暂无死亡记录。你是第一个。");

        return Dtos.LastDeathResponse.from(d);

    }



    // ========== 遗言录音带 ==========

    @PostMapping("/last-word")

    public Map<String, String> submitLastWord(@RequestBody Map<String, String> body) {

        service.submitLastWord(

            body.get("session_id"),

            body.get("content"),

            body.get("ending_name"),

            body.get("player_name")

        );

        return Map.of("status", "saved", "message", "你的遗言已被封入黄裱纸。");

    }



    @GetMapping("/last-word/random")

    public Object getRandomLastWord() {

        LastWord lw = service.getRandomLastWord();

        if (lw == null) return Dtos.RandomLastWordResponse.empty();

        return Dtos.RandomLastWordResponse.from(lw);

    }



    // ========== 节点统计 ==========

    @PostMapping("/node_visit")

    public Map<String, String> logNodeVisit(@RequestBody Map<String, String> body) {

        service.logNodeVisit(body.get("node_id"));

        return Map.of("status", "ok", "node_id", body.get("node_id"));

    }



    @PostMapping("/node_pass")

    public Map<String, String> logNodePass(@RequestBody Map<String, String> body) {

        service.logNodePass(body.get("node_id"));

        return Map.of("status", "ok", "node_id", body.get("node_id"));

    }



    @GetMapping("/node_stats/{nodeId}")

    public Object getNodeStats(@PathVariable String nodeId) {

        NodeStats stats = service.getNodeStats(nodeId);

        int total = Math.max(stats.visits, 1);

        double survival = ((double) (stats.passes != null ? stats.passes : 0) / total) * 100;

        double death = ((double) (stats.deaths != null ? stats.deaths : 0) / total) * 100;

        return new Dtos.NodeStatsResponse(nodeId, stats.visits, stats.deaths, stats.passes,
                Math.round(survival * 10) / 10.0, Math.round(death * 10) / 10.0);

    }



    // ========== 心跳节奏 ==========

    @GetMapping("/heartbeat")

    public Map<String, Object> getHeartbeat(@RequestParam(defaultValue = "") String node_id) {

        return service.getHeartbeat(node_id);

    }



    // ========== 在线氛围 ==========

    @GetMapping("/online")

    public Map<String, Object> getOnline() {

        return service.getOnline();

    }



    // ========== 短信系统 ==========

    @GetMapping("/message")

    public Map<String, Object> getMessage(@RequestParam(defaultValue = "") String node_id) {

        return service.getMessage(node_id);

    }



    // ========== 事件日志 ==========

    @PostMapping("/event")

    public Map<String, String> logEvent(@RequestBody EventRecord e) {

        service.logEvent(e);

        return Map.of("status", "recorded", "session_id", e.sessionId);

    }



    // ========== 答案记录 ==========

    @PostMapping("/answer")

    public Map<String, String> logAnswer(@RequestBody AnswerRecord a) {

        service.logAnswer(a);

        return Map.of("status", "recorded", "session_id", a.sessionId);

    }



    // ========== 结局提交 ==========

    @PostMapping("/result")

    public Map<String, Object> submitResult(@RequestBody Map<String, Object> body) {

        String sessionId = (String) body.get("session_id");

        double fearScore = body.get("fear_score") instanceof Number ? ((Number) body.get("fear_score")).doubleValue() : 0.0;

        String endingType = (String) body.get("ending_type");

        @SuppressWarnings("unchecked")

        List<Map<String, Object>> answers = (List<Map<String, Object>>) body.get("answers");

        return service.submitResult(sessionId, fearScore, endingType, answers);

    }



    // ========== 排行榜 ==========

    @GetMapping("/leaderboard")

    public Map<String, Object> getLeaderboard(@RequestParam(defaultValue = "10") int limit) {

        return service.getLeaderboard(limit);

    }



    // ========== 全局统计 ==========

    @GetMapping("/stats")

    public Map<String, Object> getStats() {

        return service.getStats();

    }



    // ========== 成就系统 ==========

    @GetMapping("/achievements")

    public Map<String, Object> getAchievements() {

        return Map.of("achievements", service.getAllAchievements());

    }



    @GetMapping("/player_achievements/{playerId}")

    public Map<String, Object> getPlayerAchievements(@PathVariable String playerId) {

        return Map.of(

            "player_id", playerId,

            "achievements", service.getPlayerAchievements(playerId),

            "total_unlocked", service.getPlayerAchievementCount(playerId)

        );

    }



    @PostMapping("/achievement/unlock")

    public Map<String, Object> unlockAchievement(@RequestBody Map<String, String> body) {

        String playerId = body.get("player_id");

        String code = body.get("code");

        String sessionId = body.get("session_id");

        return service.unlockAchievement(playerId, code, sessionId);

    }



    // ========== 结局列表 ==========

    @GetMapping("/endings")

    public Map<String, Object> getEndings() {

        return Map.of("endings", service.getAllEndings());

    }



    @GetMapping("/endings/{code}")

    public Object getEnding(@PathVariable String code) {

        EndingRecord e = service.getEndingByCode(code);

        if (e == null) return Map.of("error", "结局不存在。");

        return Dtos.EndingResponse.from(e);

    }

}

