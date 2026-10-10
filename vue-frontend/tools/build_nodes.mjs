// 剧情定稿 md → js/nodes.js 转换脚本
//   node tools/build_nodes.mjs            生成 js/nodes.js
//   node tools/build_nodes.mjs --check    只解析+校验, 不写文件
// 数据来源: docs/剧情定稿/*.md (格式见 FORMAT.md, 解析器与 _work/story/check_story.mjs 同源)
// 画面数据(背景/立绘/CG/热点坐标/特写图)来自本文件的 PRESENT 表 + tools/_nodes_old_backup.js 里同 id 的旧数据。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FE = path.resolve(HERE, '..');
const ROOT = path.resolve(FE, '..');
const DIR = process.env.STORY_DIR || path.join(ROOT, 'docs', '剧情定稿');
const OUT = path.join(FE, 'js', 'nodes.js');
const BACKUP = path.join(HERE, '_nodes_old_backup.js');
const CHECK_ONLY = process.argv.includes('--check');

// ---------------- 解析(与 check_story.mjs 同一套规则) ----------------
const nodes = {}, items = {}, sms = {}, puzzles = {}, misc = {};
const errors = [];
const order = [];
const list = v => (v || '').split(/[,，、]/).map(s => s.trim()).filter(Boolean);
const arr = v => v === undefined ? [] : (Array.isArray(v) ? v : [v]);

