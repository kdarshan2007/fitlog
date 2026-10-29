const C = 'fitlog-v5';

const A = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(C).then(cache =>
      Promise.all(A.map(url => cache.add(url).catch(() => {})))
    )
  );

  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('fitlog-') && key !== C)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();

          caches.open(C).then(cache =>
            cache.put(event.request, copy)
          );
        }

        return response;
      })
      .catch(() =>
        caches.match(event.request).then(cached =>
          cached ||
          (event.request.mode === 'navigate'
            ? caches.match('./index.html')
            : undefined)
        )
      )
  );
});
