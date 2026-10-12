// 招魂码(跨设备收集进度) / 阴间账簿(全服统计) / 分享图
// 招魂码不是账号: 8 位随机码, 本机先生成, 联网时把结局/死法/成就/周目并到云端(并集), 换设备输码即可找回。
import { apiGet, apiPost } from './api.js?v=20261012-end';
import { KEYS, readJSON, writeJSON, readRaw, writeRaw } from './storage.js?v=20261012-end';
import { NODES } from './nodes.js?v=20261012-end';

const SOUL_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const SOUL_KEY = 'hhs_soul';
const RUNS_KEY = 'hhs_runs';
const NG_KEY = 'hhs_ng_plus';

function makeSoulCode() {
    const buf = new Uint8Array(8);
    try { crypto.getRandomValues(buf); } catch (e) { for (let i = 0; i < 8; i++) buf[i] = Math.floor(Math.random() * 256); }
    return Array.from(buf, (b) => SOUL_ALPHABET[b % SOUL_ALPHABET.length]).join('');
}
const normSoul = (v) => String(v || '').toUpperCase().replace(/[^23456789ABCDEFGHJKLMNPQRSTUVWXYZ]/g, '');
const fmtSoul = (c) => (c ? c.slice(0, 4) + '-' + c.slice(4) : '');

// 结局图鉴: 未解锁时的一句暗示(不剧透答案, 只指方向)
const ENDING_HINTS = {
    A: '不是每个跑出门的人，都上得了回城的车。',
    B: '她问你愿不愿意。有人答应了。',
    C: '七月十五过完，还是七月十五。',
    D: '骨符在手。黄纸上写谁的名字，是你的事。',
    E: '族谱缺的那一页，配三炷一样高的香。',
    F: '有些名字，忘了比记得安全。',
    G: '铃响，门就归摇铃的人守。',
    H: '一个音都不漏，念到最后。',
    Y: '再守一夜。躺着，别推。',
    Z: '再守一夜。他也曾是新郎。',
};
// 结局代号 → 代表节点(取第一个带 CG 的)
const ENDING_NODE = {};
Object.keys(NODES).forEach((id) => {
    const n = NODES[id];
    if (!n || !n.endingCode) return;
    if (!ENDING_NODE[n.endingCode] || (!ENDING_NODE[n.endingCode].endingCG && n.endingCG)) ENDING_NODE[n.endingCode] = n;
});

const loadImg = (src) => new Promise((res) => {
    if (!src) return res(null);
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
});
const pad2 = (n) => String(n).padStart(2, '0');

