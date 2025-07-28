// 🔧 Service Worker OTIMIZADO - Reduzindo interceptações e logs
const CACHE_NAME = 'stater-app-v5';

// Lista mínima de arquivos para cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.svg'
];

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
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker pronto para lidar com requisições!');
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
  
  // 🔧 Interceptar apenas recursos estáticos específicos
  const isStaticResource = url.includes('.js') || url.includes('.css') || 
                          url.includes('.png') || url.includes('.svg') ||
                          url.includes('.ico') || url.includes('.json');
  
  if (!isStaticResource && !url.includes(self.location.origin)) {
    return; // Deixar recursos externos passarem
  }
  
  // 🔧 Cache strategy simplificada
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Retornar do cache
        }
        
        // Buscar da rede apenas se necessário
        return fetch(event.request)
          .then(response => {
            // Apenas cachear se for um recurso estático válido
            if (isStaticResource && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            return response;
          })
          .catch(() => {
            // Fallback para página offline se necessário
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// 🔧 Tratar mensagens do cliente de forma otimizada
self.addEventListener('message', (event) => {
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
  
  // 🔧 Novos tipos de mensagem para controle
  if (event.data?.type === 'SCROLL_START' || event.data?.type === 'SCROLL_END') {
    // Apenas registrar sem logs excessivos
  }
});
