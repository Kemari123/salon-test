const CACHE_NAME = 'kisii-dreadlocks-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css?v=2.0.0',
  '/script.js?v=2.0.0',
  '/logo.png',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Individually cache each asset and catch potential 404s/network errors safely
      // so a single missing or renamed asset does not block the Service Worker from registering successfully.
      const cachePromises = ASSETS_TO_CACHE.map((url) => {
        return cache.add(url).catch((err) => {
          console.warn('[ServiceWorker] Skip non-critical style/asset cache failure:', url, err);
        });
      });
      return Promise.all(cachePromises);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network first with Cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and exclude development websocket connections
  if (event.request.method !== 'GET' || event.request.url.includes('ws')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If valid response from network, cache it
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if offline
        return caches.match(event.request);
      })
  );
});
