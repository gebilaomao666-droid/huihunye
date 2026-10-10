package com.horror.h5.service;



import com.horror.h5.entity.*;

import com.horror.h5.repository.*;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.PageRequest;



import java.time.LocalDateTime;

import java.util.*;



@Service

@Transactional   // 类级读写事务: 所有写方法 (submitResult/logDeath/logAnswer 等) 多步写入原子化

public class GameService {



    @Autowired private SessionInfoRepository sessionRepo;

    @Autowired private ProgressRepository progressRepo;

    @Autowired private DeathRecordRepository deathRepo;

    @Autowired private LastWordRepository lastWordRepo;

    @Autowired private NodeStatsRepository nodeStatsRepo;

    @Autowired private EventRecordRepository eventRepo;

    @Autowired private AnswerRecordRepository answerRepo;

    @Autowired private EndingRecordRepository endingRepo;
    @Autowired private AchievementRepository achievementRepo;
    @Autowired private PlayerAchievementRepository playerAchievementRepo;



    // ========== 会话 ==========

    public SessionInfo createSession(String userAgent, String ipAddress, String name) {

        SessionInfo s = new SessionInfo();

        s.sessionId = UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        s.userAgent = userAgent;

        s.ipAddress = ipAddress;

        s.name = (name == null || name.isEmpty()) ? "匿名" : name;

        s.startedAt = LocalDateTime.now();

        return sessionRepo.save(s);

    }



    public SessionInfo getSession(String sessionId) {

        return sessionRepo.findBySessionId(sessionId);

    }



    public SessionInfo updateSession(SessionInfo session) {

        return sessionRepo.save(session);

    }



    // ========== 进度存档 ==========

    public void saveProgress(Progress p) {

        Progress existing = progressRepo.findBySessionId(p.sessionId);

        if (existing != null) {

            existing.nodeId = p.nodeId;

            existing.chapter = p.chapter;

            existing.timeInGame = p.timeInGame;

            existing.choicePath = p.choicePath;

            existing.ghostOpacity = p.ghostOpacity;

            existing.inventory = p.inventory;

            existing.flags = p.flags;

            existing.updatedAt = LocalDateTime.now();

            progressRepo.save(existing);

        } else {

            p.updatedAt = LocalDateTime.now();

            progressRepo.save(p);

        }

    }



    public Progress getProgress(String sessionId) {

        return progressRepo.findBySessionId(sessionId);

    }



    // ========== 死亡计数器 ==========

    public long getDeathCount() {

        return deathRepo.count();

    }



    // ========== 死亡档案 ==========

    public void logDeath(DeathRecord d) {

        deathRepo.save(d);

        // 更新节点统计: 原子 upsert+自增 (避免读-改-写丢更新与并发首插撞唯一约束)
        // visits 不在死亡时累加: 进入节点时 /node_visit 已记一次, 避免重复计数导致死亡率失真

        nodeStatsRepo.upsertDeath(d.nodeId);

        // 更新会话死亡计数

        SessionInfo s = sessionRepo.findBySessionId(d.sessionId);

        if (s != null) {

            s.deathCount = (s.deathCount == null ? 0 : s.deathCount) + 1;

            sessionRepo.save(s);

        }

    }



    public DeathRecord getLastDeath() {

        return deathRepo.findTopByOrderByDiedAtDesc();

    }



    // ========== 遗言录音带 ==========

    public void submitLastWord(String sessionId, String content, String endingName, String playerName) {

        if (content == null || content.isBlank()) return;   // 空遗言不存

        if (content.length() > 255) content = content.substring(0, 255);   // 防超长撑爆列

        LastWord lw = new LastWord();

        lw.sessionId = sessionId;

        lw.content = content;

        lw.endingName = (endingName != null && endingName.length() > 64) ? endingName.substring(0, 64) : endingName;

        lw.playerName = (playerName == null || playerName.isEmpty()) ? "匿名"

                : (playerName.length() > 64 ? playerName.substring(0, 64) : playerName);

        lastWordRepo.save(lw);

    }



    public LastWord getRandomLastWord() {

        long count = lastWordRepo.count();

        if (count == 0) return null;

        int idx = new Random().nextInt((int) count);

        // 避免 findAll() 全表载入内存: 用分页只取随机偏移处的一行

        return lastWordRepo.findAll(PageRequest.of(idx, 1)).getContent().get(0);

    }



