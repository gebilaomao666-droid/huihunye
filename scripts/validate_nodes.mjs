// 发版前用 Node 跑一次节点引用完整性校验:  node scripts/validate_nodes.mjs
// 复用 vue-frontend/js/nodes.js 里导出的 validateNodes, 不依赖打包器。
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
let src = readFileSync(join(here, '..', 'vue-frontend', 'js', 'nodes.js'), 'utf8');

// nodes.js 是浏览器 ES module: 去掉 export 语句与浏览器 dev 自检块, 用 Function 取出数据。
src = src.replace(/export\s*\{[\s\S]*?\};/, '');
src = src.replace(/if\s*\(typeof window[\s\S]*$/, '');

const factory = new Function(src + '\nreturn { NODES, ITEMS, PUZZLES, validateNodes };');
const { NODES, ITEMS, PUZZLES, validateNodes } = factory();

const problems = validateNodes(NODES, ITEMS, PUZZLES);
if (problems.length) {
    console.error(`✗ nodes.js 引用完整性: 发现 ${problems.length} 个问题`);
    problems.forEach(p => console.error('  - ' + p));
    process.exit(1);
}
console.log(`✓ nodes.js 引用完整性校验通过 (${Object.keys(NODES).length} 个节点)`);
