// 🔧 Service Worker OTIMIZADO - Melhor suporte offline
const CACHE_NAME = 'stater-app-v7';

// Lista expandida de arquivos para cache offline
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.svg',
  '/offline.html' // Página offline de fallback
];

// Cache dinâmico para assets importantes
const DYNAMIC_CACHE = 'stater-dynamic-v6';

// 🔧 URLs críticas que NUNCA devem ser interceptadas
const criticalUrls = [
  'supabase.co', 'google.com', 'googleapis.com', 'accounts.google.com'
];

// 🔧 Padrões que devem ser completamente ignorados
const ignorePatterns = [
  /access_token/, /refresh_token/, /provider/, /auth/i, /callback/i,
  /supabase/, /google/, /oauth/, /api\/auth/
];

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker instalado - versão otimizada');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker ativado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker pronto para funcionalidade offline!');
      return self.clients.claim();
    })
  );
});

// 🔧 FETCH otimizado - interceptar MENOS requisições
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // 🔧 NUNCA interceptar URLs críticas
  if (criticalUrls.some(pattern => url.includes(pattern))) {
    return; // Deixar browser lidar naturalmente
  }
  
  // 🔧 NUNCA interceptar padrões de auth/oauth
  if (ignorePatterns.some(pattern => pattern.test(url))) {
    return; // Não interceptar
  }
  
  // 🔧 NUNCA interceptar métodos não-GET
  if (event.request.method !== 'GET') {
    return; // Deixar requisições POST/PUT/DELETE passarem
  }
  
  // 🔧 NUNCA interceptar URLs com fragmentos
  if (url.includes('#')) {
    return; // Não interceptar
  }
  
  // 🔧 Estratégia de cache melhorada para offline
  const isStaticResource = url.includes('.js') || url.includes('.css') || 
                          url.includes('.png') || url.includes('.svg') ||
                          url.includes('.ico') || url.includes('.json') ||
                          url.includes('.woff') || url.includes('.woff2');
  
  if (!isStaticResource && !url.includes(self.location.origin)) {
    return; // Deixar recursos externos passarem
  }
  
  // 🔧 Estratégia Cache First para recursos estáticos, Network First para HTML
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response && isStaticResource) {
          return response; // Cache first para recursos estáticos
        }
        
        // Network first para HTML e API calls
        return fetch(event.request)
          .then(networkResponse => {
            // Cachear recursos importantes
            if (networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              
              if (isStaticResource) {
                // Cache estático
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseToCache));
              } else if (event.request.mode === 'navigate') {
                // Cache dinâmico para navegação
                caches.open(DYNAMIC_CACHE)
                  .then(cache => cache.put(event.request, responseToCache));
              }
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback offline
            if (response) {
              return response; // Retornar cache se disponível
            }
            
            if (event.request.mode === 'navigate') {
              return caches.match('/') || caches.match('/index.html');
            }
            
            // Resposta offline para outros recursos
            return new Response(
              JSON.stringify({ error: 'Offline', cached: false }), 
              { 
                status: 503, 
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
      })
  );
});

// 🔧 Tratar mensagens do cliente de forma otimizada
self.addEventListener('message', (event) => {
  // Reduzir logs para scroll
  if (event.data?.type === 'SCROLL_START' || event.data?.type === 'SCROLL_END') {
    // Não fazer log de scroll - muito verbose
    return;
  }
  
  console.log('[SW] Mensagem recebida:', event.data);
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW] Cache limpo');
      event.ports?.[0]?.postMessage({ success: true });
    });
  }
});
