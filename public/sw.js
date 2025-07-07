// Service Worker para Stater - Anti-Loop v2.0.0
const CACHE_NAME = 'stater-v2.0.0-no-loop';

// Install - limpo e rápido
self.addEventListener('install', (event) => {
  console.log('SW: Installing v2.0.0 (Anti-Loop)');
  self.skipWaiting(); // Ativar imediatamente sem cache inicial
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating v2.0.0');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('SW: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
  
  // Ensure the service worker takes control immediately
  event.waitUntil(self.clients.claim());
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // ANTI-LOOP: Não interceptar páginas principais e APIs críticas
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  
  // Não interceptar rotas do app que podem causar loop
  if (pathname === '/' || 
      pathname.startsWith('/dashboard') || 
      pathname.startsWith('/api/') ||
      pathname.includes('auth') ||
      pathname.includes('supabase') ||
      url.searchParams.has('token') ||
      url.searchParams.has('code')) {
    console.log('SW: Skipping interception for:', pathname);
    return; // Deixa passar direto
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('SW: Serving from cache', event.request.url);
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        console.log('SW: Fetching from network', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Don't cache if response is not ok
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response before caching
            const responseToCache = response.clone();
            
            // Cache successful responses
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('SW: Fetch failed', error);
            
            // Return a custom offline page if available
            if (event.request.destination === 'document') {
              return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Stater - Offline</title>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .offline { color: #666; }
                  </style>
                </head>
                <body>
                  <h1>Stater</h1>
                  <p class="offline">Você está offline. Conecte-se à internet para usar o app.</p>
                  <button onclick="window.location.reload()">Tentar novamente</button>
                </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' }
              });
            }
            
            throw error;
          });
      })
  );
});

// Message handler para debug
self.addEventListener('message', (event) => {
  console.log('SW: Message received:', event.data);
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach(cacheName => caches.delete(cacheName));
    });
  }
});

console.log('SW: v2.0.0 Anti-Loop loaded successfully');
