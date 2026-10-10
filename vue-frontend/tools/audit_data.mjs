// 数据层审计: 道具/flag 读写配对、未被引擎读取的字段、合成配方、图片音频引用
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const FE = join(dirname(fileURLToPath(import.meta.url)), '..');
let src = readFileSync(join(FE, 'js', 'nodes.js'), 'utf8');
src = src.replace(/export\s*\{[\s\S]*?\};/, '').replace(/if\s*\(typeof window[\s\S]*$/, '');
const { NODES, ITEMS, PUZZLES, MESSAGES, BPM_MAP, SFX_MAP } = new Function(src + '\nreturn { NODES, ITEMS, PUZZLES, MESSAGES, BPM_MAP, SFX_MAP };')();
const key = (it) => typeof it === 'string' ? it : (it && (it.id || it.code)) || '';
const setFlags = new Map(), readFlags = new Map(), gotItems = new Map(), needItems = new Map();
const add = (m, k, where) => { if (!k) return; if (!m.has(k)) m.set(k, []); m.get(k).push(where); };
const nodeKeys = new Set(), choiceKeys = new Set(), hsKeys = new Set();
for (const [id, n] of Object.entries(NODES)) {
  Object.keys(n).forEach(k => nodeKeys.add(k));
  if (n.item) add(gotItems, key(n.item), id);
  if (n.consumeItem) add(needItems, n.consumeItem, id + '(consume)');
  for (const f of Object.keys(n.setFlags || {})) add(setFlags, f, id);
  for (const c of n.condTexts || []) add(readFlags, c.flag, id + '/条件段');
  for (const c of n.choices || []) {
    Object.keys(c).forEach(k => choiceKeys.add(k));
    if (c.requireItem) add(needItems, c.requireItem, id + '/choice');
    if (c.requireFlag) add(readFlags, c.requireFlag, id + '/choice');
    for (const f of c.requireFlags || []) add(readFlags, f, id + '/判定选项');
    if (c.item) add(gotItems, c.item, id + '/choice');
    for (const f of Object.keys(c.setFlags || {})) add(setFlags, f, id + '/choice');
  }
  (n.hotspots || []).forEach((h, i) => {
    Object.keys(h).forEach(k => hsKeys.add(k));
    const w = id + '/hs:' + (h.id || i);
    if (h.item) add(gotItems, key(h.item), w);
    for (const f of Object.keys(h.setFlags || {})) add(setFlags, f, w);
    for (const f of [h.requireFlag, h.visibleWhenFlag, h.hiddenWhenFlag, ...(h.requireFlags||[]), ...(h.visibleWhenFlags||[]), ...(h.hiddenWhenFlags||[])]) if (f) add(readFlags, f, w);
    if (h.requireItem) add(needItems, h.requireItem, w);
    if (h.consumeItem) add(needItems, h.consumeItem, w + '(consume)');
  });
}
for (const [k, it] of Object.entries(ITEMS)) if (it.combine) { add(gotItems, it.combine.result, 'combine:' + k); for (const w of [k, ...(it.combine.with||[])]) add(needItems, w, 'combine->' + it.combine.result); for (const f of Object.keys(it.combine.setFlags || {})) add(setFlags, f, 'combine:' + k); }
for (const [k, p] of Object.entries(PUZZLES)) { for (const f of p.successFlags || []) add(setFlags, f, 'puzzle:' + k); if (p.successItem) add(gotItems, p.successItem, 'puzzle:' + k); }
console.log('== 读而不写的 flag (requireFlag 等指向从不 set 的 flag):');
for (const [f, w] of readFlags) if (!setFlags.has(f)) console.log('  ', f, '<-', w.join(','));
console.log('== 写而不读的 flag:');
for (const [f, w] of setFlags) if (!readFlags.has(f)) console.log('  ', f, '<-', w.join(','));
console.log('== 需要但拿不到的道具:');
for (const [k, w] of needItems) if (!gotItems.has(k)) console.log('  ', k, '<-', w.join(','));
console.log('== 拿到但不在 ITEMS 里的道具(背包显示"未知物品"):');
for (const [k, w] of gotItems) if (!ITEMS[k]) console.log('  ', k, '<-', w.join(','));
console.log('== 拿到却从不被需要的道具:');
for (const [k, w] of gotItems) if (!needItems.has(k)) console.log('  ', k, '<-', w.join(','));
const engine = ['js/app.js','js/sceneMixin.js','js/smsMixin.js','js/uiMixin.js','js/persistenceMixin.js','js/rpg/runtime.js','js/rpg/sceneEngine.js','js/rpg/assets.js','index.html'].map(f => readFileSync(join(FE, f), 'utf8')).join('\n');
const unread = (set) => [...set].filter(k => !new RegExp('[.?]' + k + '\b|\[\'' + k + '\'\]').test(engine));
console.log('== 引擎从不读取的节点字段:', unread(nodeKeys));
console.log('== 引擎从不读取的选项字段:', unread(choiceKeys));
console.log('== 引擎从不读取的热点字段:', unread(hsKeys));
console.log('== MESSAGES 指向不存在节点:', Object.keys(MESSAGES).filter(k => !NODES[k]));
console.log('== BPM/SFX 指向不存在节点:', [...Object.keys(BPM_MAP), ...Object.keys(SFX_MAP)].filter(k => !NODES[k]));
// 图片/音频引用
const refs = new Set();
const walk = (o) => { if (typeof o === 'string') { if (/^(img|audio)\//.test(o)) refs.add(o.split('?')[0]); } else if (o && typeof o === 'object') Object.values(o).forEach(walk); };
walk(NODES); walk(ITEMS);
console.log('== nodes/ITEMS 中不存在的资源:', [...refs].filter(r => !existsSync(join(FE, r))));
// statEffect 越界
for (const [id, n] of Object.entries(NODES)) for (const e of [n.statEffect, ...(n.choices||[]).map(c => c.statEffect)].filter(Boolean)) for (const [k, v] of Object.entries(e)) if (!['sanity','fear'].includes(k) || Math.abs(v) > 100 || typeof v !== 'number') console.log('== statEffect 异常', id, k, v);
