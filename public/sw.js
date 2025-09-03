const CACHE_NAME = 'saf-damla-v4';
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
  // Hemen aktif ol
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Hemen kontrol et
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Sadece GET istekleri için cache stratejisi uygula
  if (event.request.method !== 'GET') {
    return;
  }

  // Firestore API istekleri için özel strateji
  if (event.request.url.includes('firestore.googleapis.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Network'ten başarılı yanıt alındıysa cache'e kaydet
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network hatası durumunda cache'den döndür
          return caches.match(event.request);
        })
    );
    return;
  }

  // HTML sayfaları için cache-first stratejisi (çevrimdışı çalışma için)
  if (event.request.destination === 'document') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            // Cache'de varsa önce cache'den döndür
            return response;
          }
          // Cache'de yoksa network'ten al
          return fetch(event.request)
            .then((response) => {
              // Network'ten başarılı yanıt alındıysa cache'e kaydet
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            });
        })
    );
    return;
  }

  // Statik kaynaklar için cache-first stratejisi
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            // Network'ten başarılı yanıt alındıysa cache'e kaydet
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          });
      })
  );
}); 