    // ========== 节点统计 ==========

    public void logNodeVisit(String nodeId) {

        nodeStatsRepo.upsertVisit(nodeId);

    }



    public void logNodePass(String nodeId) {

        nodeStatsRepo.upsertPass(nodeId);

    }



    public NodeStats getNodeStats(String nodeId) {

        NodeStats stats = nodeStatsRepo.findByNodeId(nodeId);

        return stats != null ? stats : new NodeStats();

    }



    // ========== 心跳节奏 ==========

    public Map<String, Object> getHeartbeat(String nodeId) {

        Map<String, Integer> bpmMap = new HashMap<>();

        bpmMap.put("node01", 60); bpmMap.put("node02", 65); bpmMap.put("node03", 70); bpmMap.put("node04", 75); bpmMap.put("node05", 80);

        bpmMap.put("node06", 70); bpmMap.put("node07", 75); bpmMap.put("node08", 85); bpmMap.put("node09", 90); bpmMap.put("node10", 95);

        bpmMap.put("node11", 85); bpmMap.put("node12", 90); bpmMap.put("node13", 100); bpmMap.put("node14", 110); bpmMap.put("node15", 120);

        bpmMap.put("node16", 130); bpmMap.put("node17", 140); bpmMap.put("node18", 150); bpmMap.put("node19", 160); bpmMap.put("node20", 180);

        bpmMap.put("node21", 200); bpmMap.put("node22", 210); bpmMap.put("node23", 220); bpmMap.put("node24", 230); bpmMap.put("node25", 240);

        bpmMap.put("node26", 250); bpmMap.put("node27", 260); bpmMap.put("node28", 270); bpmMap.put("node29", 280); bpmMap.put("node30", 300);

        int bpm = bpmMap.getOrDefault(nodeId, 60);

        String intensity, msg;

        if (bpm < 70) { intensity = "low"; msg = "平静。太平静了。"; }

        else if (bpm < 90) { intensity = "medium"; msg = "你听到了吗？脚步声。"; }

        else if (bpm < 120) { intensity = "high"; msg = "它就在附近。"; }

        else if (bpm < 160) { intensity = "extreme"; msg = "跑！"; }

        else if (bpm < 220) { intensity = "death"; msg = "来不及了。"; }

        else { intensity = "hell"; msg = "它已经在看着你。"; }



        Map<String, Object> result = new HashMap<>();

        result.put("bpm", bpm);

        result.put("intensity", intensity);

        result.put("message", msg);

        return result;

    }



    // ========== 在线氛围 ==========

    public Map<String, Object> getOnline() {

        long sessionCount = sessionRepo.count();

        long deathCount = deathRepo.count();

        int active = (int) sessionCount + new Random().nextInt(5, 20);

        int deaths = (int) deathCount + new Random().nextInt(0, 5);

        String[] msgs = {

            "还有人在黑暗中挣扎。",

            "纸人的名单越来越长了。",

            "老宅里不止你一个人。",

            "它们都在看着。",

            "你听到阁楼上的脚步声了吗？",

            "有人在低声念你的名字。"

        };

        Map<String, Object> result = new HashMap<>();

        result.put("active_players", active);

        result.put("recent_deaths", deaths);

        result.put("message", msgs[new Random().nextInt(msgs.length)]);

        return result;

    }



    // ========== 短信系统 ==========

    public Map<String, Object> getMessage(String nodeId) {

        Map<String, Map<String, String>> messages = new HashMap<>();

        messages.put("node06", Map.of("from", "未知号码", "content", "进门后，堂屋桌上有张纸条。记住上面的规矩，千万别回头。"));

        messages.put("node09", Map.of("from", "妈妈", "content", "别答应门外的任何人。包括我。"));

        messages.put("node13", Map.of("from", "爷爷", "content", "棺材里躺着的不是我。是那个女鬼！快跑！"));

        messages.put("node16", Map.of("from", "未知号码", "content", "你逃不掉的。回头看看我。"));

        messages.put("node17", Map.of("from", "爷爷", "content", "快跑！棺材里躺着的不是我！是那个女鬼！"));

        messages.put("node20", Map.of("from", "无服务", "content", "你跑不掉的，你回头看看我。"));

        messages.put("node22", Map.of("from", "妈妈", "content", "你在哪里？我怎么找不到你了？"));

        messages.put("node25", Map.of("from", "未知号码", "content", "你已经是这里的人了。别挣扎了。"));

        Map<String, String> msg = messages.get(nodeId);

        if (msg == null) return Map.of("has_message", false);

        return Map.of("has_message", true, "from_sender", msg.get("from"), "content", msg.get("content"), "delay_ms", new Random().nextInt(300, 1200));

    }



