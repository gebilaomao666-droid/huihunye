// 导出所有节点文本(按章节分组)供文案审查。输出到 stdout(JSON)。
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
let src = readFileSync(join(here, '..', 'vue-frontend', 'js', 'nodes.js'), 'utf8');
src = src.replace(/export\s*\{[\s\S]*?\};/, '').replace(/if\s*\(typeof window[\s\S]*$/, '');
const { NODES } = new Function(src + '\nreturn { NODES };')();
const out = {};
for (const id of Object.keys(NODES)) {
  const n = NODES[id];
  const ch = n.chapter || '(无章节)';
  out[ch] = out[ch] || [];
  const entry = { id };
  if (n.text) entry.text = n.text;
  if (Array.isArray(n.choices)) entry.choices = n.choices.map(c => c && c.text).filter(Boolean);
  if (n.deathName) entry.deathName = n.deathName;
  if (n.deathDesc) entry.deathDesc = n.deathDesc;
  if (n.endingName) entry.endingName = n.endingName;
  if (n.endingText) entry.endingText = n.endingText;
  // 探索热点/特写文本
  if (Array.isArray(n.hotspots)) {
    const hs = n.hotspots.filter(Boolean).map(h => ({ label: h.label, itemName: h.itemName, closeupText: h.closeupText, missingText: h.missingText })).filter(x => x.label || x.closeupText || x.missingText);
    if (hs.length) entry.hotspots = hs;
  }
  out[ch].push(entry);
}
writeFileSync(join(here, '..', 'docs', 'agent', '_texts_export.json'), JSON.stringify(out, null, 1), 'utf8');
console.log('written utf8:', Object.keys(out).length, 'chapters');
