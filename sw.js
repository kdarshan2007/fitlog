
const C = 'fitlog-v5';
const A = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(C).then(c =>
      Promise.all(A.map(u => c.add(u).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k.startsWith('fitlog-') && k !== C)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (
    e.request.method !== 'GET' ||
    new URL(e.request.url).origin !== location.origin
  ) return;

  e.respondWith(
    fetch(e.request).then(r => {
      const cp = r.clone();
      caches.open(C).then(c => c.put(e.request, cp));
      return r;
    }).catch(() =>
      caches.match(e.request).then(r =>
        r || caches.match('./index.html')
      )
    )
  );
});
