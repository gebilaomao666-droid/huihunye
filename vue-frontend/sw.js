// 极简 Service Worker: 不缓存任何资源, 只为让浏览器允许「添加到桌面」。
// 真正的离线缓存会让旧界面卡在玩家手机里, 所以这里什么都不做。
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
