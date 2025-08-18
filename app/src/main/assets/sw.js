// TWA-optimized Service Worker for Stater App
const CACHE_NAME = 'stater-twa-v1.0';
const CACHE_URLS = [
  '/',
  '/login',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// TWA-specific optimization flags
const TWA_CONFIG = {
  enableOfflineSupport: true,
  enablePushNotifications: true,
  enableBackgroundSync: true,
  cacheStrategy: 'cache-first'
};

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('TWA Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('TWA Service Worker: Caching app shell');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('TWA Service Worker: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('TWA Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('TWA Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('TWA Service Worker: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('TWA Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        
        console.log('TWA Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone response for cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Fallback for offline
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Push notification event
self.addEventListener('push', event => {
  if (!TWA_CONFIG.enablePushNotifications) return;
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Stater',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: 'stater-notification'
  };

  event.waitUntil(
    self.registration.showNotification('Stater', options)
  );
});

// Background sync event
self.addEventListener('sync', event => {
  if (!TWA_CONFIG.enableBackgroundSync) return;
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Message event for TWA communication
self.addEventListener('message', event => {
  console.log('TWA Service Worker: Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({version: CACHE_NAME});
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Sync offline data when online
    console.log('TWA Service Worker: Performing background sync');
    // Implementation depends on your app's needs
  } catch (error) {
    console.log('TWA Service Worker: Background sync failed:', error);
  }
}

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('TWA Service Worker: Loaded and ready');
