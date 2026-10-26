// Bump VERSION whenever any app file changes so iPads pick up the update.
const VERSION = 'checklists-v63';
const CHARTS = ['8-2', '8-3', '8-4', '8-5', '8-6', '8-7', '8-8', '8-9', '8-10', '8-13', '8-14'].map(c => './charts/' + c + '.jpg');   // POH Section 8
const FILES = ['./', './index.html', './manifest.webmanifest', './defaults.js', './perf.js', './charts.js', './icon-180.png', './icon-512.png'].concat(CHARTS);

self.addEventListener('install', e => {
  // cache: 'reload' skips the browser's HTTP cache, so an update never stores stale copies of old files.
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache first, so the app always opens instantly with no connection.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request))
  );
});
