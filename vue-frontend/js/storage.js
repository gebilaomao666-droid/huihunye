// 统一管理所有 hhs_ 前缀的 localStorage 读写。
// 目标: 键名集中一处 + JSON 解析统一兜底 (损坏数据返回默认值并清掉, 不抛异常导致整页白屏)。

const KEYS = {
    session: 'hhs_session',
    ghost: 'hhs_ghost',
    saves: 'hhs_saves',
    endings: 'hhs_endings',
    achievements: 'hhs_achievements',
    rpgStats: 'hhs_rpg_stats',
    deathCount: 'hhs_death_count',
    settings: 'hhs_settings',
    checkpoint: 'hhs_checkpoint',
    run: 'hhs_run',            // 本地续玩快照(节点/道具/flag/属性/路径/ghost), 无后端也能"继续上次"
    lang: 'hhs_lang',
    deathsSeen: 'hhs_deaths_seen',
    playerId: 'hhs_player_id',
    epitaphs: 'hhs_epitaphs',   // 收集册「墓志铭」: 自己封入黄裱纸的遗言(离线也存)
};

function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw == null ? fallback : JSON.parse(raw);
    } catch (e) {
        // 数据损坏: 清掉坏值并返回默认, 避免 JSON.parse 抛错使 mounted 中断、整页卡 loading
        try { localStorage.removeItem(key); } catch (_) {}
        return fallback;
    }
}

function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

function readRaw(key, fallback = null) {
    // 浏览器禁用存储(隐私模式/禁 Cookie)时 localStorage 访问会直接抛 SecurityError, 必须兜住
    try {
        const v = localStorage.getItem(key);
        return v == null ? fallback : v;
    } catch (e) {
        return fallback;
    }
}

function writeRaw(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
}

function remove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
}

export { KEYS, readJSON, writeJSON, readRaw, writeRaw, remove };
