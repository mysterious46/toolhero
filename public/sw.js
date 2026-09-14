const CACHE_NAME = 'toolhero-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Paths that are real static files, not SPA routes.
// These should NEVER fall back to the app shell (index.html) —
// if the network fetch fails, the browser should see a real error,
// not a misleading "Category not found" from the React router.
const STATIC_FILE_PATHS = [
  '/sitemap.xml',
  '/robots.txt',
  '/ads.txt',
  '/manifest.json',
  '/favicon.svg',
  '/sw.js'
];

function isStaticFile(pathname) {
  return STATIC_FILE_PATHS.includes(pathname) || pathname.startsWith('/assets/');
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Known static files: always go straight to the network.
  // No app-shell fallback, no stale cache masking a real failure.
  if (isStaticFile(url.pathname)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Navigation requests (actual SPA routes): network first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets: cache first, update in background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background update
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
