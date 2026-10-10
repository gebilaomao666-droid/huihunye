// 发版前用 Node 跑一次节点引用完整性校验:  node scripts/validate_nodes.mjs
// 复用 vue-frontend/js/nodes.js 里导出的 validateNodes, 不依赖打包器。
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
let src = readFileSync(join(here, '..', 'js', 'nodes.js'), 'utf8');

// nodes.js 是浏览器 ES module: 去掉 export 语句与浏览器 dev 自检块, 用 Function 取出数据。
src = src.replace(/export\s*\{[\s\S]*?\};/, '');
src = src.replace(/if\s*\(typeof window[\s\S]*$/, '');

const factory = new Function(src + '\nreturn { NODES, ITEMS, PUZZLES, HINTS, validateNodes };');
const { NODES, ITEMS, PUZZLES, HINTS, validateNodes } = factory();

const problems = validateNodes(NODES, ITEMS, PUZZLES);

// ---- 剧情数据补充校验(防卡死/防空对话框/防无解谜题) ----
const itemKeyOf = (v) => (typeof v === 'string' ? v : (v && (v.code || v.id)));
const setFlagSet = new Set();
const gotItemSet = new Set(Object.values(ITEMS).filter(it => it && it.combine).map(it => it.combine.result));
Object.values(ITEMS).forEach(it => Object.keys((it.combine && it.combine.setFlags) || {}).forEach(f => setFlagSet.add(f)));
Object.values(PUZZLES).forEach(p => { (p.successFlags || []).forEach(f => setFlagSet.add(f)); if (p.successItem) gotItemSet.add(p.successItem); });
for (const n of Object.values(NODES)) {
    Object.keys(n.setFlags || {}).forEach(f => setFlagSet.add(f));
    if (n.item) gotItemSet.add(itemKeyOf(n.item));
    (n.choices || []).forEach(c => { Object.keys(c.setFlags || {}).forEach(f => setFlagSet.add(f)); if (c.item) gotItemSet.add(c.item); });
    (n.hotspots || []).forEach(h => {
        if (!h) return;
        Object.keys(h.setFlags || {}).forEach(f => setFlagSet.add(f));
        if (h.item) gotItemSet.add(itemKeyOf(h.item));
    });
}
// 判定选项(requireFlags + elseNext)总是可点, 不算门槛
const isGated = (c) => c.requireItem || c.requireFlag || (c.requireFlags && !c.elseNext) || c.requireSanityMin !== undefined || c.requireFearMax !== undefined;
for (const [id, n] of Object.entries(NODES)) {
    // 1. 探索场景必须配 returnNode, 否则点"关闭"/点暗处后画面空白卡死
    //    (sceneNoClose 的谜题场景没有关闭按钮, 必须至少有一个能离开的热点)
    if (n.exploreScene) {
        if (n.sceneNoClose) {
            if (!(n.hotspots || []).some(h => h.nextNode || h.deathNode || h.lockedNext)) problems.push(`谜题场景 ${id}: 没有关闭按钮也没有能离开的热点`);
        } else {
            const back = n.returnNode;
            if (!back) problems.push(`探索节点 ${id}: 缺 returnNode(关闭场景后无处可去会卡死)`);
            else if (!NODES[back]) problems.push(`探索节点 ${id}: returnNode -> '${back}' 不存在`);
            if (!n.closeText) problems.push(`探索节点 ${id}: 缺 closeText(关闭按钮文案)`);
        }
    }
    // 2. 所有节点必须有旁白, 否则进入时对话框是空的
    if (typeof n.text !== 'string' || !n.text.trim()) problems.push(`节点 ${id}: 缺 text(进入时对话框为空)`);
    // 3. 节点级谜题: 必须有成功出口; 不能和选项/热点混用
    if (n.puzzle) {
        const p = PUZZLES[n.puzzle];
        if (p && !p.successNext) problems.push(`谜题节点 ${id}: ${n.puzzle} 缺 successNext(解开后无处可去)`);
        if ((n.choices || []).length || (n.hotspots || []).length) problems.push(`谜题节点 ${id}: 节点级谜题不应同时有选项/热点`);
    }
    // 4. 选项门槛: 道具/flag 必须存在且有地方能拿到; 全部选项都带门槛则可能软锁
    const choices = (n.choices || []).filter(Boolean);
    choices.forEach((c, i) => {
        if (c.requireItem && !ITEMS[c.requireItem] && !gotItemSet.has(c.requireItem)) problems.push(`节点 ${id}: choices[${i}].requireItem -> '${c.requireItem}' 不在 ITEMS`);
        if (c.requireItem && !gotItemSet.has(c.requireItem)) problems.push(`节点 ${id}: choices[${i}].requireItem -> '${c.requireItem}' 全剧情拿不到`);
        if (c.requireFlag && !setFlagSet.has(c.requireFlag)) problems.push(`节点 ${id}: choices[${i}].requireFlag -> '${c.requireFlag}' 全剧情从不设置`);
    });
    if (choices.length && choices.every(isGated)) problems.push(`节点 ${id}: 所有选项都带门槛, 条件不满足时会没有出口`);
}

// 5. 谜题数据: 每种玩法的必填字段 + 三级提示
const NEED = { timing: ['windowMs', 'successNext', 'failNext'], code: ['answer', 'length', 'maxFails', 'failNext'], road: ['answer', 'maxFails', 'failNext'],
    drag: ['initial', 'levels'], choice: ['options', 'answer', 'maxFails', 'failNext'], steps: ['counter', 'limit', 'failNext'], item: [] };
for (const [pid, p] of Object.entries(PUZZLES)) {
    if (!NEED[p.kind]) { problems.push(`谜题 ${pid}: 未知玩法 ${p.kind}`); continue; }
    NEED[p.kind].forEach(k => { if (p[k] === undefined) problems.push(`谜题 ${pid}(${p.kind}): 缺 ${k}`); });
    if (p.kind === 'code' && !new RegExp('^\\d{' + p.length + '}$').test(p.answer)) problems.push(`谜题 ${pid}: 答案 '${p.answer}' 不是 ${p.length} 位数字`);
    if (!NODES[p.node]) problems.push(`谜题 ${pid}: 位置节点 ${p.node} 不存在`);
    else if (p.hotspot && !(NODES[p.node].hotspots || []).some(h => h.id === p.hotspot && h.puzzle === pid)) problems.push(`谜题 ${pid}: 热点 ${p.hotspot} 没有引用它`);
    if (!Array.isArray(HINTS[pid]) || HINTS[pid].length !== 3 || HINTS[pid].some(h => !h)) problems.push(`谜题 ${pid}: 三级提示不全`);
}

if (problems.length) {
    console.error(`✗ nodes.js 引用完整性: 发现 ${problems.length} 个问题`);
    problems.forEach(p => console.error('  - ' + p));
    process.exit(1);
}
console.log(`✓ nodes.js 引用完整性校验通过 (${Object.keys(NODES).length} 个节点)`);
