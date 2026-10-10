// 检查 index.html 模板里引用的标识符是否在 app.js / mixin 的 data/methods/computed 中定义
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const FE = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(FE, 'index.html'), 'utf8');
const js = ['app.js','sceneMixin.js','uiMixin.js','smsMixin.js','persistenceMixin.js'].map(f => readFileSync(join(FE,'js',f),'utf8')).join('\n');
const defined = new Set();
for (const m of js.matchAll(/^\s{4,12}(?:async\s+)?([A-Za-z_$][\w$]*)\s*(?:\([^)]*\)\s*\{|:)/gm)) defined.add(m[1]);
const attrs = [...html.matchAll(/\s(?:@|v-on:|:|v-if=|v-else-if=|v-show=|v-model=|v-for=|v-bind:)([\w.-]*)="([^"]*)"/g)].map(m => m[2]);
const mustache = [...html.matchAll(/\{\{([\s\S]*?)\}\}/g)].map(m => m[1]);
const ignore = new Set(['true','false','null','undefined','in','of','if','else','Math','JSON','String','Number','Array','Object','$event','i','idx','item','slot','s','a','d','m','e','key','code','index','rec','h','w','n','t','x','y','c','window','Date','encodeURIComponent','parseInt','typeof','new','return','length','toFixed','includes','map','filter','join','find','replace','trim','slice','split','some','every','name','text','id','style','value']);
const unknown = new Map();
const loopVars = new Set([...html.matchAll(/v-for="\(?\s*([\w$]+)(?:\s*,\s*([\w$]+))?(?:\s*,\s*([\w$]+))?\s*\)?\s+(?:in|of)/g)].flatMap(m => [m[1],m[2],m[3]].filter(Boolean)));
for (const expr of [...attrs, ...mustache]) {
  const cleaned = expr.replace(/'[^']*'|`[^`]*`|"[^"]*"/g, '');
  for (const m of cleaned.matchAll(/(^|[^.\w$])([A-Za-z_$][\w$]*)/g)) {
    const id = m[2];
    if (ignore.has(id) || loopVars.has(id) || defined.has(id)) continue;
    unknown.set(id, (unknown.get(id)||0)+1);
  }
}
console.log('未定义标识符:', [...unknown.entries()]);
