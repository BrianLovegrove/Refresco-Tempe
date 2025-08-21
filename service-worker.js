const CACHE='refresco-v1';
const CORE=['/','/index.html','/styles.css','/app.js','/manifest.json','/data/structure.json'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(CORE);self.skipWaiting();})());});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const ks=await caches.keys();await Promise.all(ks.map(k=>k===CACHE?null:caches.delete(k)));self.clients.claim();})());});
self.addEventListener('fetch',e=>{e.respondWith((async()=>{const c=await caches.open(CACHE);const r=await c.match(e.request);if(r) return r;try{const n=await fetch(e.request); if(n.ok && e.request.method==='GET') c.put(e.request,n.clone()); return n;}catch{return r||new Response('Offline',{status:503});}})());});