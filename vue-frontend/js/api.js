// ===== API 封装层（超时 + 熔断 + 静默降级）=====
// 约定: 任何失败一律返回 null, 绝不抛错、不阻塞调用方。
// - 每个请求 2.5s 超时(AbortController), 后端挂起不会把页面卡死
// - 网络错误/超时/非 JSON/404: 判定后端不可用, 本次会话进入离线模式, 之后的请求直接返回 null
// - 5xx 只重试 1 次; 连续 2 次失败也进入离线模式
// - 只打一次 console.warn, 不再刷屏 console.error
const API_BASE = window.location.origin.includes('localhost')
    ? 'http://localhost:8080'
    : (window.location.origin + '');

const TIMEOUT_MS = 2500;
const FAIL_LIMIT = 2;

let offline = false;
let failStreak = 0;
let warned = false;
// 探路: 后端从未确认可用前, 只放第一个请求出去, 其余并发请求等它的结果
// (避免启动时 3 个请求同时打到不存在的后端、各报一遍错)
let confirmed = false;
let probe = null;

function goOffline(path, reason) {
    offline = true;
    if (!warned) {
        warned = true;
        console.warn('[api] 后端不可用，本次会话改为离线模式（社交功能留白）:', path, reason || '');
    }
}

function noteFailure(path, reason, fatal) {
    failStreak += 1;
    // 后端还没确认可用过: 第一次失败就判离线
    if (fatal || !confirmed || failStreak >= FAIL_LIMIT) goOffline(path, reason);
}

async function request(method, path, body) {
    if (offline) return null;
    if (!confirmed) {
        if (probe) {
            await probe;
            if (offline) return null;
        } else {
            let release;
            probe = new Promise((r) => { release = r; });
            try {
                return await doRequest(method, path, body);
            } finally {
                release();
            }
        }
    }
    return doRequest(method, path, body);
}

async function doRequest(method, path, body) {
    if (offline) return null;
    for (let attempt = 0; attempt < 2; attempt++) {
        if (offline) return null;
        let timer = null;
        try {
            const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
            if (ctrl) timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
            const opts = { method, signal: ctrl ? ctrl.signal : undefined };
            if (method === 'POST') {
                opts.headers = { 'Content-Type': 'application/json' };
                opts.body = JSON.stringify(body || {});
            }
            const res = await fetch(API_BASE + path, opts);
            if (timer) { clearTimeout(timer); timer = null; }
            if (res.status >= 500) {
                if (attempt === 0) continue;          // 5xx 只重试 1 次
                noteFailure(path, 'HTTP ' + res.status, false);
                return null;
            }
            if (!res.ok) {
                // 404/405: 没有这个接口(多半是纯静态托管, 根本没有后端)
                noteFailure(path, 'HTTP ' + res.status, res.status === 404 || res.status === 405);
                return null;
            }
            const ct = (res.headers.get('content-type') || '').toLowerCase();
            if (!ct.includes('json')) {
                noteFailure(path, 'non-json response', true);
                return null;
            }
            const data = await res.json();
            failStreak = 0;
            confirmed = true;
            return data;
        } catch (e) {
            if (timer) clearTimeout(timer);
            // 连接被拒 / 超时 / 断网: 第一次就熔断, 不再重试
            noteFailure(path, e && (e.name === 'AbortError' ? 'timeout' : e.message), true);
            return null;
        }
    }
    return null;
}

function apiPost(path, body) {
    return request('POST', path, body);
}

function apiGet(path) {
    return request('GET', path);
}

function isApiOffline() {
    return offline;
}

export { apiPost, apiGet, isApiOffline, API_BASE };