function parseFile(file) {
    const lines = fs.readFileSync(path.join(DIR, file), 'utf8').split(/\r?\n/);
    let cur = null, sub = null, quote = null;
    const pushQuote = (l) => {
        const t = l.replace(/^>\s?/, '');
        if (t === '') quote.push('');
        else if (quote.length && quote[quote.length - 1] !== '') quote[quote.length - 1] += '\n' + t;
        else quote.push(t);
    };
    lines.forEach((raw, i) => {
        const l = raw.trimEnd();
        const where = `${file}:${i + 1}`;
        let m;
        if ((m = l.match(/^## @item (\w+)$/))) { cur = { kind: 'item', id: m[1], f: {} }; items[m[1]] = cur; sub = null; quote = null; return; }
        if ((m = l.match(/^## @sms (\w+)$/))) { cur = { kind: 'sms', id: m[1], f: {} }; sms[m[1]] = cur; sub = null; quote = null; return; }
        if ((m = l.match(/^## @(\w+)$/))) { cur = { kind: 'misc', id: m[1], f: {}, list: [] }; misc[m[1]] = cur; sub = null; quote = null; return; }
        if ((m = l.match(/^## (\w+)$/))) {
            if (nodes[m[1]]) errors.push(`重复节点 id ${m[1]} (${where})`);
            cur = { kind: 'node', id: m[1], file, f: {}, textParas: [], choices: [], hotspots: [], conds: [], puzzles: [] };
            nodes[m[1]] = cur; order.push(m[1]); sub = null; quote = null; return;
        }
        if (/^# /.test(l)) { cur = null; sub = null; quote = null; return; }
        if (!cur) return;
        if (cur.kind === 'node') {
            if (/^### 选项$/.test(l)) { sub = { kind: 'choices' }; quote = null; return; }
            if ((m = l.match(/^### 热点 (\w+)\s*｜\s*(.+)$/))) { sub = { kind: 'hs', id: m[1], label: m[2], f: {}, closeup: [] }; cur.hotspots.push(sub); quote = null; return; }
            if ((m = l.match(/^### 谜题 (\w+)$/))) { sub = { kind: 'pz', id: m[1], node: cur.id, f: {} }; cur.puzzles.push(sub); puzzles[m[1]] = sub; quote = null; return; }
            if ((m = l.match(/^### 条件段 (!?\w+)$/))) { sub = { kind: 'cond', expr: m[1], paras: [] }; cur.conds.push(sub); quote = sub.paras; return; }
            if (/^### /.test(l)) { errors.push(`无法识别的小节 ${l} (${where})`); return; }
        }
        if (l === '正文:') { quote = cur.textParas; return; }
        if (l === '特写:' && sub && sub.kind === 'hs') { quote = sub.closeup; return; }
        if (/^>/.test(l)) { if (quote) pushQuote(l); return; }
        if (l.trim() === '') return;
        if (sub && sub.kind === 'choices' && l.startsWith('- ')) {
            quote = null;
            const body = l.slice(2);
            const idx = body.indexOf(' -> ');
            if (idx < 0) { errors.push(`选项缺少 -> (${where})`); return; }
            const parts = body.slice(idx + 4).split('|').map(s => s.trim());
            const ch = { text: body.slice(0, idx).trim(), target: parts[0], f: {} };
            for (const p of parts.slice(1)) { const k = p.indexOf(':'); if (k < 0) { errors.push(`选项字段格式错 ${p} (${where})`); continue; } ch.f[p.slice(0, k).trim()] = p.slice(k + 1).trim(); }
            cur.choices.push(ch); return;
        }
        if (cur.kind === 'misc' && l.startsWith('- ') && !/^- [^:：]+[:：]/.test(l)) { cur.list.push(l.slice(2).trim()); return; }
        if ((m = l.match(/^- ([^:：]+)[:：]\s*(.*)$/))) {
            quote = null;
            const tgt = (sub && (sub.kind === 'hs' || sub.kind === 'pz')) ? sub.f : cur.f;
            const k = m[1].trim(), v = m[2].trim();
            if (tgt[k] === undefined) tgt[k] = v; else { if (!Array.isArray(tgt[k])) tgt[k] = [tgt[k]]; tgt[k].push(v); }
        }
    });
}
const files = fs.readdirSync(DIR).filter(f => /^\d\d_.*\.md$/.test(f)).sort();
if (files.length !== 11) errors.push(`剧情定稿应为 00~10 共 11 个文件, 实际 ${files.length}`);
files.forEach(parseFile);
const paraText = ps => ps.filter(p => p !== '').join('\n\n');

// ---------------- 旧数据(只取画面/手感字段) ----------------
function loadBackup() {
    if (!fs.existsSync(BACKUP)) return { NODES: {}, ITEMS: {}, BPM_MAP: {}, SFX_MAP: {} };
    let src = fs.readFileSync(BACKUP, 'utf8');
    src = src.replace(/export\s*\{[\s\S]*?\};/, '').replace(/if\s*\(typeof window[\s\S]*$/, '');
    return new Function(src + '\nreturn { NODES, ITEMS, BPM_MAP, SFX_MAP };')();
}
const OLD = loadBackup();

// ---------------- 画面配置(新剧情专用; 不写的字段沿用旧数据) ----------------
// 立绘: 不在表里的节点一律隐藏立绘(旧数据的立绘与新剧情多处对不上, 例如 node10x_altar “她不在前头”)
const CHARACTERS = {
    node13b: { character: 'img/char/it_shadow.jpg', characterEmotion: 'ghost', characterPosition: 'center', characterFlicker: true },
    node14: { character: 'img/char/bride_paper.jpg', characterEmotion: 'ghost', characterPosition: 'center', characterFlicker: true },
    node_dead_shadow: { character: 'img/char/it_shadow.jpg', characterEmotion: 'ghost', characterPosition: 'center' },
    node8x_hall: { character: 'img/char/mother.jpg', characterEmotion: 'fade', characterPosition: 'right' },
    node8x_mother: { character: 'img/char/mother.jpg', characterEmotion: 'fade', characterPosition: 'right' },
    node8x_mother_free: { character: 'img/char/mother.jpg', characterEmotion: 'normal', characterPosition: 'right' },
    node28: { character: 'img/char/bride_paper.jpg', characterEmotion: 'ghost', characterPosition: 'right', characterFlicker: true },
    node29: { character: 'img/char/bride_paper.jpg', characterEmotion: 'ghost', characterPosition: 'right' },
    node29b: { character: 'img/char/grandpa_normal.jpg', characterEmotion: 'fade', characterPosition: 'left' },
    // 2026-10-09 美术 v2 接入
    node26: { character: 'img/char/mirror_player.jpg', characterEmotion: 'ghost', characterPosition: 'right' }
    // 司机(爹)立绘 art_v2/final/char/driver.webp 已出: 结局节点直接进结局 CG 不显示立绘, 能露面的只有第一章 node01/node01_explore(第一章公交按用户要求不动), 暂不接
};
// 新节点的背景/死亡CG/结局CG(旧数据里同 id 的会自动沿用)
// 2026-10-09 美术 v2: 定稿锚点图接入(见 art_v2/manifest.json); 第一章公交相关的图不动
const PRESENT = {
    node01: { fx: 'flicker' },
    node01_explore: { sceneImage: 'img/bg/ch01_bus.jpg', fx: 'flicker' },
    node_dead_wild: { bgImage: 'img/bg/ch01_bus.jpg', deathCG: 'img/death/death_06_bus.jpg', fx: 'flicker' },
    node05: { sceneImage: 'img/closeup/shoes_inward.webp' },
    node_dead3_v2: { deathCG: 'img/death/death_double.webp' },
    node08b: { sceneImage: 'img/closeup/door_red_eye_wide.webp' },
    node08c: { camAlert: true },
    node_dead2: { deathCG: 'img/death/death_answer.webp' },
    node11: { sceneImage: 'img/bg/ch03_kitchen.jpg', bgImage: 'img/bg/ch03_kitchen.jpg' },
    node12: { bgImage: 'img/bg/ch03_kitchen.jpg' },
    node_dead3: { bgImage: 'img/bg/ch02_living_room.jpg', deathCG: 'img/death/death_11_coffin.webp' },
    node13: { bgImage: 'img/bg/ch04_paper_circle.webp' },
    node13b: { bgImage: 'img/bg/ch04_paper_circle.webp' },
    node14: { sceneImage: 'img/bg/ch04_paper_circle.webp', bgImage: 'img/bg/ch04_paper_circle.webp' },
    node15: { bgImage: 'img/bg/ch04_paper_circle.webp', sceneImage: 'img/closeup/paper_eye_mole.webp' },
    node_dead4: { deathCG: 'img/death/death_04_sacrifice.jpg' },
    node17: { bgImage: 'img/bg/ch05_fog_hall.webp' },
    node_dead6: { deathCG: 'img/death/death_03_lookback.jpg' },
    node_dead7: { deathCG: 'img/death/death_12_wedding.jpg' },
    node22b: { sceneImage: 'img/bg/under_bed.jpg' },
    node23: { sceneImage: 'img/bg/ch06_bridal_room.webp' },
    node_after_genealogy: { bgImage: 'img/bg/ch04_basement.jpg', sceneImage: 'img/closeup/veil_embroidery_wide.webp' },
    node_explore_cave: { sceneImage: 'img/bg/ch04_basement.jpg' },
    node_dead_cave: { deathCG: 'img/death/death_10_blood_curse.jpg' },
    node_puzzle_fail: { deathCG: 'img/death/death_05_suffocate.jpg' },
    node_dead_bride: { deathCG: 'img/death/death_03_lookback.jpg' },
    node7x_funeral_explore: { bgImage: 'img/bg/ch07_mourning_shed.webp', sceneImage: 'img/bg/ch07_mourning_shed.webp' },
    node7x_coffin_alive: { bgImage: 'img/bg/ch07_mourning_shed.webp', sceneImage: 'img/closeup/coffin_alive.webp' },
    node7x_answer_dead: { bgImage: 'img/bg/ch07_mourning_shed.webp' },
    node26: { bgImage: 'img/bg/ch01_village_gate_burning_paper.jpg' },
    node_dead10: { bgImage: 'img/bg/ch01_village_gate_burning_paper.jpg' },
    node26b: { bgImage: 'img/bg/ch01_village_gate_burning_paper.jpg' },
    node8x_veil: { sceneImage: 'img/bg/ch05_shrine.jpg' },
    node8x_mirror: { bgImage: 'img/bg/ch05_shrine.jpg' },
    node8x_dead_mirror: { deathCG: 'img/death/death_mirror_shards.webp' },
    node8x_mother: { bgImage: 'img/bg/ch05_shrine.jpg', sceneImage: 'img/closeup/mother_paperface.webp' },
    node8x_mother_free: { bgImage: 'img/bg/ch05_shrine.jpg', sceneImage: 'img/closeup/hold_mother_hand.webp' },
    node8x_dead_well: { deathCG: 'img/closeup/closeup_well_bottom.png' },
    node9x_yinyang_road: { bgImage: 'img/bg/ch08_yinyang_road.webp' },
    node9x_crossroads: { bgImage: 'img/bg/ch08_yinyang_road.webp' },
    node_dead11: { deathCG: 'img/death/death_11_coffin.webp' },
    node29b: { bgImage: 'img/bg/ch09_beam.webp' },
    node10x_ritual_prep: { sceneImage: 'img/bg/ch10_ritual.jpg', bgImage: 'img/bg/ch10_ritual.jpg' },
    node_endG: { endingCG: 'img/ending/ending_g_hidden.jpg' },
    node_endG2: { endingCG: 'img/ending/ending_g_keeper.webp' }
};
// 热点坐标(百分比) 与特写图。旧数据同 id 热点的坐标/特写图会先被沿用, 这里覆盖或补齐
// 2026-10-09 美术 v2: 换了场景图的探索节点(node11/14/23/7x/8x_veil/10x)按新图用网格重新对位
const HS_LAYOUT = {
    node01_explore: {
        // 坐标按 2026-10-09 新车厢图 ch01_bus.jpg(bus_g_102 后排视角, 1536x864) 用网格实测对位
        phone_message: [58, 84, 10, 10, 'img/closeup/closeup_phone_message.jpg'],
        seat_carving: [24, 52, 18, 14],
        bus_window: [1, 22, 14, 38, 'img/closeup/closeup_bus_window_reflection.jpg'],
        rearview_mirror: [46, 24, 10, 8, 'img/closeup/closeup_rearview_mirror.jpg'],
        driver_hands: [41, 41, 8, 10, 'img/closeup/closeup_driver_hands.jpg'],
        bus_bell: [70, 24, 6, 10]
    },
    node06_explore: {
        yellow_paper_stack: [22, 74, 20, 10, 'img/item/yellow_paper.webp'],
        water_bowl_cover: [57, 62, 18, 9, 'img/closeup/water_bowl_handprint.webp'],
        ancestral_tablet: [39, 18, 19, 23, 'img/closeup/tablet_crooked.webp']
    },
    node11: {
        // ch03_kitchen.jpg(_r3): 灶台在左中, 倒头饭+竖筷, 灶台左前角一盒火柴, 灶膛口在灶台正下方, 右边水缸
        damp_matches: [23, 66, 9, 8, 'img/item/item_match.jpg'],
        ceiling: [25, 0, 50, 16, 'img/char/grandpa_ghost.jpg'],
        stove: [41, 81, 14, 18, 'img/closeup/hearth_ember.webp'],
        water_vat: [67, 52, 26, 40],
        kitchen_exit: [2, 76, 20, 20]
    },
    node14: {
        // ch04_paper_circle.webp: 十一个纸人从左到右, 第三(x≈26%)、第八(x≈68%)两个脸上补画了墨泪
        altar_ash_handful: [42, 84, 16, 14, 'img/closeup/closeup_altar_ash_red_string.jpg'],
        paper_blank: [3, 14, 13, 55],
        paper_eye_3: [21, 18, 9, 50],
        paper_eye_8: [64, 18, 8, 50],
        shadow: [92, 2, 8, 34],
        eyes_done: [40, 44, 20, 14]
    },
    node5x_vigil: {},
    node_explore_cave: {
        bone_amulet: [10, 60, 22, 18, 'img/closeup/closeup_ritual_bone_charm.png'],
        blood_pearl: [40, 52, 20, 16],
        spider_web: [74, 8, 20, 22],
        phone_replay: [40, 78, 22, 14],
        stone_door: [42, 14, 22, 30]
    },
    node23: {
        // ch06_bridal_room.webp: 左上照片墙(8 张新郎), 中右婚床
        photo_wall: [5, 9, 34, 42, 'img/closeup/photo_wall_grooms.webp'],
        groom_wrong: [16, 9, 23, 42, 'img/closeup/photo_wall_grooms.webp'],
        groom_four: [5, 9, 10, 18, 'img/closeup/photo_wall_fourfinger.webp'],
        wedding_bed: [40, 62, 30, 22]
    },
    node7x_funeral_explore: {
        // ch07_mourning_shed.webp(灵棚): 供桌上遗照+白蜡+族谱, 桌前黑棺, 两侧白幡与纸人
        white_banner: [26, 12, 14, 56],
        old_photo: [42, 28, 16, 32, 'img/closeup/portrait_bride_behind.webp'],
        turning_puppet: [9, 30, 14, 62, 'img/item/item_puppet.jpg'],
        clan_book: [52, 62, 9, 7, 'img/item/item_genealogy.jpg'],
        funeral_coffin: [32, 76, 38, 20],
        coffin_lock: [32, 76, 38, 20],
        blend_into_paper: [78, 30, 13, 62]
    },
    node8x_veil: {
        // ch05_shrine.jpg(喜堂): 左侧小桌上的裂镜, 正中太师椅
        broken_mirror: [26, 44, 11, 20, 'img/closeup/mirror_veiled.webp'],
        mother_behind: [76, 25, 14, 45],
        submit: [44, 58, 13, 22]
    },
    node9x_grave_explore: {
        grave_name_tag: [40, 55, 22, 18, 'img/closeup/closeup_grave_paper_money.png'],
        crossroads: [62, 46, 30, 18]
    },
    node10x_ritual_prep: {
        // ch10_ritual.jpg(法坛): 供桌 x27~71% y72~80%, 香炉居中, 左侧族谱, 两侧白烛
        altar_center: [40, 72, 13, 8, 'img/item/mini_coffin.webp'],
        place_bone_charm: [40, 72, 13, 8, 'img/closeup/closeup_ritual_bone_charm.png'],
        incense_three: [46, 52, 8, 19, 'img/item/item_incense.jpg'],
        genealogy_page: [29, 72, 10, 8, 'img/closeup/closeup_genealogy_missing_page.png'],
        pick_blood_jade: [62, 72, 9, 8],
        pick_bell: [30, 62, 9, 9],
        altar_water_bowl: [1, 78, 11, 14, 'img/bg/ch08_well.jpg'],
        kneel: [38, 86, 24, 12]
    }
};
const ITEM_IMAGES = {
    yellow_paper: ['img/item/yellow_paper.webp'], damp_match: ['img/item/item_match.jpg'],
    incense_ash: ['img/item/incense_ash.webp', 'img/closeup/closeup_altar_ash_red_string.jpg'],
    genealogy: ['img/item/item_genealogy.jpg', 'img/closeup/closeup_genealogy_missing_page.png'],
    map: ['img/item/item_genealogy.jpg'],
    bone_amulet: ['img/item/bone_charm.webp', 'img/closeup/closeup_ritual_bone_charm.png'],
    mini_coffin: ['img/item/mini_coffin.webp'],
    old_photo: ['img/item/item_old_photo.jpg', 'img/closeup/portrait_bride_behind.webp']
};

// ---------------- 谜题玩法配置(按谜题 id; 答案/选项/提示从 md 读) ----------------
const PUZZLE_KIND = {
    pz_bus_bell: { kind: 'timing', title: '下车铃', windowMs: 3000, leadMinMs: 3500, leadMaxMs: 6500,
        idleText: '玻璃里映着车前方的路。黑的，看不到头。', treeText: '反光里，路边立起一棵老槐树，枝杈伸到路中间。',
        earlyText: '铃不响。司机的四根手指在方向盘上敲了一下。你还可以再等。', pressText: '按下车铃' },
    pz_damp_match: { kind: 'item' },
    pz_wipe_eyes: { kind: 'steps', counter: 'paper_blank', limit: 3, failNext: 'node_dead4',
        stepText: ['沙。纸脚往前擦了一步。（第一步）', '沙。纸脚又往前擦了一步。它们离你只剩一步了。（第二步）'] },
    pz_stone_door: { kind: 'code', title: '石门', length: 4, maxFails: 2,
        firstFailText: '毒针从门缝里射出，擦着颈侧钉进岩壁，只留一道血口。石格咔咔地退回原位——还能再按一次。' },
    pz_groom: { kind: 'item' },
    pz_lock_coffin: { kind: 'item' },
    pz_veil_mirror: { kind: 'item' },
    pz_puppet_road: { kind: 'road', title: '三岔口', maxFails: 3,
        stareText: '你盯着纸偶。它一动不动，脸朝着你。',
        lookText: '你把视线挪开半寸，再回头——纸偶的脸已经转向了「{dir}」边。',
        failTexts: ['你走了很久，脚下又是这个岔口。红月沉到了树梢。', '又绕回来了。红月沉到了坟头，路上的黄纸一动不动。'],
        passTexts: ['第一个岔口过去了。前头又分成了三条。', '第二个岔口过去了。唢呐声远了一点。'] },
    pz_incense: { kind: 'drag', title: '摆香', sticks: 3, levels: 10, initial: [4, 4, 8],
        badText: '两短一长。三炷香的灰同时断落，香自己熄了。你得重摆。',
        unevenText: '三炷香还长短不齐。' },
    pz_bazi: { kind: 'choice', title: '对八字', maxFails: 2,
        firstFailText: '墨洇开一团，又退了回去。背后那阵凉，近了一寸。',
        specialFail: { option: '丙子 丁酉 壬午 庚子', text: '那是你自己的八字。这家人，一直是这么干的。' } }
};

// ---------------- 转换 ----------------
const flagObj = v => { const o = {}; list(v).forEach(f => { o[f] = true; }); return Object.keys(o).length ? o : undefined; };
const one = (v, where) => { const a = list(v); if (a.length > 1) errors.push(`${where} 一次只支持一件道具: ${v}`); return a[0]; };
const TYPE = { '普通': 'normal', '探索': 'explore', '谜题': 'puzzle', '死亡': 'death', '结局': 'ending' };

const NODES = {};
for (const id of order) {
    const n = nodes[id];
    const old = OLD.NODES[id] || {};
    const t = TYPE[n.f['类型']];
    if (!t) errors.push(`节点 ${id} 类型非法 ${n.f['类型']}`);
    const out = {};
    out.chapter = n.f['章节'];
    if (n.f['场景']) out.sceneName = n.f['场景'];
    const time = n.f['时间'];
    if (time && time !== '—') out.time = time;   // “—”: 不写 time, 状态栏沿用上一个节点
    out.text = paraText(n.textParas);
    if (!out.text) errors.push(`节点 ${id} 正文为空`);
    // 画面: 旧数据 → PRESENT 覆盖
    for (const k of ['bgImage', 'sceneImage', 'sceneTitle', 'sceneId', 'vibration', 'signal', 'battery', 'deathCG', 'endingCG', 'fearScore']) if (old[k] !== undefined) out[k] = old[k];
    Object.assign(out, PRESENT[id] || {});
    // 非探索节点的 sceneImage 会在正文前先全屏显示: 旧数据里是探索场景图的不能沿用
    if (!n.hotspots.length && old.exploreScene && !(PRESENT[id] && PRESENT[id].sceneImage)) delete out.sceneImage;
    if (CHARACTERS[id]) Object.assign(out, CHARACTERS[id]); else out.hideCharacter = true;
    const sf = flagObj(n.f['设旗标']); if (sf) out.setFlags = sf;
    const gi = one(n.f['获得道具'], `节点 ${id} 获得道具`); if (gi) out.item = gi;
    const ci = one(n.f['消耗道具'], `节点 ${id} 消耗道具`); if (ci) out.consumeItem = ci;
    if (t === 'death') { out.isDeath = true; out.deathName = n.f['死亡名']; out.deathDesc = n.f['死亡说明']; }
    if (t === 'ending') { out.isEnding = true; out.endingCode = n.f['结局代号']; out.endingName = n.f['结局名']; }
    if (n.conds.length) out.condTexts = n.conds.map(c => ({ flag: c.expr.replace('!', ''), not: c.expr.startsWith('!'), text: paraText(c.paras) }));
    // 探索场景(含带热点的谜题节点)
    if (n.hotspots.length) {
        out.exploreScene = true;
        out.sceneId = out.sceneId || id;
        out.sceneTitle = n.f['场景'] || out.sceneTitle || '';
        out.sceneImage = out.sceneImage || out.bgImage || OLD.NODES[id]?.bgImage || '';
        if (n.f['回到']) { out.returnNode = n.f['回到']; out.closeText = old.closeText || '退出场景'; }
        else out.sceneNoClose = true;         // 谜题场景: 只能靠热点离开
        if (n.f['场景提示']) out.sceneHint = n.f['场景提示'];
        const oldHs = {}; (old.hotspots || []).forEach(h => { if (h.id) oldHs[h.id] = h; });
        out.hotspots = n.hotspots.map((h, i) => {
            const o = { id: h.id, label: h.label };
            const lay = (HS_LAYOUT[id] || {})[h.id];
            const prev = oldHs[h.id];
            if (lay) { [o.x, o.y, o.w, o.h] = lay; } else if (prev) { o.x = prev.x; o.y = prev.y; o.w = prev.w; o.h = prev.h; }
            else { o.x = 6 + (i % 4) * 23; o.y = 12 + Math.floor(i / 4) * 28; o.w = 20; o.h = 16; }
            if (h.f['一次性'] === '是') o.once = true;
            const vis = list(h.f['显示条件']); if (vis.length) o.visibleWhenFlags = vis;
            const hid = list(h.f['隐藏条件']); if (hid.length) o.hiddenWhenFlags = hid;
            if (h.f['requireItem']) o.requireItem = h.f['requireItem'];
            if (h.f['requireFlag']) o.requireFlag = h.f['requireFlag'];
            if (h.f['未满足提示']) o.lockedText = h.f['未满足提示'];
            if (h.f['未满足跳转']) o.lockedNext = h.f['未满足跳转'];
            const hc = one(h.f['消耗道具'], `热点 ${id}#${h.id} 消耗道具`); if (hc) o.consumeItem = hc;
            const hg = one(h.f['获得道具'], `热点 ${id}#${h.id} 获得道具`); if (hg) o.item = hg;
            const hf = flagObj(h.f['设旗标']); if (hf) o.setFlags = hf;
            if (h.f['谜题']) o.puzzle = h.f['谜题'];
            if (h.f['跳转']) o.nextNode = h.f['跳转'];
            if (h.f['死亡']) o.deathNode = h.f['死亡'];
            if (h.f['提示条']) o.toast = h.f['提示条'];
            const cu = paraText(h.closeup);
            if (cu) {
                o.closeup = true;
                o.closeupTitle = h.f['特写标题'] || h.label;
                o.closeupText = cu;
                const img = (lay && lay[4]) || (prev && prev.closeupImage);
                if (img) o.closeupImage = img;
            }
            if (PUZZLE_KIND.pz_wipe_eyes.counter === h.id && id === puzzles.pz_wipe_eyes?.node) o.stepPuzzle = 'pz_wipe_eyes';
            return o;
        });
    }
    // 节点级谜题(不挂在热点上)
    const nodePz = n.puzzles.find(p => !(p.f['位置'] || '').includes('#'));
    if (nodePz && !n.hotspots.length) out.puzzle = nodePz.id;
    // 选项
    if (n.choices.length) {
        out.choices = n.choices.map(c => {
            const o = { text: c.text, next: c.target };
            if (c.f['requireItem']) o.requireItem = c.f['requireItem'];
            if (c.f['requireFlag']) o.requireFlag = c.f['requireFlag'];
            if (c.f['requireFlags']) o.requireFlags = list(c.f['requireFlags']);
            if (c.f['否则']) o.elseNext = c.f['否则'];
            const s = flagObj(c.f['setFlags']); if (s) o.setFlags = s;
            const g = one(c.f['获得道具'], `节点 ${id} 选项 ${c.text} 获得道具`); if (g) o.item = g;
            for (const k of Object.keys(c.f)) if (!['requireItem', 'requireFlag', 'requireFlags', '否则', 'setFlags', '获得道具'].includes(k)) errors.push(`节点 ${id} 选项未知字段 ${k}`);
            return o;
        });
    }
    NODES[id] = out;
}

// ---------------- 谜题 / 提示 ----------------
const PUZZLES = {}, HINTS = {};
for (const p of Object.values(puzzles)) {
    const cfg = PUZZLE_KIND[p.id];
    if (!cfg) { errors.push(`谜题 ${p.id} 没有玩法配置(PUZZLE_KIND)`); continue; }
    const [pn, ph] = (p.f['位置'] || '').split('#');
    const o = { ...cfg, node: pn };
    if (ph) o.hotspot = ph;
    o.answerText = p.f['答案'];
    const sf = list(p.f['成功设旗标']); if (sf.length) o.successFlags = sf;
    if (p.f['成功获得']) o.successItem = p.f['成功获得'];
    if (p.f['成功跳转']) o.successNext = p.f['成功跳转'];
    if (p.f['成功文本']) o.successText = p.f['成功文本'];
    if (p.f['失败跳转']) o.failNext = p.f['失败跳转'];
    if (cfg.kind === 'code') { o.answer = (p.f['答案'] || '').trim(); if (!new RegExp(`^\\d{${cfg.length}}$`).test(o.answer)) errors.push(`谜题 ${p.id} 答案不是 ${cfg.length} 位数字`); }
    if (cfg.kind === 'road') { o.answer = list(p.f['答案']); if (o.answer.length !== 3 || o.answer.some(d => !['左', '中', '右'].includes(d))) errors.push(`谜题 ${p.id} 答案应为 左/中/右 三个`); }
    if (cfg.kind === 'choice') {
        o.options = (p.f['选项'] || '').split('/').map(s => s.trim()).filter(Boolean);
        o.answer = (p.f['答案'] || '').trim();
        if (!o.options.includes(o.answer)) errors.push(`谜题 ${p.id} 答案不在选项里`);
        if (cfg.specialFail && !o.options.includes(cfg.specialFail.option)) errors.push(`谜题 ${p.id} specialFail 选项不存在`);
    }
    if (['timing', 'code', 'road', 'drag', 'choice'].includes(cfg.kind) && !o.successNext && !ph) errors.push(`谜题 ${p.id} 缺成功跳转`);
    if (['timing', 'code', 'road', 'choice', 'steps'].includes(cfg.kind) && !o.failNext) errors.push(`谜题 ${p.id} 缺失败跳转`);
    PUZZLES[p.id] = o;
    HINTS[p.id] = [p.f['提示1'], p.f['提示2'], p.f['提示3']];
    if (HINTS[p.id].some(h => !h)) errors.push(`谜题 ${p.id} 提示不全`);
}
const hs = misc.hint_system ? misc.hint_system.f : {};
const HINT_SYSTEM = {
    name: hs['名称'] || '烧黄纸问',
    papersPerChapter: 3,
    // 第一章还没进老宅, 没有黄纸, 改为“手机草稿箱”
    phoneChapter: NODES.node01 ? NODES.node01.chapter : '',
    noHintAchievement: '不问鬼神',
    labels: ['烧第一张', '烧第二张', '烧第三张'],
    phoneLabels: ['草稿一', '草稿二', '草稿三']
};

// ---------------- 道具 ----------------
const ITEMS = {};
for (const it of Object.values(items)) {
    const old = OLD.ITEMS[it.id] || {};
    const o = { name: it.f['名称'], desc: it.f['描述'] };
    const img = ITEM_IMAGES[it.id] || [];
    o.image = img[0] || old.image || 'img/item/item_note.jpg';
    const insp = img[1] || old.inspectImage; if (insp) o.inspectImage = insp;
    for (const c of arr(it.f['组合'])) {
        const [main, ...opts] = c.split('|').map(s => s.trim());
        const [other, result] = main.split('->').map(s => s.trim());
        const combine = { with: [other], result };
        opts.forEach(op => {
            const k = op.indexOf(':'), key = op.slice(0, k).trim(), val = op.slice(k + 1).trim();
            if (key === 'setFlags') combine.setFlags = flagObj(val);
            else if (key === '提示') combine.message = val;
            else errors.push(`道具 ${it.id} 组合未知字段 ${key}`);
        });
        if (o.combine) errors.push(`道具 ${it.id} 只支持一个组合配方`);
        o.combine = combine;
    }
    ITEMS[it.id] = o;
}

// ---------------- 短信 / 墓志铭 / 心跳 / 音效 ----------------
const MESSAGES = {};
for (const s of Object.values(sms)) MESSAGES[s.id] = { from_sender: s.f['发信人'], content: s.f['内容'] };
const EPITAPHS = misc.epitaphs ? misc.epitaphs.list : [];
const BPM_MAP = {}, SFX_MAP = {};
const isTerm = n => n.isDeath || n.isEnding;
for (const [id, n] of Object.entries(NODES)) {
    if (OLD.BPM_MAP[id]) BPM_MAP[id] = OLD.BPM_MAP[id];
    else if (!isTerm(n)) BPM_MAP[id] = n.exploreScene ? 115 : (n.puzzle ? 190 : 150);
    if (OLD.SFX_MAP[id]) SFX_MAP[id] = OLD.SFX_MAP[id];
}

// ---------------- 引用校验 ----------------
const exists = id => !!NODES[id];
for (const [id, n] of Object.entries(NODES)) {
    if (n.returnNode && !exists(n.returnNode)) errors.push(`${id} returnNode ${n.returnNode} 不存在`);
    (n.choices || []).forEach(c => { for (const k of ['next', 'elseNext']) if (c[k] && !exists(c[k])) errors.push(`${id} 选项 ${c.text} ${k} ${c[k]} 不存在`); for (const k of ['requireItem', 'item']) if (c[k] && !ITEMS[c[k]]) errors.push(`${id} 选项道具 ${c[k]} 未定义`); });
    (n.hotspots || []).forEach(h => {
        for (const k of ['nextNode', 'deathNode', 'lockedNext']) if (h[k] && !exists(h[k])) errors.push(`${id}#${h.id} ${k} ${h[k]} 不存在`);
        for (const k of ['requireItem', 'consumeItem', 'item']) if (h[k] && !ITEMS[h[k]]) errors.push(`${id}#${h.id} 道具 ${h[k]} 未定义`);
        if (h.puzzle && !PUZZLES[h.puzzle]) errors.push(`${id}#${h.id} 谜题 ${h.puzzle} 不存在`);
        if (h.closeupImage && !fs.existsSync(path.join(FE, h.closeupImage))) errors.push(`${id}#${h.id} 图片不存在 ${h.closeupImage}`);
    });
    for (const k of ['item', 'consumeItem']) if (n[k] && !ITEMS[n[k]]) errors.push(`${id} ${k} ${n[k]} 未定义`);
    for (const k of ['bgImage', 'sceneImage', 'deathCG', 'endingCG', 'character']) if (n[k] && !fs.existsSync(path.join(FE, n[k]))) errors.push(`${id} ${k} 图片不存在 ${n[k]}`);
}
for (const p of Object.values(PUZZLES)) for (const k of ['successNext', 'failNext']) if (p[k] && !exists(p[k])) errors.push(`谜题 ${k} ${p[k]} 不存在`);
for (const k of Object.keys(MESSAGES)) if (!exists(k)) errors.push(`短信 ${k} 节点不存在`);

if (errors.length) { console.error('✗ 转换失败:\n  ' + errors.join('\n  ')); process.exit(1); }

// ---------------- 图片缓存版本号 ----------------
// 同名换图后浏览器会用旧缓存, 给每个图片路径按文件内容加 ?v=指纹; 文件一变指纹就变
const verCache = new Map();
const withVer = (rel) => {
    if (typeof rel !== 'string' || !/^img\/.+\.(jpg|jpeg|png|webp)$/i.test(rel)) return rel;
    if (!verCache.has(rel)) {
        const f = path.join(FE, rel);
        verCache.set(rel, fs.existsSync(f) ? createHash('md5').update(fs.readFileSync(f)).digest('hex').slice(0, 8) : '');
    }
    const v = verCache.get(rel);
    return v ? `${rel}?v=${v}` : rel;
};
const stampImages = (o) => {
    if (Array.isArray(o)) return o.forEach(stampImages);
    if (!o || typeof o !== 'object') return;
    for (const k of Object.keys(o)) {
        if (typeof o[k] === 'string') o[k] = withVer(o[k]);
        else stampImages(o[k]);
    }
};
stampImages(NODES); stampImages(ITEMS);

// ---------------- 输出 ----------------
const J = v => JSON.stringify(v, null, 4);
const ind = s => s.replace(/\n/g, '\n');
const nodeLines = Object.entries(NODES).map(([id, n]) => `    ${JSON.stringify(id)}: ${ind(JSON.stringify(n, null, 4)).replace(/\n/g, '\n    ')}`).join(',\n\n');
const validateFn = `// ===== 开发期引用完整性自检 (纯函数, 不改 NODES/ITEMS 结构) =====
function validateNodes(nodes, items, puzzles) {
    const problems = [];
    const pz = puzzles || {};
    const jumpFields = ['returnNode'];
    const itemExists = (key) => !!items[key];
    Object.keys(nodes).forEach(id => {
        const node = nodes[id];
        (node.choices || []).forEach((c, i) => {
            ['next', 'elseNext'].forEach(f => { if (c && c[f] && !nodes[c[f]]) problems.push(\`节点 \${id}: choices[\${i}].\${f} -> '\${c[f]}' 不存在\`); });
            ['requireItem', 'item'].forEach(f => { if (c && c[f] && !itemExists(c[f])) problems.push(\`节点 \${id}: choices[\${i}].\${f} -> '\${c[f]}' 不在 ITEMS\`); });
        });
        jumpFields.forEach(f => { if (node[f] && !nodes[node[f]]) problems.push(\`节点 \${id}: \${f} -> '\${node[f]}' 不存在\`); });
        (node.hotspots || []).forEach((h, i) => {
            ['deathNode', 'nextNode', 'lockedNext'].forEach(f => { if (h[f] && !nodes[h[f]]) problems.push(\`节点 \${id}: hotspots[\${i}].\${f} -> '\${h[f]}' 不存在\`); });
            ['item', 'requireItem', 'consumeItem'].forEach(f => { if (h[f] && !itemExists(h[f])) problems.push(\`节点 \${id}: hotspots[\${i}].\${f} -> '\${h[f]}' 不在 ITEMS\`); });
            if (h.puzzle && !pz[h.puzzle]) problems.push(\`节点 \${id}: hotspots[\${i}].puzzle -> '\${h.puzzle}' 不在 PUZZLES\`);
        });
        ['item', 'consumeItem'].forEach(f => { if (node[f] && !itemExists(node[f])) problems.push(\`节点 \${id}: \${f} -> '\${node[f]}' 不在 ITEMS\`); });
        if (node.puzzle && !pz[node.puzzle]) problems.push(\`节点 \${id}: puzzle -> '\${node.puzzle}' 不在 PUZZLES\`);
        if (node.isDeath && (!node.deathName || !node.deathDesc)) problems.push(\`死亡节点 \${id}: 缺 deathName 或 deathDesc\`);
        if (node.isEnding && (!node.endingCode || !node.endingName)) problems.push(\`结局节点 \${id}: 缺 endingCode 或 endingName\`);
    });
    Object.keys(pz).forEach(k => {
        ['successNext', 'failNext'].forEach(f => { if (pz[k][f] && !nodes[pz[k][f]]) problems.push(\`谜题 \${k}: \${f} -> '\${pz[k][f]}' 不存在\`); });
        if (pz[k].successItem && !itemExists(pz[k].successItem)) problems.push(\`谜题 \${k}: successItem 不在 ITEMS\`);
    });
    Object.keys(items).forEach(k => {
        const c = items[k].combine;
        if (c && (!itemExists(c.result) || (c.with || []).some(w => !itemExists(w)))) problems.push(\`道具 \${k}: 组合引用了不存在的道具\`);
    });
    return problems;
}`;

const out = `// ===== 回魂夜 · 剧情节点数据 =====
// 本文件由 tools/build_nodes.mjs 从 docs/剧情定稿/*.md 生成, 不要手改; 改剧情请改 md 后重新生成:
//   node tools/build_nodes.mjs
// ${Object.keys(NODES).length} 个节点 | ${Object.values(NODES).filter(n => n.isDeath).length} 种死法 | ${Object.values(NODES).filter(n => n.isEnding).length} 个结局节点 | ${Object.keys(PUZZLES).length} 个谜题

const EPITAPHS = ${J(EPITAPHS)};

const NODES = {
${nodeLines}
};

// 道具定义
const ITEMS = ${J(ITEMS)};

// 谜题玩法(数据驱动: 引擎按 kind 选面板)
const PUZZLES = ${J(PUZZLES)};

// 烧黄纸问: 每个谜题三级提示
const HINTS = ${J(HINTS)};

const HINT_SYSTEM = ${J(HINT_SYSTEM)};

// 节点BPM映射（心跳）
const BPM_MAP = ${J(BPM_MAP)};

// 节点音效映射
const SFX_MAP = ${J(SFX_MAP)};

// 短信映射(只保留附录 @sms 列表)
const MESSAGES = ${J(MESSAGES)};

${validateFn}

export { NODES, ITEMS, PUZZLES, HINTS, HINT_SYSTEM, BPM_MAP, SFX_MAP, MESSAGES, EPITAPHS, validateNodes };

// 仅本地开发时自动跑一次自检, 生产环境不执行
if (typeof window !== 'undefined' &&
    (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    const __issues = validateNodes(NODES, ITEMS, PUZZLES);
    if (__issues.length) console.warn('[nodes.js] 引用完整性发现 ' + __issues.length + ' 个问题:\\n' + __issues.join('\\n'));
    else console.log('[nodes.js] 引用完整性自检通过 (' + Object.keys(NODES).length + ' 个节点)');
}
`;
if (CHECK_ONLY) { console.log(`✓ 解析通过: ${Object.keys(NODES).length} 节点, ${Object.keys(ITEMS).length} 道具, ${Object.keys(PUZZLES).length} 谜题, ${Object.keys(MESSAGES).length} 短信`); process.exit(0); }
fs.writeFileSync(OUT, out, 'utf8');
console.log(`✓ 已生成 ${path.relative(FE, OUT)}: ${Object.keys(NODES).length} 节点, ${Object.keys(ITEMS).length} 道具, ${Object.keys(PUZZLES).length} 谜题, ${Object.keys(MESSAGES).length} 短信, ${EPITAPHS.length} 墓志铭`);