    // ========== 事件日志 ==========

    public void logEvent(EventRecord e) {

        eventRepo.save(e);

    }



    // ========== 答案记录 ==========

    public void logAnswer(AnswerRecord a) {

        answerRepo.save(a);

        SessionInfo s = sessionRepo.findBySessionId(a.sessionId);

        if (s != null) {

            s.choiceCount = (s.choiceCount == null ? 0 : s.choiceCount) + 1;

            sessionRepo.save(s);

        }

    }



    // ========== 结局提交 ==========

    public Map<String, Object> submitResult(String sessionId, double fearScore, String endingType, List<Map<String, Object>> answers) {

        SessionInfo s = sessionRepo.findBySessionId(sessionId);

        if (s == null) {

            return Map.of("error", "会话未找到。它不记得你了。");

        }

        if (endingType == null || endingType.isBlank()) {

            return Map.of("error", "缺少 ending_type 参数。");

        }

        if (s.endedAt != null) {

            // 已结算: 幂等返回, 不重复插入答案 / 不重复污染排行榜

            long totalC = sessionRepo.countByFearScoreIsNotNull();

            long rk = sessionRepo.countByFearScoreGreaterThan(s.fearScore != null ? s.fearScore : 0.0) + 1;

            Map<String, Object> r = new HashMap<>();

            r.put("session_id", sessionId);

            r.put("fear_score", s.fearScore);

            r.put("ending_type", s.endingType);

            r.put("report_text", s.reportText);

            r.put("rank", rk);

            r.put("total_participants", totalC);

            r.put("message", "结局已结算。");

            return r;

        }

        fearScore = Math.max(0.0, Math.min(100.0, fearScore));   // 不信任前端: 钳制到 [0,100]

        s.endedAt = LocalDateTime.now();

        s.fearScore = fearScore;

        s.endingType = endingType.toUpperCase();



        // 查找结局报告

        EndingRecord ending = endingRepo.findByEndingCode(endingType.toUpperCase());

        if (ending != null) {

            s.reportText = ending.reportText;

        }



        // 计算存活时间

        if (s.startedAt != null && s.endedAt != null) {

            s.surviveTime = (int) java.time.Duration.between(s.startedAt, s.endedAt).getSeconds();

        }



        sessionRepo.save(s);



        // 保存答案

        if (answers != null) {

            for (int i = 0; i < answers.size(); i++) {

                Map<String, Object> ans = answers.get(i);

                AnswerRecord rec = new AnswerRecord();

                rec.sessionId = sessionId;

                rec.questionIndex = i;

                rec.questionText = (String) ans.get("question_text");

                rec.choiceIndex = ans.get("choice_index") instanceof Number ? ((Number) ans.get("choice_index")).intValue() : 0;

                rec.choiceText = (String) ans.get("choice_text");

                rec.nodeId = (String) ans.get("node_id");

                rec.chapter = (String) ans.get("chapter");

                answerRepo.save(rec);

            }

        }



        long totalCompleted = sessionRepo.countByFearScoreIsNotNull();

        long rank = sessionRepo.countByFearScoreGreaterThan(fearScore) + 1;



        String[] msgs = {

            "报告已归档。不要试图删除它。",

            "数据永久保存。和你一样。",

            "服务器记得一切。即使你不记得。",

            "归档完成。它很满意。"

        };



        Map<String, Object> result = new HashMap<>();

        result.put("session_id", sessionId);

        result.put("fear_score", fearScore);

        result.put("ending_type", endingType.toUpperCase());

        result.put("report_text", s.reportText);

        result.put("rank", rank);

        result.put("total_participants", totalCompleted);

        result.put("message", msgs[new Random().nextInt(msgs.length)]);

        return result;

    }



