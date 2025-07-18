// performance-worker.js
// Este service worker otimiza o carregamento de ativos estáticos e reduz o tempo de carregamento

const CACHE_NAME = 'stater-performance-cache-v1';
const ASSETS_TO_CACHE = [
  '/stater-logo-192.png',
  '/stater-logo.png',
  '/manifest.json',
  // Adicionar outros assets estáticos importantes aqui
];

// Instalação do service worker e pré-caching de assets importantes
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('🚀 Cache aberto para pré-caching de performance');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Estratégia de cache: Cache First com fallback para rede
self.addEventListener('fetch', (event) => {
  // Ignorar requisições de API/backend
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('supabase')) {
    return;
  }
  
  // Estratégia Cache First para arquivos estáticos
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Não encontrou no cache, busca na rede e atualiza cache
      return fetch(event.request)
        .then((response) => {
          // Não cachear respostas não-200 ou requisições não GET
          if (!response || response.status !== 200 || event.request.method !== 'GET') {
            return response;
          }
          
          // Clone a resposta para poder usar o body depois
          const responseToCache = response.clone();
          
          // Adiciona ao cache
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
    })
  );
});

// Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  const cacheAllowlist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
