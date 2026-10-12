// 扩展章节: 服务端按收集进度下发的追加节点, 合并进本地剧情表后即可照常游玩。
// 前端只负责"条件到了去问一声", 内容本身不随站点发布。
import { apiGet, API_BASE } from './api.js?v=20261011-soul';
import { NODES } from './nodes.js?v=20261011-soul';
import { readRaw, writeRaw } from './storage.js?v=20261011-soul';

const EXT_KEY = 'x';
const PROBE_AT = ['node29', 'node10x_altar'];          // 在这两个节点经过时问服务器
const ATTACH_TO = 'node10x_turn';                        // 下发的节点挂在哪个选项点上
const BASE_ENDINGS = ['A', 'B', 'C', 'D', 'E', 'G', 'H'];
const SEEN_KEY = 'hhs_ng_face';
const NOTICE_KEY = 'hhs_ext_notice';

export const extMixin = {
    methods: {
        // 二周目里看过她的脸: 记一笔(长期)
        noteExtSeen() {
            if (this.flags && this.flags.ng_saw_face) writeRaw(SEEN_KEY, '1');
        },
        extLocalReady() {
            if (!BASE_ENDINGS.every((c) => this.endingCollection.includes(c))) return false;
            if (!this.endingCollection.includes('Z')) return false;
            if (readRaw(SEEN_KEY, '') !== '1' && !this.endingCollection.includes('X')) return false;   // 走过一次的(招魂码带过来)直接放行
            return true;
        },
        // 本局条件: 没死过、没烧过黄纸
        extRunClean() {
            return !(this._runDeaths || 0) && !(this._runHintBurns || 0);
        },
        // 第一次走到结局: 问服务器有没有要说的话, 等结局 CG 收起后弹一次, 之后不再弹
        async maybeExtNotice() {
            if (readRaw(NOTICE_KEY, '') === '1' || this._extNoticing) return;
            this._extNoticing = true;
            const data = await apiGet('/api/ext/notice');
            if (!data || data.error || !Array.isArray(data.lines) || !data.lines.length) { this._extNoticing = false; return; }
            for (let i = 0; i < 40 && this.endingCGVisible; i++) await new Promise((r) => setTimeout(r, 250));
            await new Promise((r) => setTimeout(r, 600));
            this._extNoticing = false;
            if (this.screen !== 'game') return;
            writeRaw(NOTICE_KEY, '1');
            await this.askConfirm([data.title || '', ...data.lines].join('\n'), { ok: data.ok || '记下了', okGlyph: data.okGlyph || '记', cancel: data.cancel || '知道了' });
        },
        async probeExt(nodeId) {
            if (!PROBE_AT.includes(nodeId) || this._extTried) return;
            if (!this.extLocalReady() || !this.extRunClean() || !this.soulCode) return;
            this._extTried = true;
            const data = await apiGet('/api/ext/chapter/' + EXT_KEY + '?soul=' + encodeURIComponent(this.soulCode));
            if (!data || data.error) return;
            const pack = (data.nodes && data.nodes.nodes) ? data.nodes : data;   // 兼容两种返回结构
            const nodes = pack.nodes;
            if (!nodes) return;
            const abs = (u) => (typeof u === 'string' && u.startsWith('ext:')) ? API_BASE + '/api/ext/asset/' + u.slice(4) : u;
            Object.keys(nodes).forEach((id) => {
                const n = nodes[id];
                ['bgImage', 'sceneImage', 'endingCG', 'deathCG', 'character', 'closeupImage'].forEach((k) => { if (n[k]) n[k] = abs(n[k]); });
                NODES[id] = n;
                ['bgImage', 'sceneImage', 'endingCG'].forEach((k) => { if (n[k]) { const im = new Image(); im.src = n[k]; } });
            });
            const host = NODES[ATTACH_TO];
            if (host && pack.choice && !host.choices.some((c) => c.next === pack.choice.next)) {
                host.choices.push({ ...pack.choice, requireFlags: [...(pack.choice.requireFlags || []), 'ext_ok'] });
            }
            this.flags = { ...this.flags, ext_ok: true };
        },
    },
};