    // ========== 排行榜 ==========

    public Map<String, Object> getLeaderboard(int limit) {

        int safeLimit = (limit > 0 && limit <= 100) ? limit : 10;

        List<SessionInfo> rows = sessionRepo.findByFearScoreIsNotNullOrderByFearScoreDesc(PageRequest.of(0, safeLimit));

        long total = sessionRepo.countByFearScoreIsNotNull();



        String[] epitaphs = {

            "一个被遗忘的名字", "凌晨三点的访客", "镜子里的陌生人",

            "没有关紧的柜门", "床底的呼吸声", "楼梯上的脚步声",

            "手机屏幕的微光", "永远打不通的电话", "最后一班地铁",

            "停电那夜的影子", "阁楼上的旧箱子", "浴室里的雾气",

            "自动播放的唱片", "走廊尽头的红光", "永远重复的噩梦",

            "窗户外面的脸", "沙发凹陷的痕迹", "冰箱里的纸条",

            "相册多出来的照片", "GPS定位的空白", "没有发送成功的消息",

            "404 Not Found", "信号丢失的第七秒", "缓存区残留意识"

        };



        List<Map<String, Object>> items = new ArrayList<>();

        int idx = 1;

        for (SessionInfo row : rows) {

            Map<String, Object> item = new HashMap<>();

            item.put("rank", idx++);

            item.put("ending_type", row.endingType != null ? row.endingType : "?");

            item.put("fear_score", row.fearScore != null ? row.fearScore : 0.0);

            item.put("created_at", row.createdAt != null ? row.createdAt.toString() : "");

            item.put("epitaph", epitaphs[new Random().nextInt(epitaphs.length)]);

            item.put("name", row.name != null ? row.name : "匿名");

            items.add(item);

        }



        return Map.of("items", items, "total", total);

    }



    // ========== 全局统计 ==========

    public Map<String, Object> getStats() {

        long totalSessions = sessionRepo.count();

        long completed = sessionRepo.countByFearScoreIsNotNull();



        List<SessionInfo> allCompleted = sessionRepo.findByEndingTypeIsNotNullOrderByEndedAtDesc();

        double avgScore = 0.0;

        if (!allCompleted.isEmpty()) {

            avgScore = allCompleted.stream()

                .filter(s -> s.fearScore != null)

                .mapToDouble(s -> s.fearScore)

                .average().orElse(0.0);

        }



        Map<String, Long> dist = new HashMap<>();

        for (String et : List.of("A", "B", "C", "D", "E", "F", "G", "H")) {

            long cnt = allCompleted.stream().filter(s -> et.equals(s.endingType)).count();

            dist.put(et, cnt);

        }



        String[] epitaphs = {

            "一个被遗忘的名字", "凌晨三点的访客", "镜子里的陌生人",

            "没有关紧的柜门", "床底的呼吸声", "楼梯上的脚步声"

        };



        Map<String, Object> result = new HashMap<>();

        result.put("total_sessions", totalSessions);

        result.put("total_completed", completed);

        result.put("avg_fear_score", Math.round(avgScore * 100.0) / 100.0);

        result.put("ending_distribution", dist);

        result.put("latest_epitaph", epitaphs[new Random().nextInt(epitaphs.length)]);

        result.put("total_deaths", deathRepo.count());

        return result;

    }



