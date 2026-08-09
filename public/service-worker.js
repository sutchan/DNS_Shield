// service-worker.js v3.7.4
// PWA 服务 worker 实现 - 安全加固版

const CACHE_NAME = 'dns-shield-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/assets/icons/icon-72x72.png',
  '/assets/icons/icon-96x96.png',
  '/assets/icons/icon-128x128.png',
  '/assets/icons/icon-144x144.png',
  '/assets/icons/icon-152x152.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-384x384.png',
  '/assets/icons/icon-512x512.png',
  '/domains.txt'
];

const CACHE_SAFE_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.json', '.txt'];

const isSafeToCache = (request) => {
  if (request.method !== 'GET') return false;
  try {
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return false;
    const pathname = url.pathname.toLowerCase();
    return CACHE_SAFE_EXTENSIONS.some(ext => pathname.endsWith(ext)) || pathname === '/' || pathname.endsWith('/');
  } catch {
    return false;
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            if (!isSafeToCache(event.request)) {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            return new Response('', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-domains') {
    event.waitUntil(syncDomains());
  }
});

async function syncDomains() {
  try {
    const response = await fetch('/domains.txt', { credentials: 'same-origin' });
    if (response.ok) {
      const data = await response.text();
      const cache = await caches.open(CACHE_NAME);
      await cache.put('/domains.txt', new Response(data, {
        headers: { 'Content-Type': 'text/plain' }
      }));
    }
  } catch (error) {
    // 静默处理错误
  }
}