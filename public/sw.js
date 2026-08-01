// Progressive Web App Service Worker for Sistema Oficina PDV
const CACHE_NAME = 'oficinapdv-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache first, fall back to network for assets, update cache in background
self.addEventListener('fetch', (e) => {
  // Ignore API calls or external auth requests so they go directly to the server
  if (e.request.url.includes('/api/') || e.request.url.includes('googleapis') || e.request.url.includes('firebase')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh in background and update cache
        fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
          }
        }).catch(() => {/* Ignore network errors on background updates */});
        
        return cachedResponse;
      }
      
      return fetch(e.request);
    })
  );
});
