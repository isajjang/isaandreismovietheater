/* Moonlight Duel install and offline support. Keep alongside game.html. */
const CACHE_NAME = 'moonlight-duel-app-v1';
const APP_SHELL = ['./game.html', './manifest.webmanifest', './icons/moonlight-192.png', './icons/moonlight-512.png', './icons/moonlight-maskable-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('moonlight-duel-app-') && key !== CACHE_NAME).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname)) return;
  const path = url.pathname.slice(scope.pathname.length);
  // Don't interfere with unrelated pages sharing this GitHub Pages deployment.
  const allowed = path === 'game.html' || path === 'manifest.webmanifest' || path === 'sw.js' || path.startsWith('icons/') || path.startsWith('assets/');
  if (!allowed) return;
  if (path === 'game.html') {
    event.respondWith(fetch(req).then(async response => {
      if (response.ok && response.status === 200) {
        const cache = await caches.open(CACHE_NAME); await cache.put(req, response.clone());
      }
      return response;
    }).catch(() => caches.match(req)));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(response => {
    if (response.ok && response.status === 200 && !req.headers.has('range')) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req,copy)).catch(() => {});
    }
    return response;
  })));
});
