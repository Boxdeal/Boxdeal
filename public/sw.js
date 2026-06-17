const CACHE_NAME = 'boxdeal-v2';
const HERO_CACHE = 'boxdeal-hero-images-v2';
const API_CACHE = 'boxdeal-api-v2';

const CRITICAL_ASSETS = [
  '/',
  '/app.css',
];

const HERO_IMAGE_PATTERNS = [
  /\/storage\/v1\/object\/public\/banners\//,
  /\/storage\/v1\/object\/public\/deal-of-day\//,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CRITICAL_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== HERO_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only ever handle GET. Mutations (POST/PATCH/PUT/DELETE — e.g. Supabase
  // profile upserts) must pass straight through to the network untouched;
  // caching them is invalid and caused failed responses to surface as errors.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cache hero images aggressively (these live on cross-origin Supabase storage).
  if (HERO_IMAGE_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) return response;
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(HERO_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }

  // Any other cross-origin request (Supabase REST/Auth, analytics, …) passes
  // straight through, so a non-2xx response (e.g. 406) is delivered as-is and
  // never falls into the HTML fallback below.
  if (url.origin !== self.location.origin) return;

  // Network first for API calls, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Cache first for images and assets
  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) return response;
        return fetch(request).then((response) => {
          if (!response || response.status !== 200) return response;
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }

  // Network first for HTML, falling back to cache when offline. Always resolve
  // to a real Response — returning undefined throws
  // "Failed to convert value to 'Response'".
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = (await caches.match(request)) || (await caches.match('/'));
      return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
    })
  );
});
