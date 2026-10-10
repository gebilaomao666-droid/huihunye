// 剧情流程图分析: 可达性 / 死胡同 / 结局路径 / 心跳与玩法覆盖盲区。
//   node scripts/analyze_flow.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
let src = readFileSync(join(here, '..', 'vue-frontend', 'js', 'nodes.js'), 'utf8');
src = src.replace(/export\s*\{[\s\S]*?\};/, '').replace(/if\s*\(typeof window[\s\S]*$/, '');
const { NODES, BPM_MAP, PUZZLES } = new Function(src + '\nreturn { NODES, BPM_MAP, PUZZLES };')();

const START = 'node01';
const JUMP = ['returnNode'];
const pzTargets = (id) => { const p = id && PUZZLES[id]; return p ? [p.successNext, p.failNext].filter(Boolean) : []; };

function targets(node) {
  const out = [];
  if (Array.isArray(node.choices)) node.choices.forEach((c) => { if (c && c.next) out.push(c.next); if (c && c.elseNext) out.push(c.elseNext); });
  JUMP.forEach((f) => { if (typeof node[f] === 'string') out.push(node[f]); });
  out.push(...pzTargets(node.puzzle));
  if (Array.isArray(node.hotspots)) node.hotspots.forEach((h) => {
    if (!h) return;
    ['nextNode', 'deathNode', 'lockedNext'].forEach((f) => { if (h[f]) out.push(h[f]); });
    out.push(...pzTargets(h.puzzle), ...pzTargets(h.stepPuzzle));
  });
  return out.filter((t) => NODES[t]);
}

// BFS 可达性
const reachable = new Set([START]);
const queue = [START];
while (queue.length) {
  const id = queue.shift();
  for (const t of targets(NODES[id] || {})) if (!reachable.has(t)) { reachable.add(t); queue.push(t); }
}

const ids = Object.keys(NODES);
const unreachable = ids.filter((id) => !reachable.has(id));
const endings = ids.filter((id) => NODES[id].isEnding);
const deaths = ids.filter((id) => NODES[id].isDeath);
const isEnd = (n) => n.isEnding || n.isDeath;
const deadEnds = ids.filter((id) => reachable.has(id) && !isEnd(NODES[id]) && targets(NODES[id]).length === 0);

// 按章节统计
const byChapter = {};
for (const id of ids) {
  const ch = NODES[id].chapter || '(无章节)';
  byChapter[ch] = byChapter[ch] || { nodes: 0, choices: 0, deaths: 0, endings: 0 };
  byChapter[ch].nodes++;
  byChapter[ch].choices += Array.isArray(NODES[id].choices) ? NODES[id].choices.length : 0;
  if (NODES[id].isDeath) byChapter[ch].deaths++;
  if (NODES[id].isEnding) byChapter[ch].endings++;
}

// 心跳盲区: 可达的非死亡非结局节点未配 BPM
const bpmGap = ids.filter((id) => reachable.has(id) && !isEnd(NODES[id]) && !(BPM_MAP && BPM_MAP[id]));

console.log('==== 剧情流程分析 ====');
console.log(`总节点 ${ids.length}; 可达 ${reachable.size}; 不可达 ${unreachable.length}`);
if (unreachable.length) console.log('  不可达节点:', unreachable.join(', '));
console.log(`\n结局 ${endings.length} 个:`);
endings.forEach((id) => console.log(`  ${reachable.has(id) ? '✓可达' : '✗不可达'}  ${id}  [${NODES[id].endingCode}] ${NODES[id].endingName}`));
const unreachEnd = endings.filter((id) => !reachable.has(id));
console.log(`  -> 可达结局 ${endings.length - unreachEnd.length}/${endings.length}` + (unreachEnd.length ? `  ✗不可达: ${unreachEnd.join(',')}` : ''));
console.log(`\n死亡节点 ${deaths.length} 个 (可达 ${deaths.filter((id) => reachable.has(id)).length})`);
console.log(`\n死胡同(可达但无出口、又非结局/死亡)= ${deadEnds.length}:`);
deadEnds.forEach((id) => console.log(`  ✗ ${id} (${NODES[id].chapter || ''})`));
console.log('\n按章节:');
Object.entries(byChapter).forEach(([ch, s]) => console.log(`  ${ch.padEnd(22)} 节点${String(s.nodes).padStart(3)}  选项${String(s.choices).padStart(3)}  死法${s.deaths}  结局${s.endings}`));
console.log(`\n心跳 BPM 盲区(可达推进节点未配心跳)= ${bpmGap.length}:`);
console.log('  ' + bpmGap.join(', '));
