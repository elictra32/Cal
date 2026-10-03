// Cal service worker: app shell works offline; pages are network-first so updates arrive on the next open.
const CACHE = 'cal-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'assets/icon-192.png', 'assets/icon-512.png', 'assets/apple-touch-icon.png',
  'assets/cal/bg.jpg', 'assets/cal/pug.png', 'assets/cal/fox.png',
  ...['m', 'f'].flatMap((s) => ['s', '0', '1', '2'].map((k) => `assets/cal/hero_${s}_${k}.png`))];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return; // API + third parties go straight to the network
  const fresh = req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  e.respondWith(fresh
    ? fetch(req).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return res; }).catch(() => caches.match(req).then((m) => m || caches.match('index.html')))
    : caches.match(req).then((m) => m || fetch(req).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return res; })));
});
