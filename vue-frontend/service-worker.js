const CACHE_NAME = 'huihunye-20260601-hotfix21-disabled';

// 相对 SW 所在目录解析, 不再写死旧部署子路径 /weikongbu/
const ASSETS = ['./', './index.html', './offline.html'];



self.addEventListener('install', (e) => {

  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      // 只预缓存离线兜底页(其余资源仍走网络, 避免旧 UI 缓存问题)
      .then(() => caches.open(CACHE_NAME))
      .then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );

  self.skipWaiting();

});



self.addEventListener('activate', (e) => {

  e.waitUntil(

    caches.keys().then((keys) =>

      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))

    )

  );

  self.clients.claim();

});



self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;            // POST(/api/*) 等直接走网络, 不经 SW
  if (req.mode === 'navigate') {
    // 页面导航: 断网时回退到缓存的 offline.html(没有就退 index.html), 不再返回空白 504
    e.respondWith(
      fetch(req).catch(() =>
        caches.match('./offline.html', { ignoreSearch: true })
          .then((r) => r || caches.match('./index.html', { ignoreSearch: true }))
          .then((r) => r || new Response('<!doctype html><meta charset="utf-8"><title>回魂夜 - 离线</title><p style="color:#c9a86c;background:#000;padding:40px">网络断开了，稍后再来。</p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } }))
      )
    );
    return;
  }
  e.respondWith(fetch(req).catch(() => caches.match(req).then((r) => r || Response.error())));
});
