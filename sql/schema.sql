-- ============================================
-- 回魂夜 · 回魂夜游戏 - 数据库表结构
-- MySQL 8.0
-- ============================================

CREATE DATABASE IF NOT EXISTS horror_game
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE horror_game;

-- 1. 会话表（玩家档案）
CREATE TABLE IF NOT EXISTS sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL UNIQUE COMMENT '前端会话ID',
    ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
    user_agent TEXT DEFAULT NULL COMMENT '浏览器UA',
    name VARCHAR(64) DEFAULT NULL COMMENT '玩家昵称',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
    ended_at DATETIME DEFAULT NULL COMMENT '结束时间',
    fear_score DECIMAL(5,2) DEFAULT NULL COMMENT '恐惧值 0-100',
    ending_type VARCHAR(16) DEFAULT NULL COMMENT '结局类型 A/B/C/D/E/...',
    report_text TEXT DEFAULT NULL COMMENT '结局报告文本',
    choice_count INT DEFAULT 0 COMMENT '总选择次数',
    death_count INT DEFAULT 0 COMMENT '死亡次数',
    survive_time INT DEFAULT 0 COMMENT '存活时长（秒）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_started_at (started_at),
    INDEX idx_ending_type (ending_type),
    INDEX idx_fear_score (fear_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='玩家会话表';

-- 2. 事件日志表（埋点分析）
CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    event_type VARCHAR(32) NOT NULL COMMENT '事件类型：enter_node/click_choice/death/jumpscare/etc',
    node_id VARCHAR(32) DEFAULT NULL COMMENT '节点ID',
    payload JSON DEFAULT NULL COMMENT '扩展JSON数据',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='事件日志表';

-- 3. 答题/选择记录表
CREATE TABLE IF NOT EXISTS answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    question_index INT NOT NULL COMMENT '题目序号',
    question_text TEXT DEFAULT NULL COMMENT '题目文本',
    choice_index INT NOT NULL COMMENT '选项索引',
    choice_text TEXT DEFAULT NULL COMMENT '选项文本',
    node_id VARCHAR(32) DEFAULT NULL COMMENT '当前节点',
    chapter VARCHAR(64) DEFAULT NULL COMMENT '章节名',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_node_id (node_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='选择记录表';

-- 4. 进度存档表
CREATE TABLE IF NOT EXISTS progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    node_id VARCHAR(32) NOT NULL COMMENT '当前节点ID',
    chapter VARCHAR(64) DEFAULT NULL COMMENT '当前章节',
    time_in_game VARCHAR(16) DEFAULT NULL COMMENT '游戏内时间 如 23:30',
    choice_path JSON DEFAULT NULL COMMENT '选择路径 [node01,node02,...]',
    ghost_opacity DECIMAL(4,3) DEFAULT 0.010 COMMENT '女鬼背景不透明度 0-1',
    inventory JSON DEFAULT NULL COMMENT '背包物品',
    flags JSON DEFAULT NULL COMMENT '剧情标记',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_session_id (session_id),
    INDEX idx_node_id (node_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='进度存档表';

-- 5. 死亡记录表
CREATE TABLE IF NOT EXISTS deaths (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    node_id VARCHAR(32) NOT NULL COMMENT '死亡节点',
    death_name VARCHAR(64) NOT NULL COMMENT '死亡名称',
    death_desc TEXT DEFAULT NULL COMMENT '死亡描述',
    chapter VARCHAR(64) DEFAULT NULL COMMENT '章节',
    died_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_node_id (node_id),
    INDEX idx_died_at (died_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='死亡记录表';

-- 6. 节点统计表
CREATE TABLE IF NOT EXISTS node_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    node_id VARCHAR(32) NOT NULL UNIQUE COMMENT '节点ID',
    visits INT DEFAULT 0 COMMENT '访问次数',
    deaths INT DEFAULT 0 COMMENT '死亡次数',
    passes INT DEFAULT 0 COMMENT '通过次数',
    avg_stay_seconds INT DEFAULT 0 COMMENT '平均停留秒数',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='节点统计表';

-- 7. 遗言表
CREATE TABLE IF NOT EXISTS last_words (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) DEFAULT NULL COMMENT '会话ID',
    content VARCHAR(255) NOT NULL COMMENT '遗言内容',
    ending_name VARCHAR(64) DEFAULT NULL COMMENT '结局名',
    player_name VARCHAR(64) DEFAULT '匿名' COMMENT '玩家名',
    likes INT DEFAULT 0 COMMENT '点赞数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='遗言表';

-- 8. 结局定义表
CREATE TABLE IF NOT EXISTS endings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ending_code VARCHAR(16) NOT NULL UNIQUE COMMENT '结局编码 A/B/C/D/E/...',
    ending_name VARCHAR(64) NOT NULL COMMENT '结局名称',
    title VARCHAR(128) DEFAULT NULL COMMENT '结局标题',
    report_text TEXT NOT NULL COMMENT '结局报告正文',
    fear_score_min DECIMAL(5,2) DEFAULT 0 COMMENT '最低恐惧值',
    fear_score_max DECIMAL(5,2) DEFAULT 100 COMMENT '最高恐惧值',
    rarity VARCHAR(16) DEFAULT 'common' COMMENT '稀有度 common/rare/epic/legendary',
    unlock_hint VARCHAR(255) DEFAULT NULL COMMENT '解锁提示',
    ending_image VARCHAR(128) DEFAULT NULL COMMENT '结局图片',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='结局定义表';

-- 9. 玩家背包/物品表（增加收集要素）
CREATE TABLE IF NOT EXISTS player_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    item_code VARCHAR(32) NOT NULL COMMENT '物品编码',
    item_name VARCHAR(64) NOT NULL COMMENT '物品名称',
    item_desc VARCHAR(255) DEFAULT NULL COMMENT '物品描述',
    acquired_at VARCHAR(32) DEFAULT NULL COMMENT '获得节点',
    used BOOLEAN DEFAULT FALSE COMMENT '是否已使用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_session_item (session_id, item_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='玩家物品表';

-- 10. 成就表
CREATE TABLE IF NOT EXISTS achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    achievement_code VARCHAR(32) NOT NULL UNIQUE COMMENT '成就编码',
    achievement_name VARCHAR(64) NOT NULL COMMENT '成就名称',
    achievement_desc VARCHAR(255) NOT NULL COMMENT '成就描述',
    icon VARCHAR(64) DEFAULT NULL COMMENT '图标',
    rarity VARCHAR(16) DEFAULT 'common' COMMENT '稀有度',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成就定义表';

-- 11. 玩家成就关联表
CREATE TABLE IF NOT EXISTS player_achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    achievement_code VARCHAR(32) NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_session_achievement (session_id, achievement_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='玩家成就表';

-- ============================================
-- 初始化数据
-- ============================================

-- 初始化结局定义
INSERT INTO endings (ending_code, ending_name, title, report_text, fear_score_min, fear_score_max, rarity, unlock_hint, ending_image) VALUES
('A', '红鸾星动（冥）', '【黄裱纸上的批字】', '八字极阴，命带孤辰。\n你推开的不是网页，是那扇掉漆的木门。\n\n纸人早在香案前写好了你的名字，\n每一根红烛都是你的喜烛，每一缕青烟都是你的婚书。\n\n判词：良缘天定\n批注：不要独自走夜路。尤其是经过老宅的时候。尤其是听到唢呐声的时候。', 0, 30, 'common', '在第一章做出所有"谨慎"的选择', 'endingA.png'),
('B', '鬼媒牵线', '【黄裱纸上的批字】', '阴阳两隔，一线牵成。\n你以为你在答题，其实它在挑拣。\n而现在，你已被它选中了。\n\n那根系在你脚踝上的红线，\n另一头早已缠进了棺材底。\n\n判词：佳偶天成\n批注：不要照镜子。镜子里穿红嫁衣的，已经不会眨眼了。', 30, 50, 'common', '在第二章因为好奇触发某些事件', 'endingB.jpg'),
('C', '封棺活人', '【黄裱纸上的批字】', '阳寿未尽，阴气已入。\n你告诉自己"这不过是个游戏"。\n纸人也喜欢你这么想。\n\n那口黑漆棺材已经替你暖好了被窝，\n黄裱纸上的生辰八字，墨迹还没干。\n\n判词：先入为主\n批注：今晚熄灯前，看看床底垂着的红布后面，有没有一张涂着腮红的脸。', 50, 70, 'rare', '在第三章因违反规矩而死', 'endingC.jpg'),
('D', '借尸还魂', '【黄裱纸上的批字】', '三魂悠悠，七魄荡荡。\n你的肩膀发沉，那不是疲惫。\n\n它不会立刻带你走。它会像附身的纸人，\n慢慢地、耐心地学会你说话的语气，\n直到有一天，连你自己都分不清……\n说话的那个，还是不是你。\n\n判词：借壳生根\n批注：留意你最近三次醒来的时辰。它们会越来越靠近子时。', 70, 85, 'rare', '在第四章与纸人对视失败', 'endingD.jpg'),
('E', '冥婚已成', '【黄裱纸上的批字】', '阴阳合卺，大礼既成。\n你已经想不起自己原本的样子了。\n\n堂屋里的唢呐声停了，\n纸人们都在笑。\n\n判词：百年好合\n批注：无。你已经是这里的人了。\n\n欢迎回来。\n我们一直在等你。', 85, 100, 'epic', '通关最终章到达深渊注视', 'endingE.jpg'),
('F', '逃出生天', '【鸡鸣】', '你居然活到了天亮。\n公鸡打鸣的那一刻，所有纸人都僵住了。\n你趁机冲出了老宅，一路狂奔到村口。\n\n但当你回头时，老宅的门槛上，\n放着一双你的鞋。\n\n判词：暂避锋芒\n批注：下次，可就没有鸡会打鸣了。', 0, 100, 'legendary', '找到隐藏路线在第三章前逃出', NULL),
('G', '替罪羔羊', '【黄裱纸上的批字】', '你替它挡了灾。\n它用一个纸人换了你一条命。\n现在，你被困在纸里，\n而"你"正用你的手机，\n给你的朋友发消息：\n"来玩一个游戏吧，超刺激的。"\n\n判词：以命换命\n批注：如果你最近收到了这样的消息，别点开。', 0, 100, 'epic', '在特定节点触发替死事件', NULL),
('H', '守灵人', '【黄裱纸上的批字】', '你没有逃，也没有死。\n你选择了留下，接替爷爷的位置，\n成为这座老宅新的守灵人。\n\n从此每个深夜，你都要给那盏长明灯添油。\n而棺材里的那位……\n似乎已经把你当成家人了。\n\n判词：落叶归根\n批注：守灵人的任期，是一辈子。', 0, 100, 'legendary', '在所有关键节点选择"留下/不走"', NULL);

-- 初始化成就
INSERT INTO achievements (achievement_code, achievement_name, achievement_desc, icon, rarity) VALUES
('first_death', '初尝死味', '第一次死亡', '💀', 'common'),
('survivor', '幸存者', '成功通关一次', '🕯️', 'common'),
('all_deaths', '死过九回', '体验所有死亡结局', '☠️', 'rare'),
('all_endings', '全结局收集', '解锁所有结局', '📜', 'epic'),
('no_death', '无伤通关', '不死亡通关主线', '✨', 'legendary'),
('collector', '收藏家', '收集所有隐藏物品', '🎒', 'rare'),
('speedrun', '速通大师', '10分钟内通关', '⚡', 'epic'),
('night_owl', '夜猫子', '在真实时间的23:00-04:00之间游玩', '🌙', 'common'),
('curious', '好奇害死猫', '违反纸条上的规矩', '🐱', 'common'),
('brave', '勇者无畏', '面对所有Jumpscare不退出', '🦁', 'rare');
