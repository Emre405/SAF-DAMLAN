const CACHE_NAME = 'saf-damla-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache'de varsa cache'den döndür
        if (response) {
          return response;
        }
        
        // Cache'de yoksa network'ten al
        return fetch(event.request).catch(() => {
          // Network hatası durumunda offline sayfa döndür
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
}); 