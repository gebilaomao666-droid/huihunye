// 全流程穷举模拟 v3: flag / 道具 / 热点可见性 / 配方 / 谜题 感知的可达性 + 前向活锁检测。
// 比 analyze_flow 更深: 尊重 choice.requireFlag/requireFlags/requireItem、热点 visibleWhenFlag(s)/requireItem/requireFlag、
// ITEMS 配方原料可得性、谜题成功旗标/道具; 定点迭代求每节点"到达时可获得的 flag/道具最大集", 据此判定:
//   死链 / 需要却无来源的 flag·道具 / 硬卡死(无可走出边) / 活锁(可达却前向到不了任何结局或死亡)。
// v3(剧情定稿 2026-10-08): 支持判定选项(requireFlags+elseNext)、选项 setFlags/item、热点 lockedNext(未满足跳转)、
//   节点/热点谜题(PUZZLES 的 successNext/failNext/successFlags/successItem)、配方 setFlags。
// 自检: `node scripts/simulate_playthroughs.mjs --selftest` 会在内存副本里抽掉一个关键来源,
//   验证探测器能抓到由此产生的断链(证明非假绿)。
//   node scripts/simulate_playthroughs.mjs [--selftest]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
let src = readFileSync(join(here, '..', 'vue-frontend', 'js', 'nodes.js'), 'utf8');
src = src.replace(/export\s*\{[\s\S]*?\};/, '').replace(/if\s*\(typeof window[\s\S]*$/, '');
const parsed = new Function(src + '\nreturn { NODES, ITEMS: typeof ITEMS!=="undefined"?ITEMS:{}, PUZZLES: typeof PUZZLES!=="undefined"?PUZZLES:{} };')();

const START = 'node01';
const NODE_JUMPS = ['returnNode'];
const isTerminal = (n) => !!(n.isEnding || n.isDeath);
const itemKey = (v) => (v ? (typeof v === 'string' ? v : (v.id || v.code)) : null);
const visReqs = (h) => [h.visibleWhenFlag, ...(Array.isArray(h.visibleWhenFlags) ? h.visibleWhenFlags : [])].filter(Boolean);
const keys = (o) => Object.keys(o || {});

function analyze(NODES, ITEMS, PUZZLES) {
  // ---- 全部 flag 来源 (节点 + 热点 + 选项 setFlags, 谜题成功旗标, 配方旗标) ----
  const flagSetters = new Set();
  for (const id of Object.keys(NODES)) {
    const n = NODES[id];
    keys(n.setFlags).forEach((f) => flagSetters.add(f));
    for (const h of (n.hotspots || [])) keys(h?.setFlags).forEach((f) => flagSetters.add(f));
    for (const c of (n.choices || [])) keys(c?.setFlags).forEach((f) => flagSetters.add(f));
  }
  for (const p of Object.values(PUZZLES)) (p.successFlags || []).forEach((f) => flagSetters.add(f));
  for (const it of Object.values(ITEMS)) keys(it?.combine?.setFlags).forEach((f) => flagSetters.add(f));
  // ---- 道具来源: 直接授予 + 谜题奖励 + 可得原料的配方产物(定点) ----
  const itemSources = new Set();
  for (const id of Object.keys(NODES)) {
    const n = NODES[id];
    if (itemKey(n.item)) itemSources.add(itemKey(n.item));
    for (const h of (n.hotspots || [])) if (itemKey(h?.item)) itemSources.add(itemKey(h.item));
    for (const c of (n.choices || [])) if (itemKey(c?.item)) itemSources.add(itemKey(c.item));
  }
  for (const p of Object.values(PUZZLES)) if (p.successItem) itemSources.add(p.successItem);
  for (let chg = true; chg;) {
    chg = false;
    for (const k of Object.keys(ITEMS)) {
      const r = ITEMS[k]?.combine; if (!r?.result || itemSources.has(r.result)) continue;
      if ([k, ...(r.with || [])].every((x) => itemSources.has(x))) { itemSources.add(r.result); chg = true; }
    }
  }

  const hsUsable = (h, af, ai) => visReqs(h).every((f) => af.has(f))
    && (!h.requireFlag || af.has(h.requireFlag))
    && (!Array.isArray(h.requireFlags) || h.requireFlags.every((f) => af.has(f)))
    && (!h.requireItem || ai.has(h.requireItem));

  // ---- 进入节点后, 在场景内迭代展开可获得的 flag/道具(热点互相解锁 + 谜题 + 配方) ----
  function expand(n, af, ai) {
    keys(n.setFlags).forEach((f) => af.add(f));
    if (itemKey(n.item)) ai.add(itemKey(n.item));
    for (let chg = true; chg;) {
      chg = false;
      const addF = (f) => { if (!af.has(f)) { af.add(f); chg = true; } };
      const addI = (i) => { if (i && !ai.has(i)) { ai.add(i); chg = true; } };
      for (const h of (n.hotspots || [])) {
        if (!h || !hsUsable(h, af, ai)) continue;
        keys(h.setFlags).forEach(addF);
        addI(itemKey(h.item));
        const p = h.puzzle && PUZZLES[h.puzzle];
        if (p) { (p.successFlags || []).forEach(addF); addI(p.successItem); }
      }
      for (const k of Object.keys(ITEMS)) {
        const r = ITEMS[k]?.combine; if (!r?.result) continue;
        if (![k, ...(r.with || [])].every((x) => ai.has(x))) continue;
        addI(r.result);
        keys(r.setFlags).forEach(addF);
      }
    }
  }

  // ---- 给定 af/ai, 求可走出边(尊重门控/可见性); 边可附带选项自身的 setFlags/item ----
  function liveEdges(n, af, ai) {
    const out = [];
    const push = (t, f, i) => { if (t && NODES[t]) out.push({ t, f: f || [], i: i || [] }); };
    for (const c of (n.choices || [])) {
      if (!c?.next) continue;
      if (c.requireFlag && !af.has(c.requireFlag)) continue;
      if (c.requireItem && !ai.has(c.requireItem)) continue;
      const eff = [keys(c.setFlags), itemKey(c.item) ? [itemKey(c.item)] : []];
      if (c.elseNext) {                     // 判定选项: 齐了去 next, 不齐去 elseNext
        if (c.requireFlags.every((f) => af.has(f))) push(c.next, ...eff);
        push(c.elseNext, ...eff);
        continue;
      }
      if (Array.isArray(c.requireFlags) && !c.requireFlags.every((f) => af.has(f))) continue;
      push(c.next, ...eff); // 数值门控(requireSanityMin/FearMax)对可达性放行
    }
    for (const f of NODE_JUMPS) if (typeof n[f] === 'string') push(n[f]);
    const np = n.puzzle && PUZZLES[n.puzzle];
    if (np) { push(np.successNext); push(np.failNext); }
    for (const h of (n.hotspots || [])) {
      if (!h || !visReqs(h).every((f) => af.has(f))) continue;
      if (h.lockedNext) push(h.lockedNext);           // 未满足跳转: 条件不齐时点了就走
      if (!hsUsable(h, af, ai)) continue;
      push(h.nextNode); push(h.deathNode);
      const p = h.puzzle && PUZZLES[h.puzzle];
      if (p) { push(p.successNext); push(p.failNext); }
      if (h.stepPuzzle && PUZZLES[h.stepPuzzle]) push(PUZZLES[h.stepPuzzle].failNext);
    }
    return out;
  }

  // ---- 可达性定点迭代 (每节点累积到达时可持有的 flag/道具并集) ----
  const flagsAt = {}; const itemsAt = {};
  const ensure = (id) => { if (!flagsAt[id]) { flagsAt[id] = new Set(); itemsAt[id] = new Set(); } };
  ensure(START);
  for (let changed = true, guard = 0; changed && guard < 20000; guard++) {
    changed = false;
    for (const id of Object.keys(flagsAt)) {
      const n = NODES[id]; if (!n) continue;
      const af = new Set(flagsAt[id]); const ai = new Set(itemsAt[id]); expand(n, af, ai);
      for (const e of liveEdges(n, af, ai)) {
        const isNew = !flagsAt[e.t]; ensure(e.t);
        let chg = isNew;
        [...af, ...e.f].forEach((f) => { if (!flagsAt[e.t].has(f)) { flagsAt[e.t].add(f); chg = true; } });
        [...ai, ...e.i].forEach((i) => { if (!itemsAt[e.t].has(i)) { itemsAt[e.t].add(i); chg = true; } });
        if (chg) changed = true;
      }
    }
  }
  const reachable = new Set(Object.keys(flagsAt));

  // ---- 终态 after 集 + 邻接 ----
  const adj = {};
  for (const id of reachable) {
    const n = NODES[id]; const af = new Set(flagsAt[id]); const ai = new Set(itemsAt[id]); expand(n, af, ai);
    adj[id] = liveEdges(n, af, ai).map((e) => e.t);
  }
  // ---- 前向可达终点(反向 BFS): 抓"可达却到不了任何结局/死亡"的活锁 ----
  const rev = {}; for (const a of Object.keys(adj)) for (const t of adj[a]) (rev[t] = rev[t] || []).push(a);
  const canEnd = new Set(); const q = [];
  for (const id of reachable) if (isTerminal(NODES[id])) { canEnd.add(id); q.push(id); }
  while (q.length) { const x = q.shift(); for (const p of (rev[x] || [])) if (!canEnd.has(p)) { canEnd.add(p); q.push(p); } }

  // ---- 检测 ----
  const deadLinks = []; const noSetterFlag = []; const noSourceItem = [];
  const hardStuck = []; const trapped = []; const condRisk = []; const statRisk = [];
  const allEdges = (n) => {
    const es = [];
    for (const c of (n.choices || [])) {
      if (!c?.next) continue;
      es.push({ t: c.next, rf: c.requireFlag, rfs: c.elseNext ? null : c.requireFlags, ri: c.requireItem, rs: c.requireSanityMin, rfe: c.requireFearMax, k: 'choice' });
      if (c.elseNext) es.push({ t: c.elseNext, ri: c.requireItem, k: 'choice-else' });
    }
    for (const f of NODE_JUMPS) if (typeof n[f] === 'string') es.push({ t: n[f], k: 'jump:' + f });
    const np = n.puzzle && PUZZLES[n.puzzle];
    if (np) { if (np.successNext) es.push({ t: np.successNext, k: 'puzzle' }); if (np.failNext) es.push({ t: np.failNext, k: 'puzzle-fail' }); }
    for (const h of (n.hotspots || [])) {
      if (!h) continue;
      for (const t of [h.nextNode, h.deathNode]) if (t) es.push({ t, rf: h.requireFlag, ri: h.requireItem, vis: visReqs(h), k: 'hotspot' });
      if (h.lockedNext) es.push({ t: h.lockedNext, vis: visReqs(h), k: 'hotspot-locked' });
      const p = h.puzzle && PUZZLES[h.puzzle];
      if (p) for (const t of [p.successNext, p.failNext]) if (t) es.push({ t, rf: h.requireFlag, ri: h.requireItem, vis: visReqs(h), k: 'hotspot-puzzle' });
    }
    return es;
  };
  for (const id of Object.keys(NODES)) {
    const n = NODES[id];
    for (const e of allEdges(n)) {
      if (!NODES[e.t]) deadLinks.push(`${id} --(${e.k})--> ${e.t}`);
      for (const f of [e.rf, ...(e.rfs || [])].filter(Boolean)) if (!flagSetters.has(f)) noSetterFlag.push(`${id} (${e.k}) 需 flag '${f}' 无来源`);
      for (const vf of (e.vis || [])) if (!flagSetters.has(vf)) noSetterFlag.push(`${id} (热点可见性) 需 flag '${vf}' 无来源`);
      if (e.ri && !itemSources.has(e.ri)) noSourceItem.push(`${id} (${e.k}) 需道具 '${e.ri}' 无来源`);
    }
    for (const c of (n.choices || [])) for (const f of (c?.requireFlags || [])) if (!flagSetters.has(f)) noSetterFlag.push(`${id} (判定选项) 需 flag '${f}' 无来源`);
    for (const h of (n.hotspots || [])) {
      for (const f of [h.requireFlag, ...visReqs(h)].filter(Boolean)) if (!flagSetters.has(f)) noSetterFlag.push(`${id}#${h.id} 需 flag '${f}' 无来源`);
      if (h.requireItem && !itemSources.has(h.requireItem)) noSourceItem.push(`${id}#${h.id} 需道具 '${h.requireItem}' 无来源`);
    }
    if (!reachable.has(id) || isTerminal(n)) continue;
    const live = adj[id] || [];
    if (live.length === 0) { hardStuck.push(`${id} [${n.chapter || ''}] 无任何可走出边`); continue; }
    if (!canEnd.has(id)) trapped.push(`${id} [${n.chapter || ''}] 可达但前向到不了任何结局/死亡(活锁/断链)`);
    const es = allEdges(n).filter((e) => NODES[e.t]);
    const uncond = es.some((e) => !e.rf && !(e.rfs && e.rfs.length) && !e.ri && e.rs === undefined && e.rfe === undefined && !(e.vis && e.vis.length));
    if (!uncond) condRisk.push(`${id} [${n.chapter || ''}] 无无条件出口(到达缺前置即可能卡)`);
    if (!uncond && es.length && es.every((e) => e.rs !== undefined || e.rfe !== undefined)) statRisk.push(`${id} [${n.chapter || ''}] 仅数值门控`);
  }
  const uniq = (a) => [...new Set(a)];
  // ---- flag 感知不可达节点: 任何不可达=门控把内容/进度锁死 ----
  const unreachable = Object.keys(NODES).filter((id) => !reachable.has(id));
  return { reachable, flagSetters, itemSources, unreachable, deadLinks, noSetterFlag: uniq(noSetterFlag), noSourceItem: uniq(noSourceItem), hardStuck, trapped, condRisk, statRisk };
}

function report(title, r, total) {
  const P = (t, arr) => { console.log(`\n${t} = ${arr.length}`); arr.slice(0, 30).forEach((x) => console.log('  - ' + x)); };
  console.log(`==== ${title} ====`);
  console.log(`可达节点 ${r.reachable.size}/${total}; flag 来源 ${r.flagSetters.size}; 道具来源 ${r.itemSources.size}`);
  P('❌ flag感知不可达节点(基线应为0)', r.unreachable);
  P('❌ 死链', r.deadLinks); P('❌ 无来源 flag', r.noSetterFlag); P('❌ 无来源道具', r.noSourceItem);
  P('❌ 硬卡死', r.hardStuck); P('❌ 活锁/断链(前向到不了任何终点)', r.trapped);
  P('⚠️  无无条件出口(待人工确认)', r.condRisk); P('⚠️  仅数值门控', r.statRisk);
  return r.unreachable.length + r.deadLinks.length + r.noSetterFlag.length + r.noSourceItem.length + r.hardStuck.length + r.trapped.length;
}

const { NODES, ITEMS, PUZZLES } = parsed;
const total = Object.keys(NODES).length;

if (process.argv.includes('--selftest')) {
  // 在内存副本里抽掉"红绳(red_string)"的唯一热点来源 -> paper_talisman 不可合成 ->
  // coffin_sealed/name_known 无法设 -> node06_explore 的 hall_ready_exit 永不可见 -> 之后的节点应被抓到不可达。
  const clone = JSON.parse(JSON.stringify(NODES));
  let removed = 0;
  for (const id of Object.keys(clone)) for (const h of (clone[id].hotspots || [])) {
    if (h && itemKey(h.item) === 'red_string') { delete h.item; removed++; }
  }
  console.log(`[selftest] 抽掉 red_string 来源 ${removed} 处`);
  const r = analyze(clone, ITEMS, PUZZLES);
  const caught = r.unreachable.length > 0 || r.trapped.length > 0 || r.hardStuck.length > 0 || r.noSourceItem.length > 0;
  report('SELFTEST(植入断链后)', r, total);
  console.log(`\n${caught ? '✅ SELFTEST 通过: 探测器抓到了植入的断链(非假绿)' : '❌ SELFTEST 失败: 植入断链未被发现(假绿!)'}`);
  process.exit(caught ? 0 : 2);
}

const r = analyze(NODES, ITEMS, PUZZLES);
const hard = report('全流程穷举模拟 v3', r, total);
console.log(`\n${hard === 0 ? '✅ 无硬性流程 bug' : '❌ 有 ' + hard + ' 个硬性问题'} (另有 ${r.condRisk.length + r.statRisk.length} 个待人工确认风险点)`);
process.exit(hard === 0 ? 0 : 1);
