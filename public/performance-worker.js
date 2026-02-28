// performance-worker.js
// Este service worker otimiza o carregamento de ativos estáticos e reduz o tempo de carregamento

const CACHE_NAME = 'stater-performance-cache-v3';
const STATIC_CACHE_NAME = 'stater-static-assets-v3';
const RUNTIME_CACHE_NAME = 'stater-runtime-cache-v3';

// Assets críticos para pré-cachear
const ASSETS_TO_CACHE = [
  '/stater-logo-192.png',
  '/stater-logo.png',
  '/manifest.json',
  '/index.html',
  '/stater-icon.png',
  '/favicon.ico',
  '/vite.svg'
];

// Instalação do service worker e pré-caching de assets importantes
self.addEventListener('install', (event) => {
  // Skip waiting para ativar imediatamente o novo service worker
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      // Cache estático para assets importantes
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('🚀 Cache estático aberto para assets críticos');
        return cache.addAll(ASSETS_TO_CACHE);
      }),
      
      // Preparar cache runtime
      caches.open(RUNTIME_CACHE_NAME).then((cache) => {
        console.log('⚡ Cache runtime preparado');
      })
    ])
  );
});

// Estratégia de cache otimizada para diferentes tipos de recursos
self.addEventListener('fetch', (event) => {
  // Ignorar requisições de API/backend
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('supabase')) {
    return;
  }
  
  // Verificar se é um recurso estático
  const isStaticAsset = ASSETS_TO_CACHE.some(asset => 
    event.request.url.endsWith(asset) || 
    event.request.url.includes(asset)
  );
  
  // Verificar se é recurso de fonte, imagem ou CSS
  const isFont = event.request.url.match(/\.(woff|woff2|ttf|eot)$/i);
  const isImage = event.request.url.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i);
  const isStyle = event.request.url.match(/\.(css)$/i);
  
  // Estratégia para cada tipo de recurso
  if (isStaticAsset) {
    // Estratégia Cache First para assets estáticos críticos
    event.respondWith(
      caches.open(STATIC_CACHE_NAME)
      .then(cache => cache.match(event.request))
      .then(response => response || fetch(event.request))
    );
  } else if (isFont || isImage || isStyle) {
    // Estratégia Stale-While-Revalidate para fontes, imagens e CSS
    // Serve cache rapidamente enquanto atualiza em segundo plano
    event.respondWith(
      caches.open(RUNTIME_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            // Atualiza o cache com a nova resposta
            if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Se a rede falhar, retornamos nulo para cair no fallback do cachedResponse
            return null;
          });
          
          // Retorna o cache imediatamente enquanto atualiza em segundo plano
          return cachedResponse || fetchPromise;
        });
      })
    );
  } else {
    // Para outros recursos, Network First com cache de fallback
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});

// Limpeza de caches antigos e claim de clientes
self.addEventListener('activate', (event) => {
  const cacheAllowlist = [STATIC_CACHE_NAME, RUNTIME_CACHE_NAME];
  
  // Limpar caches antigos
  const cacheCleanup = caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheAllowlist.indexOf(cacheName) === -1) {
          console.log('🧹 Limpando cache antigo:', cacheName);
          return caches.delete(cacheName);
        }
      })
    );
  });
  
  // Claim de clients para controlar todas as abas abertas sem refresh
  event.waitUntil(Promise.all([
    cacheCleanup,
    self.clients.claim()
  ]));
});

// Adicionar listener para sincronização em background quando online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    console.log('🔄 Sincronizando dados em background');
    // Implementar sincronização específica aqui se necessário
  }
});
