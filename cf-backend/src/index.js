// 回魂夜 后端：Cloudflare Worker + D1
// 接口路径、请求体、返回字段与 java-backend 的 /api 契约一致（snake_case），前端不用改调用。
// 任何失败都返回 JSON，前端 api.js 遇到非 2xx/非 JSON 会自动进离线模式。

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

// 允许的前端来源：GitHub Pages、本地调试
function corsHeaders(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allow = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const ok = allow.length === 0 || allow.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    return {
        'Access-Control-Allow-Origin': ok ? origin || '*' : 'null',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
    };
}

const json = (data, status = 200, extra = {}) =>
    new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extra } });

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo));
const clip = (s, n) => (typeof s === 'string' && s.length > n ? s.slice(0, n) : s);
const str = (v, n = 255) => (v == null ? null : clip(String(v), n));
const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

function newSessionId() {
    const b = new Uint8Array(8);
    crypto.getRandomValues(b);
    return [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

async function readBody(req) {
    try {
        const t = await req.text();
        if (!t) return {};
        const v = JSON.parse(t);
        return v && typeof v === 'object' ? v : {};
    } catch (e) {
        return {};
    }
}

// ---------------- 各接口 ----------------

async function createSession(db, body, req) {
    const sid = newSessionId();
    const name = str(body.name, 64) || '匿名';
    const ip = req.headers.get('CF-Connecting-IP') || '';
    await db.prepare('INSERT INTO sessions (session_id, ip_address, user_agent, name) VALUES (?1, ?2, ?3, ?4)')
        .bind(sid, ip, str(body.user_agent, 512), name).run();
    const row = await db.prepare('SELECT started_at FROM sessions WHERE session_id = ?1').bind(sid).first();
    return { session_id: sid, started_at: row ? row.started_at : now(), message: '它已注意到你。' };
}

async function getSession(db, sid) {
    const s = await db.prepare('SELECT session_id, name, started_at, fear_score, ending_type, death_count FROM sessions WHERE session_id = ?1').bind(sid).first();
    if (!s) return { error: '会话不存在。' };
    return s;
}

async function saveProgress(db, b) {
    const sid = str(b.session_id, 64), node = str(b.node_id, 64);
    if (!sid || !node) return { error: '缺少 session_id 或 node_id' };
    await db.prepare(`INSERT INTO progress (session_id, node_id, chapter, time_in_game, choice_path, ghost_opacity, inventory, flags, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
        ON CONFLICT(session_id) DO UPDATE SET node_id = excluded.node_id, chapter = excluded.chapter, time_in_game = excluded.time_in_game,
            choice_path = excluded.choice_path, ghost_opacity = excluded.ghost_opacity, inventory = excluded.inventory, flags = excluded.flags, updated_at = excluded.updated_at`)
        .bind(sid, node, str(b.chapter, 64), str(b.time_in_game, 16), str(b.choice_path, 20000),
            typeof b.ghost_opacity === 'number' ? b.ghost_opacity : 0.01, str(b.inventory, 20000), str(b.flags, 20000), now()).run();
    return { status: 'saved', session_id: sid, node };
}

async function getProgress(db, sid) {
    const p = await db.prepare('SELECT session_id, node_id, chapter, time_in_game, choice_path, ghost_opacity, inventory, flags, updated_at AS saved_at FROM progress WHERE session_id = ?1').bind(sid).first();
    if (!p) return { error: '没有存档。也许你从未踏入过那扇门。' };
    return p;
}

async function deathCount(db) {
    const r = await db.prepare('SELECT COUNT(*) AS c FROM deaths').first();
    return { count: r ? r.c : 0 };
}

async function logDeath(db, b) {
    const sid = str(b.session_id, 64), node = str(b.node_id, 64), name = str(b.death_name, 64) || '未知';
    if (!sid || !node) return { error: '缺少 session_id 或 node_id' };
    await db.batch([
        db.prepare('INSERT INTO deaths (session_id, node_id, death_name, death_desc, chapter) VALUES (?1, ?2, ?3, ?4, ?5)')
            .bind(sid, node, name, str(b.death_desc, 1000), str(b.chapter, 64)),
        db.prepare('INSERT INTO node_stats (node_id, deaths) VALUES (?1, 1) ON CONFLICT(node_id) DO UPDATE SET deaths = deaths + 1, updated_at = ?2').bind(node, now()),
        db.prepare('UPDATE sessions SET death_count = death_count + 1, updated_at = ?2 WHERE session_id = ?1').bind(sid, now())
    ]);
    return { session_id: sid, death_name: name, message: pick(['又一个人留在了老宅里。', '纸人名单中多了一个名字。', '黄裱纸上的朱砂还未干透。', '它很满意。']) };
}

async function lastDeath(db) {
    const d = await db.prepare('SELECT session_id, death_name, death_desc, chapter, died_at FROM deaths ORDER BY id DESC LIMIT 1').first();
    if (!d) return { error: '暂无死亡记录。你是第一个。' };
    return d;
}

async function submitLastWord(db, b) {
    const content = typeof b.content === 'string' ? b.content.trim() : '';
    if (!content) return { status: 'ignored', message: '空遗言不存。' };
    await db.prepare('INSERT INTO last_words (session_id, content, ending_name, player_name) VALUES (?1, ?2, ?3, ?4)')
        .bind(str(b.session_id, 64), clip(content, 255), str(b.ending_name, 64), str(b.player_name, 64) || '匿名').run();
    return { status: 'saved', message: '你的遗言已被封入黄裱纸。' };
}

async function randomLastWord(db) {
    const lw = await db.prepare('SELECT content, ending_name, player_name, created_at FROM last_words ORDER BY RANDOM() LIMIT 1').first();
    if (!lw) return { has_word: false };
    return { has_word: true, ...lw };
}

async function bumpNode(db, b, col) {
    const node = str(b.node_id, 64);
    if (!node) return { error: '缺少 node_id' };
    await db.prepare(`INSERT INTO node_stats (node_id, ${col}) VALUES (?1, 1) ON CONFLICT(node_id) DO UPDATE SET ${col} = ${col} + 1, updated_at = ?2`).bind(node, now()).run();
    return { status: 'ok', node_id: node };
}

async function nodeStats(db, node) {
    const s = (await db.prepare('SELECT visits, deaths, passes FROM node_stats WHERE node_id = ?1').bind(node).first()) || { visits: 0, deaths: 0, passes: 0 };
    const total = Math.max(s.visits, 1);
    return { node_id: node, visits: s.visits, deaths: s.deaths, passes: s.passes,
        survival_rate: Math.round((s.passes / total) * 1000) / 10, death_rate: Math.round((s.deaths / total) * 1000) / 10 };
}

async function logEvent(db, b) {
    const sid = str(b.session_id, 64);
    if (!sid) return { error: '缺少 session_id' };
    await db.prepare('INSERT INTO events (session_id, event_type, node_id, payload) VALUES (?1, ?2, ?3, ?4)')
        .bind(sid, str(b.event_type, 32) || 'unknown', str(b.node_id, 64), str(b.payload, 4000)).run();
    return { status: 'recorded', session_id: sid };
}

async function logAnswer(db, b) {
    const sid = str(b.session_id, 64);
    if (!sid) return { error: '缺少 session_id' };
    await db.batch([
        db.prepare('INSERT INTO answers (session_id, question_index, question_text, choice_index, choice_text, node_id, chapter) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)')
            .bind(sid, Number(b.question_index) || 0, str(b.question_text, 1000), Number(b.choice_index) || 0, str(b.choice_text, 1000), str(b.node_id, 64), str(b.chapter, 64)),
        db.prepare('UPDATE sessions SET choice_count = choice_count + 1 WHERE session_id = ?1').bind(sid)
    ]);
    return { status: 'recorded', session_id: sid };
}

async function submitResult(db, b) {
    const sid = str(b.session_id, 64);
    const s = sid && await db.prepare('SELECT * FROM sessions WHERE session_id = ?1').bind(sid).first();
    if (!s) return { error: '会话未找到。它不记得你了。' };
    const endingType = typeof b.ending_type === 'string' ? b.ending_type.trim().toUpperCase().slice(0, 16) : '';
    if (!endingType) return { error: '缺少 ending_type 参数。' };
    const rankOf = async (score) => {
        const t = await db.prepare('SELECT COUNT(*) AS c FROM sessions WHERE fear_score IS NOT NULL').first();
        const r = await db.prepare('SELECT COUNT(*) AS c FROM sessions WHERE fear_score > ?1').bind(score).first();
        return { total: t.c, rank: r.c + 1 };
    };
    if (s.ended_at) {
        const { total, rank } = await rankOf(s.fear_score || 0);
        return { session_id: sid, fear_score: s.fear_score, ending_type: s.ending_type, rank, total_participants: total, message: '结局已结算。' };
    }
    const fear = Math.max(0, Math.min(100, Number(b.fear_score) || 0));
    const endedAt = now();
    const started = Date.parse((s.started_at || '').replace(' ', 'T') + 'Z');
    const survive = Number.isFinite(started) ? Math.max(0, Math.round((Date.now() - started) / 1000)) : 0;
    const stmts = [
        db.prepare('UPDATE sessions SET ended_at = ?2, fear_score = ?3, ending_type = ?4, survive_time = ?5, updated_at = ?2 WHERE session_id = ?1')
            .bind(sid, endedAt, fear, endingType, survive)
    ];
    if (Array.isArray(b.answers)) {
        b.answers.slice(0, 200).forEach((a, i) => {
            if (!a || typeof a !== 'object') return;
            stmts.push(db.prepare('INSERT INTO answers (session_id, question_index, question_text, choice_index, choice_text, node_id, chapter) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)')
                .bind(sid, i, str(a.question_text, 1000), Number(a.choice_index) || 0, str(a.choice_text, 1000), str(a.node_id, 64), str(a.chapter, 64)));
        });
    }
    await db.batch(stmts);
    const { total, rank } = await rankOf(fear);
    return { session_id: sid, fear_score: fear, ending_type: endingType, rank, total_participants: total,
        message: pick(['报告已归档。不要试图删除它。', '数据永久保存。和你一样。', '服务器记得一切。即使你不记得。', '归档完成。它很满意。']) };
}

async function leaderboard(db, limit) {
    const n = limit > 0 && limit <= 100 ? limit : 10;
    const rows = (await db.prepare('SELECT name, ending_type, fear_score, created_at FROM sessions WHERE fear_score IS NOT NULL ORDER BY fear_score DESC, id ASC LIMIT ?1').bind(n).all()).results || [];
    const total = (await db.prepare('SELECT COUNT(*) AS c FROM sessions WHERE fear_score IS NOT NULL').first()).c;
    const epitaphs = ['一个被遗忘的名字', '凌晨三点的访客', '镜子里的陌生人', '没有关紧的柜门', '床底的呼吸声', '楼梯上的脚步声', '手机屏幕的微光', '永远打不通的电话', '最后一班车', '停电那夜的影子'];
    return { items: rows.map((r, i) => ({ rank: i + 1, name: r.name || '匿名', ending_type: r.ending_type || '?', fear_score: r.fear_score || 0, created_at: r.created_at || '', epitaph: pick(epitaphs) })), total };
}

async function stats(db) {
    const a = await db.prepare('SELECT COUNT(*) AS total, COUNT(fear_score) AS completed, AVG(fear_score) AS avg FROM sessions').first();
    const d = await db.prepare('SELECT COUNT(*) AS c FROM deaths').first();
    const dist = {};
    for (const k of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) dist[k] = 0;
    const rows = (await db.prepare('SELECT ending_type AS k, COUNT(*) AS c FROM sessions WHERE ending_type IS NOT NULL GROUP BY ending_type').all()).results || [];
    for (const r of rows) if (r.k in dist) dist[r.k] = r.c;
    return {
        total_sessions: a.total, total_completed: a.completed,
        avg_fear_score: Math.round((a.avg || 0) * 100) / 100,
        ending_distribution: dist, total_deaths: d.c,
        latest_epitaph: pick(['一个被遗忘的名字', '凌晨三点的访客', '镜子里的陌生人', '没有关紧的柜门', '床底的呼吸声', '楼梯上的脚步声'])
    };
}

async function online(db) {
    const s = await db.prepare('SELECT COUNT(*) AS c FROM sessions WHERE started_at > datetime(\'now\', \'-1 hour\')').first();
    const d = await db.prepare('SELECT COUNT(*) AS c FROM deaths WHERE died_at > datetime(\'now\', \'-1 day\')').first();
    return {
        active_players: s.c + randInt(5, 20), recent_deaths: d.c + randInt(0, 5),
        message: pick(['还有人在黑暗中挣扎。', '纸人的名单越来越长了。', '老宅里不止你一个人。', '它们都在看着。', '你听到阁楼上的脚步声了吗？', '有人在低声念你的名字。'])
    };
}

async function playerAchievements(db, pid) {
    const rows = (await db.prepare('SELECT achievement_code AS code, unlocked_at FROM player_achievements WHERE player_id = ?1').bind(pid).all()).results || [];
    return { player_id: pid, achievements: rows.map((r) => ({ code: r.code, unlocked: true, unlocked_at: r.unlocked_at })), total_unlocked: rows.length };
}

async function unlockAchievement(db, b) {
    const pid = str(b.player_id, 64), code = str(b.code, 32);
    if (!pid || !code) return { error: '缺少 player_id 或 code' };
    const r = await db.prepare('INSERT OR IGNORE INTO player_achievements (player_id, achievement_code, session_id) VALUES (?1, ?2, ?3)').bind(pid, code, str(b.session_id, 64)).run();
    return r.meta && r.meta.changes > 0 ? { status: 'unlocked', code } : { status: 'already_unlocked', code };
}

// ---------------- 路由 ----------------

async function route(req, env) {
    const db = env.DB;
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '');
    const m = req.method;
    const seg = path.split('/').filter(Boolean);   // ['api', ...]
    if (seg[0] !== 'api') return json({ error: 'not found' }, 404);
    const rest = seg.slice(1);
    const body = m === 'POST' ? await readBody(req) : null;

    if (m === 'GET' && rest.join('/') === 'health') return json({ status: 'alive', whisper: '它没睡。' });
    if (m === 'POST' && rest.join('/') === 'session') return json(await createSession(db, body, req));
    if (m === 'GET' && rest[0] === 'session' && rest[1]) return json(await getSession(db, decodeURIComponent(rest[1])));
    if (m === 'POST' && rest.join('/') === 'progress') return json(await saveProgress(db, body));
    if (m === 'GET' && rest[0] === 'progress' && rest[1]) return json(await getProgress(db, decodeURIComponent(rest[1])));
    if (m === 'GET' && rest.join('/') === 'death-count') return json(await deathCount(db));
    if (m === 'POST' && rest.join('/') === 'death') return json(await logDeath(db, body));
    if (m === 'GET' && rest.join('/') === 'last_death') return json(await lastDeath(db));
    if (m === 'POST' && rest.join('/') === 'last-word') return json(await submitLastWord(db, body));
    if (m === 'GET' && rest.join('/') === 'last-word/random') return json(await randomLastWord(db));
    if (m === 'POST' && rest.join('/') === 'node_visit') return json(await bumpNode(db, body, 'visits'));
    if (m === 'POST' && rest.join('/') === 'node_pass') return json(await bumpNode(db, body, 'passes'));
    if (m === 'GET' && rest[0] === 'node_stats' && rest[1]) return json(await nodeStats(db, decodeURIComponent(rest[1])));
    if (m === 'POST' && rest.join('/') === 'event') return json(await logEvent(db, body));
    if (m === 'POST' && rest.join('/') === 'answer') return json(await logAnswer(db, body));
    if (m === 'POST' && rest.join('/') === 'result') return json(await submitResult(db, body));
    if (m === 'GET' && rest.join('/') === 'leaderboard') return json(await leaderboard(db, Number(url.searchParams.get('limit')) || 10));
    if (m === 'GET' && rest.join('/') === 'stats') return json(await stats(db));
    if (m === 'GET' && rest.join('/') === 'online') return json(await online(db));
    if (m === 'GET' && rest[0] === 'player_achievements' && rest[1]) return json(await playerAchievements(db, decodeURIComponent(rest[1])));
    if (m === 'POST' && rest.join('/') === 'achievement/unlock') return json(await unlockAchievement(db, body));
    return json({ error: 'not found' }, 404);
}

export default {
    async fetch(req, env) {
        const cors = corsHeaders(req, env);
        if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
        let res;
        try {
            res = await route(req, env);
        } catch (e) {
            res = json({ error: '它出了点问题。', detail: String(e && e.message || e) }, 500);
        }
        const h = new Headers(res.headers);
        for (const [k, v] of Object.entries(cors)) h.set(k, v);
        h.set('Cache-Control', 'no-store');
        return new Response(res.body, { status: res.status, headers: h });
    }
};
