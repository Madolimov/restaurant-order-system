const CACHE_NAME = 'restoran-buyurtma-v9';
const SHELL_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  // {cache:'reload'} bypasses the browser's own HTTP cache (GitHub Pages sends
  // max-age=600 on these files) - without it, a fresh SW version could still
  // precache a stale copy for up to 10 minutes after a deploy.
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(SHELL_FILES.map(url => fetch(url, { cache: 'reload' }).then(res => cache.put(url, res))))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Never cache calls to the Apps Script API - always go to network
  if (url.hostname.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => cached);
    })
  );
});
