const CACHE = 'refresco-v4';
const CORE = [
  'index.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'data/tree.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE.concat(['./'])); // cache the repo root too
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k === CACHE ? null : caches.delete(k)));
    self.clients.claim();
  })());
});

// Handle navigations so subpaths under /Refresco-Tempe/ resolve correctly when installed
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cachedIndex = await cache.match('index.html', { ignoreSearch: true });
      try {
        const net = await fetch(e.request);
        return net;
      } catch {
        return cachedIndex || new Response('Offline', { status: 503 });
      }
    })());
    return;
  }

  // Cache-first for assets/data
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(e.request, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const net = await fetch(e.request);
      if (net.ok && e.request.method === 'GET') cache.put(e.request, net.clone());
      return net;
    } catch {
      return hit || new Response('Offline', { status: 503 });
    }
  })());
});