    // ========== 成就系统 ==========
    public void initAchievements() {
        if (achievementRepo.count() > 0) return;
        List<Achievement> list = new ArrayList<>();
        list.add(makeAchievement("first_blood", "初体验", "第一次面对死亡", "💀", "common", false, "死亡一次"));
        list.add(makeAchievement("survivor", "幸存者", "第一次活着走出老宅", "🏠", "common", false, "通关一次"));
        list.add(makeAchievement("collector", "收藏家", "解锁3个不同结局", "📚", "rare", false, "解锁3个结局"));
        list.add(makeAchievement("master", "全结局大师", "解锁所有8个结局", "👑", "legendary", false, "解锁全部结局"));
        list.add(makeAchievement("brave_heart", "勇敢的心", "在屏息环节成功3次", "🫁", "rare", false, "屏息成功3次"));
        list.add(makeAchievement("night_owl", "夜猫子", "在凌晨03:33开始游戏", "🌙", "epic", true, "???"));
        list.add(makeAchievement("speedrunner", "速通者", "30分钟内完成游戏", "⏱️", "epic", false, "30分钟内通关"));
        list.add(makeAchievement("ghost_buster", "驱鬼人", "收集所有道具", "🧿", "rare", false, "收集全部道具"));
        list.add(makeAchievement("tab_hopper", "三心二意", "切换标签页3次仍存活", "📑", "common", false, "切标签3次并通关"));
        list.add(makeAchievement("legacy", "传承者", "在黄裱纸上留下遗言", "📝", "common", false, "提交遗言"));
        achievementRepo.saveAll(list);
    }

    private Achievement makeAchievement(String code, String name, String desc, String icon, String rarity, Boolean secret, String hint) {
        Achievement a = new Achievement();
        a.achievementCode = code;
        a.name = name;
        a.description = desc;
        a.icon = icon;
        a.rarity = rarity;
        a.secret = secret;
        a.unlockHint = hint;
        return a;
    }

    public List<Map<String, Object>> getAllAchievements() {
        initAchievements();
        List<Achievement> all = achievementRepo.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Achievement a : all) {
            Map<String, Object> m = new HashMap<>();
            m.put("code", a.achievementCode);
            m.put("name", a.name);
            m.put("description", a.description);
            m.put("icon", a.icon);
            m.put("rarity", a.rarity);
            m.put("secret", a.secret);
            m.put("unlock_hint", a.unlockHint);
            result.add(m);
        }
        return result;
    }

    public List<Map<String, Object>> getPlayerAchievements(String playerId) {
        List<PlayerAchievement> unlocked = playerAchievementRepo.findByPlayerId(playerId);
        List<Achievement> all = achievementRepo.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        Set<String> unlockedCodes = new HashSet<>();
        Map<String, LocalDateTime> unlockTimes = new HashMap<>();
        for (PlayerAchievement pa : unlocked) {
            unlockedCodes.add(pa.achievementCode);
            unlockTimes.put(pa.achievementCode, pa.unlockedAt);
        }
        for (Achievement a : all) {
            Map<String, Object> m = new HashMap<>();
            boolean isUnlocked = unlockedCodes.contains(a.achievementCode);
            m.put("code", a.achievementCode);
            m.put("name", isUnlocked || !a.secret ? a.name : "???");
            m.put("description", isUnlocked || !a.secret ? a.description : "这是一个秘密成就。");
            m.put("icon", isUnlocked ? a.icon : "🔒");
            m.put("rarity", a.rarity);
            m.put("secret", a.secret);
            m.put("unlocked", isUnlocked);
            m.put("unlock_hint", a.unlockHint);
            if (isUnlocked) m.put("unlocked_at", unlockTimes.get(a.achievementCode).toString());
            result.add(m);
        }
        return result;
    }

    public Map<String, Object> unlockAchievement(String playerId, String code, String sessionId) {
        initAchievements();
        Achievement a = achievementRepo.findByAchievementCode(code);
        if (a == null) return Map.of("error", "成就不存在。");
        PlayerAchievement existing = playerAchievementRepo.findByPlayerIdAndAchievementCode(playerId, code);
        if (existing != null) return Map.of("status", "already_unlocked", "code", code);
        PlayerAchievement pa = new PlayerAchievement();
        pa.playerId = playerId;
        pa.achievementCode = code;
        pa.unlockedAt = LocalDateTime.now();
        pa.sessionId = sessionId;
        playerAchievementRepo.save(pa);
        return Map.of("status", "unlocked", "code", code, "name", a.name, "icon", a.icon);
    }

    public long getPlayerAchievementCount(String playerId) {
        return playerAchievementRepo.countByPlayerId(playerId);
    }

    // ========== 结局列表 ==========

    public List<EndingRecord> getAllEndings() {

        return endingRepo.findAll();

    }



    public EndingRecord getEndingByCode(String code) {

        return endingRepo.findByEndingCode(code.toUpperCase());

    }

}

