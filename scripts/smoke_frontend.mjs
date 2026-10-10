// 前端冒烟测试: 用系统 Edge 无头加载游戏并脚本化走一段流程, 验证无未捕获错误。
// 用法: node smoke.mjs [frontendDir]
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const FRONTEND = process.argv[2] || 'D:\\py\\项目\\回魂夜\\vue-frontend';
const PORT = 8123;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};

const server = http.createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(req.url.split('?')[0]);
    if (pathname === '/') pathname = '/index.html';
    const filePath = path.join(FRONTEND, path.normalize(pathname));
    if (!filePath.startsWith(FRONTEND)) { res.writeHead(403).end(); return; }
    if (!existsSync(filePath)) { res.writeHead(404).end('not found'); return; }
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  } catch (e) { res.writeHead(500).end(String(e)); }
});
await new Promise((r) => server.listen(PORT, r));

const consoleErrors = [], pageErrors = [], allConsole = [];
const steps = [];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
page.on('console', (m) => { allConsole.push(`[${m.type()}] ${m.text()}`); if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => pageErrors.push(e.message));

// 拦截后端调用, 返回即时假数据 (避免离线重试拖延 + 流程确定)
await page.route('**/api/**', (route) => {
  const url = route.request().url();
  let body = {};
  if (url.includes('/api/session')) body = { session_id: 'smoke-session', started_at: '1970-01-01T00:00:00', message: '' };
  else if (url.includes('/api/stats')) body = { total_sessions: 0, total_deaths: 0 };
  else if (url.includes('/api/last-word/random')) body = { has_word: false };
  else if (url.includes('/api/achievements')) body = { achievements: [] };
  else if (url.includes('/api/endings')) body = { endings: [] };
  else if (url.includes('/api/leaderboard')) body = { leaderboard: [], total: 0 };
  route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
});

const softClick = async (sel) => { try { const el = await page.$(sel); if (el) { await el.click({ timeout: 2000 }).catch(() => {}); return true; } } catch {} return false; };

let mounted = false, reachedGame = false, clickedChoice = false, mountErr = '';
try {
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForFunction(() => {
    const a = document.querySelector('#app');
    return a && a.children.length > 0 && !a.innerHTML.includes('{{');
  }, { timeout: 15000 });
  mounted = true; steps.push('挂载');

  // 1. 填名字 (手动派发 input 事件确保 Vue v-model 更新) + 入宅
  await page.$eval('.name-input', (el) => {
    el.value = '测试员';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForSelector('.start-btn:not([disabled])', { timeout: 5000 });
  await page.click('.start-btn', { timeout: 5000, force: true });
  await page.waitForSelector('#game-screen', { timeout: 10000 });
  reachedGame = true; steps.push('进入游戏');

  // 2. 跳过打字机/过场, 等选项出现 (最多点 8 次推进)
  for (let i = 0; i < 8; i++) {
    const choice = await page.$('#choices-rpg .talisman-btn, .choice-btn');
    if (choice && await choice.isVisible().catch(() => false)) break;
    await softClick('#rpg-dialog');
    await page.mouse.click(200, 300).catch(() => {});
    await page.waitForTimeout(700);
  }
  // 3. 点第一个选项
  const choice = await page.$('#choices-rpg .talisman-btn, .choice-btn');
  if (choice && await choice.isVisible().catch(() => false)) {
    await choice.click({ timeout: 3000 }).catch(() => {});
    clickedChoice = true; steps.push('做出选择');
    await page.waitForTimeout(800);
  }
  // 4. 开背包 -> 关; 开菜单 -> 关 (尽力而为, 错误仍会被记录)
  if (await softClick('.hud-tool-btn[title="背包"]')) { steps.push('开背包'); await page.waitForTimeout(400); await softClick('#inventory-panel'); await page.keyboard.press('Escape').catch(() => {}); }
  if (await softClick('.hud-tool-btn[title="菜单"]')) { steps.push('开菜单'); await page.waitForTimeout(400); await softClick('#main-menu'); }
  await page.waitForTimeout(800);
} catch (e) { mountErr = e.message.split('\n')[0]; }

const nodesSelfCheck = allConsole.find((l) => l.includes('引用完整性自检'));
const realErrors = [...pageErrors, ...consoleErrors].filter((m) =>
  !/fetch|networkerror|failed to load resource|8080|err_connection|net::|api\/|favicon/i.test(m));

await browser.close();
await new Promise((r) => server.close(r));

console.log('==== 冒烟测试结果 ====');
console.log('走到的步骤:', steps.join(' → ') || '(无)');
console.log('Vue 挂载:', mounted ? '✓' : '✗ ' + mountErr);
console.log('进入游戏:', reachedGame ? '✓' : '✗');
console.log('做出选择:', clickedChoice ? '✓' : '✗ (未找到可点选项)');
console.log('nodes 自检:', nodesSelfCheck ? '✓' : '(未捕获)');
console.log('未捕获页面错误:', pageErrors.length);
console.log('真实 JS 错误(滤除网络噪声):', realErrors.length);
realErrors.slice(0, 10).forEach((m) => console.log('   ✗ ' + m));
if (mountErr) console.log('流程提示:', mountErr);

const pass = mounted && reachedGame && realErrors.length === 0;
console.log(pass ? '\nPASS ✅' : '\nFAIL ❌');
process.exit(pass ? 0 : 1);
