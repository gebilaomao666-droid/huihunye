// storage.js 单元测试 (mock localStorage):  node scripts/test_storage.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
let src = readFileSync(join(here, '..', 'vue-frontend', 'js', 'storage.js'), 'utf8');
src = src.replace(/export\s*\{[\s\S]*?\};/, '');

// mock localStorage
const store = {};
const localStorage = {
    getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
};

const m = new Function('localStorage', src + '\nreturn { KEYS, readJSON, writeJSON, readRaw, writeRaw, remove };')(localStorage);

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.error('  ✗ ' + msg); } };

m.writeJSON(m.KEYS.saves, [1, 2, 3]);
ok(JSON.stringify(m.readJSON(m.KEYS.saves, [])) === '[1,2,3]', 'writeJSON/readJSON 往返');
ok(m.readJSON('hhs_nope', 'def') === 'def', '缺失键返回默认值');

store['hhs_endings'] = '{坏掉的 json';
ok(JSON.stringify(m.readJSON(m.KEYS.endings, [])) === '[]', '损坏数据返回默认值');
ok(!Object.prototype.hasOwnProperty.call(store, 'hhs_endings'), '损坏键被清掉');

m.writeRaw(m.KEYS.session, 'sess-1');
ok(m.readRaw(m.KEYS.session) === 'sess-1', 'readRaw/writeRaw');
ok(m.readRaw('hhs_nope', '0') === '0', 'readRaw 缺失返回默认');
m.remove(m.KEYS.session);
ok(m.readRaw(m.KEYS.session) === null, 'remove 后读到 null');

ok(Object.values(m.KEYS).every((k) => k.startsWith('hhs_')), '所有键沿用 hhs_ 前缀');

console.log(`storage.js 单测: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
