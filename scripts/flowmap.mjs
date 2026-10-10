// 导出剧情分支骨架(节点→选项→去向, 结局/死亡标记), 供人工梳理。
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
let src = readFileSync(join(here, '..', 'vue-frontend', 'js', 'nodes.js'), 'utf8');
src = src.replace(/export\s*\{[\s\S]*?\};/, '').replace(/if\s*\(typeof window[\s\S]*$/, '');
const { NODES, PUZZLES } = new Function(src + '\nreturn { NODES, PUZZLES };')();

const JUMP = ['returnNode'];
const lines = [];
const byCh = {};
for (const id of Object.keys(NODES)) {
  const n = NODES[id];
  const ch = n.chapter || '(无章节)';
  (byCh[ch] = byCh[ch] || []).push(id);
}
for (const ch of Object.keys(byCh)) {
  lines.push(`\n## ${ch}`);
  for (const id of byCh[ch]) {
    const n = NODES[id];
    let tag = '';
    if (n.isEnding) tag = ` 【结局:${n.endingName || n.endingCode || ''}】`;
    else if (n.isDeath) tag = ` 【死:${n.deathName || ''}】`;
    const summary = (n.text || '').replace(/\n/g, ' ').slice(0, 50);
    lines.push(`\n- ${id}${tag}  时间:${n.time || '-'}`);
    if (summary) lines.push(`  叙述: ${summary}${(n.text || '').length > 50 ? '…' : ''}`);
    // 出边
    const edges = [];
    for (const c of (n.choices || [])) {
      if (c && c.next) {
        const gate = [c.requireItem && `需道具:${c.requireItem}`, c.requireFlag && `需flag:${c.requireFlag}`, c.requireFlags && `判定:${c.requireFlags.join('+')}`].filter(Boolean).join(',');
        edges.push(`  └ 选「${c.text}」→ ${c.next}${gate ? ` (${gate})` : ''}`);
        if (c.elseNext) edges.push(`  └ 选「${c.text}」(判定不过)→ ${c.elseNext}`);
      }
    }
    for (const f of JUMP) if (typeof n[f] === 'string') edges.push(`  └ [${f}] → ${n[f]}`);
    const np = n.puzzle && PUZZLES[n.puzzle];
    if (np) { if (np.successNext) edges.push(`  └ [谜题 ${n.puzzle} 成功] → ${np.successNext}`); if (np.failNext) edges.push(`  └ [谜题 ${n.puzzle} 失败] → ${np.failNext}`); }
    for (const h of (n.hotspots || [])) {
      if (!h) continue;
      const p = h.puzzle && PUZZLES[h.puzzle];
      const t = h.nextNode || h.deathNode || (p && p.successNext);
      if (h.lockedNext) edges.push(`  └ 热点「${h.label || '?'}」(条件不齐)→ ${h.lockedNext}`);
      if (p && p.failNext) edges.push(`  └ 热点「${h.label || '?'}」谜题失败→ ${p.failNext}`);
      if (t) edges.push(`  └ 热点「${h.label || h.itemName || '?'}」→ ${t}`);
    }
    if (n.deathName && !edges.length) edges.push('  └ (死亡终点)');
    if (n.isEnding && !edges.length) edges.push('  └ (结局终点)');
    lines.push(...edges);
  }
}
writeFileSync(join(here, '..', 'docs', 'agent', '_flowmap.md'), lines.join('\n'), 'utf8');
console.log('written _flowmap.md;', Object.keys(NODES).length, 'nodes');