export const soulMixin = {
    data() {
        return {
            soulCode: '',
            soulInput: '',
            soulMsg: '',
            soulBusy: false,
            worldStats: null,
            worldState: 'idle',    // idle | loading | ok | offline
            shareBusy: false,
            shareHint: '',
        };
    },
    computed: {
        soulCodeText() { return fmtSoul(this.soulCode); },
        endingGallery() {
            return (this.allEndingCodes || []).slice().sort().map((code) => {
                const n = ENDING_NODE[code] || {};
                const unlocked = this.endingCollection.includes(code);
                return {
                    code, unlocked,
                    name: unlocked ? this.getEndingName(code) : '未 解',
                    cg: n.endingCG || '',
                    hint: ENDING_HINTS[code] || '……',
                    legendary: code === 'H' || code === 'G',
                    ng: code === 'Y' || code === 'Z',
                };
            });
        },
        worldDeathMax() {
            const d = this.worldStats && this.worldStats.deaths;
            return d && d.length ? Math.max(...d.map((x) => x.count)) : 1;
        },
        worldEndingRows() {
            const w = this.worldStats;
            if (!w) return [];
            const total = Object.values(w.endings || {}).reduce((a, b) => a + b, 0) || 1;
            return (this.allEndingCodes || []).map((c) => ({ code: c, name: this.getEndingName(c), count: (w.endings || {})[c] || 0, pct: Math.round(((w.endings || {})[c] || 0) / total * 100) }));
        },
        worldClearText() {
            const s = this.worldStats && this.worldStats.median_clear_seconds;
            if (!s) return '还没有人走出来';
            const m = Math.round(s / 60);
            return m >= 60 ? Math.floor(m / 60) + ' 小时 ' + (m % 60) + ' 分' : m + ' 分钟';
        },
        ngPlusUnlocked() {
            return ['E', 'H'].some((c) => this.endingCollection.includes(c)) || (parseInt(readRaw(NG_KEY, '0'), 10) || 0) > 0;
        },
    },
    watch: {
        bookTab(v) { if (v === 'world') this.loadWorld(); },
    },
    methods: {
        // ---------- 招魂码 ----------
        initSoul() {
            let c = normSoul(readRaw(SOUL_KEY, ''));
            if (c.length !== 8) { c = makeSoulCode(); writeRaw(SOUL_KEY, c); }
            this.soulCode = c;
            this.syncSoul('boot');
        },
        soulPayload() {
            const ach = readJSON(KEYS.achievements, []);
            const deaths = readJSON(KEYS.deathsSeen, []);
            return {
                code: this.soulCode,
                name: (this.playerName || '').trim().slice(0, 16),
                endings: Array.isArray(this.endingCollection) ? this.endingCollection : [],
                deaths_seen: Array.isArray(deaths) ? deaths : [],
                achievements: Array.isArray(ach) ? ach : [],
                death_count: this.deathCount || 0,
                runs: parseInt(readRaw(RUNS_KEY, '0'), 10) || 0,
                ng_plus: parseInt(readRaw(NG_KEY, '0'), 10) || 0,
            };
        },
        // 把云端并集写回本地(只增不减)
        absorbSoul(r) {
            if (!r || r.error) return false;
            let changed = false;
            const union = (local, remote) => {
                const out = Array.isArray(local) ? local.slice() : [];
                (remote || []).forEach((x) => { if (!out.includes(x)) { out.push(x); changed = true; } });
                return out;
            };
            this.endingCollection = union(this.endingCollection, r.endings);
            writeJSON(KEYS.endings, this.endingCollection);
            const deaths = union(readJSON(KEYS.deathsSeen, []), r.deaths_seen);
            writeJSON(KEYS.deathsSeen, deaths);
            this.deathsSeenList = deaths;
            const ach = union(readJSON(KEYS.achievements, []), r.achievements);
            writeJSON(KEYS.achievements, ach);
            (this.achievements || []).forEach((a) => { if (ach.includes(a.code)) a.unlocked = true; });
            if ((r.death_count || 0) > (this.deathCount || 0)) { this.deathCount = r.death_count; writeRaw(KEYS.deathCount, String(r.death_count)); changed = true; }
            if ((r.runs || 0) > (parseInt(readRaw(RUNS_KEY, '0'), 10) || 0)) writeRaw(RUNS_KEY, String(r.runs));
            if ((r.ng_plus || 0) > (parseInt(readRaw(NG_KEY, '0'), 10) || 0)) writeRaw(NG_KEY, String(r.ng_plus));
            if (r.name && !(this.playerName || '').trim()) this.playerName = r.name;
            return changed;
        },
        // 同步(去抖): 本局里每次结局/死亡/成就后调一次, 合并到云端
        syncSoul(reason) {
            if (!this.soulCode) return;
            if (this._soulTimer) clearTimeout(this._soulTimer);
            this._soulTimer = setTimeout(async () => {
                this._soulTimer = null;
                const r = await apiPost('/api/soul/sync', this.soulPayload());
                if (r && !r.error) this.absorbSoul(r);
            }, reason === 'boot' ? 1200 : 2500);
        },
        markNgPlusDone() {
            const n = (parseInt(readRaw(NG_KEY, '0'), 10) || 0) + 1;
            writeRaw(NG_KEY, String(n));
        },
        bumpRuns() {
            const n = (parseInt(readRaw(RUNS_KEY, '0'), 10) || 0) + 1;
            writeRaw(RUNS_KEY, String(n));
        },
        // 设置页「找回」: 输入别处的招魂码, 把那边的进度并过来, 并以后用那个码
        async restoreSoul() {
            const c = normSoul(this.soulInput);
            if (c.length !== 8) { this.soulMsg = '招魂码是 8 位，看看是不是抄漏了。'; return; }
            if (c === this.soulCode) { this.soulMsg = '这就是你现在的码。'; return; }
            this.soulBusy = true; this.soulMsg = '正在招魂…';
            const r = await apiGet('/api/soul/' + c);
            this.soulBusy = false;
            if (!r) { this.soulMsg = '连不上老宅（网络不通或后端未醒）。'; return; }
            if (r.error) { this.soulMsg = r.error; return; }
            const ok = await this.askConfirm('认下这个招魂码？\n会把那边的结局、死法、成就并进来，以后两边共用这一个码。', { ok: '认下', okGlyph: '认' });
            if (!ok) { this.soulMsg = ''; return; }
            this.soulCode = c;
            writeRaw(SOUL_KEY, c);
            this.absorbSoul(r);
            this.soulInput = '';
            this.soulMsg = '已并入。结局 ' + this.endingCollection.filter((c) => this.allEndingCodes.includes(c)).length + ' / ' + this.allEndingCodes.length + '。';
            this.syncSoul('restore');
            if (this.showToast) this.showToast('招魂成功，进度已并入');
        },
        async copySoulCode() {
            const t = this.soulCodeText;
            try { await navigator.clipboard.writeText(t); this.showToast('招魂码已复制：' + t); }
            catch (e) { this.showToast('请手抄：' + t); }
        },

        // ---------- 阴间账簿 ----------
        async loadWorld() {
            if (this.worldState === 'loading') return;
            this.worldState = 'loading';
            const w = await apiGet('/api/world');
            if (!w || w.error) { this.worldState = 'offline'; return; }
            this.worldStats = w;
            this.worldState = 'ok';
        },

        // ---------- 分享图 ----------
        // 结局/死亡页「分享」: 画一张竖版图(CG + 称号 + 战绩 + 二维码), 手机长按保存或直接系统分享
        async generateShareCard() {
            if (this.shareBusy) return;
            this.shareBusy = true;
            try {
                const node = this.currentNode || {};
                const isDeath = !!node.isDeath;
                const name = node.endingName || node.deathName || '深渊注视';
                const kicker = isDeath ? ((node.chapter || '') + ' · 死法') : ((node.chapter || '') + ' · 结局 ' + (node.endingCode || ''));
                const cgSrc = node.endingCG || node.deathCG || this.bgImageUrl || 'img/ui2/bg_title.webp';
                try { await Promise.all(['700 48px "HHY-LC"', '400 24px "HHY-MSZ"'].map((f) => document.fonts.load(f))); } catch (e) {}
                const [cg, title, qr, seal] = await Promise.all([loadImg(cgSrc), loadImg('img/ui2/title.webp'), loadImg('img/ui2/qr.png'), loadImg(isDeath ? 'img/ui2/seal_mo.webp' : 'img/ui2/seal_zhong.webp')]);

                const W = 1080, H = 1440;
                const canvas = document.createElement('canvas');
                canvas.width = W; canvas.height = H;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#0a0606'; ctx.fillRect(0, 0, W, H);

                // CG 铺满上半, 底部烧进黑
                const cgH = 960;
                if (cg) {
                    const s = Math.max(W / cg.width, cgH / cg.height);
                    const dw = cg.width * s, dh = cg.height * s;
                    ctx.drawImage(cg, (W - dw) / 2, (cgH - dh) / 2, dw, dh);
                }
                let g = ctx.createLinearGradient(0, cgH - 420, 0, cgH + 10);
                g.addColorStop(0, 'rgba(10,6,6,0)'); g.addColorStop(1, 'rgba(10,6,6,1)');
                ctx.fillStyle = g; ctx.fillRect(0, cgH - 420, W, 430);
                g = ctx.createLinearGradient(0, 0, 0, 260);
                g.addColorStop(0, 'rgba(10,6,6,.85)'); g.addColorStop(1, 'rgba(10,6,6,0)');
                ctx.fillStyle = g; ctx.fillRect(0, 0, W, 260);
                // 暗角
                g = ctx.createRadialGradient(W / 2, cgH / 2, cgH * 0.35, W / 2, cgH / 2, cgH * 0.9);
                g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.6)');
                ctx.fillStyle = g; ctx.fillRect(0, 0, W, cgH);

                // 顶部: 游戏标题
                if (title) {
                    const tw = 420, th = tw * title.height / title.width;
                    ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 18;
                    ctx.drawImage(title, 48, 36, tw, th);
                    ctx.shadowBlur = 0;
                }

                // 称号
                const kai = '"KaiTi","STKaiti","Kaiti SC","楷体","Songti SC",serif';
                ctx.textBaseline = 'alphabetic';
                ctx.fillStyle = 'rgba(214,178,110,.95)';
                ctx.font = '400 30px ' + kai;
                ctx.textAlign = 'left';
                ctx.fillText(kicker, 72, 830);
                const big = name.length <= 3 ? 190 : (name.length <= 4 ? 160 : 120);
                ctx.font = '700 ' + big + 'px "HHY-LC",' + kai;
                ctx.fillStyle = isDeath ? '#c8281c' : '#f1e2bc';
                ctx.shadowColor = isDeath ? 'rgba(120,0,0,.9)' : 'rgba(0,0,0,.95)'; ctx.shadowBlur = 24;
                ctx.fillText(name, 66, 830 + big);
                ctx.shadowBlur = 0;
                if (seal) {
                    const nw = ctx.measureText(name).width;
                    ctx.globalAlpha = .9;
                    ctx.drawImage(seal, Math.min(66 + nw + 24, W - 190), 830 + big - 150, 150, 150);
                    ctx.globalAlpha = 1;
                }

                // 战绩
                const y0 = 830 + big + 70;
                const who = (this.playerName || '').trim() || '无名';
                const ms = this.gameStartTime ? Date.now() - this.gameStartTime : 0;
                const used = ms > 0 ? pad2(Math.floor(ms / 60000)) + ':' + pad2(Math.floor(ms / 1000) % 60) : '';
                const deaths = this.deathCatalog ? this.deathCatalog.filter((d) => d.seen).length + ' / ' + this.deathCatalog.length : String(this.deathCount);
                const lines = [
                    who + (isDeath ? ' 死在了' : ' 走到了') + (node.chapter || '老宅') + (node.time ? ' · ' + node.time : ''),
                    '本局死亡 ' + (this._runDeaths || 0) + ' 次' + (used ? ' · 用时 ' + used : '') + ' · 累计死亡 ' + (this.deathCount || 0) + ' 次',
                    '结局 ' + this.endingCollection.filter((c) => this.allEndingCodes.includes(c)).length + ' / ' + this.allEndingCodes.length + ' · 死法 ' + deaths + (this.soulCode ? ' · 招魂码 ' + fmtSoul(this.soulCode) : ''),
                ];
                ctx.font = '400 30px ' + kai;
                ctx.fillStyle = 'rgba(232,217,176,.92)';
                lines.forEach((t, i) => ctx.fillText(t, 72, y0 + i * 48));

                // 分割线 + 底部
                ctx.strokeStyle = 'rgba(176,138,78,.45)'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(72, H - 250); ctx.lineTo(W - 72, H - 250); ctx.stroke();
                if (qr) {
                    ctx.fillStyle = '#f1e2bc';
                    ctx.fillRect(W - 72 - 204, H - 222, 204, 204);
                    ctx.drawImage(qr, W - 72 - 196, H - 214, 188, 188);
                }
                ctx.fillStyle = '#f1e2bc';
                ctx.font = '700 44px "HHY-LC",' + kai;
                ctx.fillText('回魂夜 · 纸人招魂', 72, H - 160);
                ctx.font = '400 30px ' + kai;
                ctx.fillStyle = 'rgba(214,178,110,.95)';
                ctx.fillText(isDeath ? '我死在了这里。你敢来试试吗？' : '我走到了这个结局。你敢来试试吗？', 72, H - 104);
                ctx.font = '400 24px ' + kai;
                ctx.fillStyle = 'rgba(232,217,176,.6)';
                ctx.fillText(this.gameUrl().replace(/^https?:\/\//, ''), 72, H - 56);

                this.shareCardDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                this.shareHint = this.isPhone ? '长按图片即可保存到相册' : '右键图片另存，或点「保存」';
                this.shareCardVisible = true;
            } catch (e) {
                console.warn('[share] 生成失败', e);
                this.shareEndingText();
            } finally {
                this.shareBusy = false;
            }
        },
        shareFileName() {
            const n = this.currentNode || {};
            return '回魂夜_' + (n.endingName || n.deathName || '结局') + '.jpg';
        },
        async shareCardNative() {
            try {
                const blob = await (await fetch(this.shareCardDataUrl)).blob();
                const file = new File([blob], this.shareFileName(), { type: 'image/jpeg' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: '回魂夜 · 纸人招魂', text: '你敢来试试吗？ ' + this.gameUrl() });
                    return;
                }
            } catch (e) { if (e && e.name === 'AbortError') return; }
            this.shareEndingText();
        },
        saveShareCard() {
            const a = document.createElement('a');
            a.href = this.shareCardDataUrl; a.download = this.shareFileName();
            document.body.appendChild(a); a.click(); a.remove();
            if (this.isPhone) this.showToast('若没有保存，请长按图片保存');
        },
        // 旧的纯文字分享(系统分享不可用时兜底)
        shareEndingText() {
            const isDeath = this.currentNode?.isDeath;
            const name = this.currentNode?.endingName || this.currentNode?.deathName || '未知结局';
            const url = this.gameUrl();
            const text = isDeath ? `我在《回魂夜》里死在了【${name}】\n你敢来试试吗？` : `我在《回魂夜》里走到了结局【${name}】\n你敢来试试吗？`;
            if (navigator.share) {
                navigator.share({ title: '回魂夜 · ' + name, text, url }).catch(() => {});
            } else if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text + '\n' + url).then(() => this.showToast('分享文案已复制')).catch(() => this.showToast('复制失败，请手动复制'));
            } else {
                this.showToast('浏览器不支持自动复制：' + url);
            }
        },

        // ---------- 结局图鉴 ----------
        openEndingCard(e) {
            if (!e) return;
            if (!e.unlocked) { this.showCloseup('', e.hint, null, '未解之局 · ' + e.code, '走到它，这页纸才会显影。'); return; }
            const n = ENDING_NODE[e.code] || {};
            const paras = String(n.text || '').split(/\n\n+/).filter(Boolean).slice(0, 3).join('\n\n');
            this.showCloseup(n.endingCG || '', paras || e.name, null, '结局 ' + e.code + ' · ' + e.name, '');
        },
    },
};
