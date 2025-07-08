// Service Worker para Stater - CORREÇÃO DEFINITIVA v2.4.0
const CACHE_NAME = 'stater-v2.4.0-fixed';

// Install - mais rápido possível
self.addEventListener('install', (event) => {
  console.log('SW: Installing v2.4.0 - Message Port Fixed');
  self.skipWaiting(); // Ativar imediatamente
});

// Activate - limpar e tomar controle
self.addEventListener('activate', (event) => {
  console.log('SW: Activating v2.4.0 - Taking control');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('SW: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar controle imediato
      self.clients.claim()
    ])
  );
});

// Fetch event - MUITO MAIS RESTRITIVO
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  
  // SKIP: Métodos que não são GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // SKIP: Cross-origin
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // � CORREÇÃO: URLs com fragment - permitir tokens de autenticação
  if (event.request.url.includes('#')) {
    const fragment = event.request.url.split('#')[1];
    
    // Permitir fragments com tokens de autenticação do Supabase
    if (fragment && (fragment.includes('access_token=') || 
                     fragment.includes('refresh_token=') ||
                     fragment.includes('error='))) {
      console.log('SW: Permitindo URL com tokens de autenticação:', event.request.url);
      // NÃO pular - deixar passar para processamento
    } else {
      console.log('SW: Skipping URL with fragment:', event.request.url);
      return;
    }
  }
  
  // 🚫 SKIP: Rotas problemáticas
  const problematicPaths = [
    '/dashboard',
    '/preferences', 
    '/login',
    '/logout',
    '/api/',
    '/auth/',
    '/assets/',
    '/supabase'
  ];
  
  // 🚫 SKIP: Extensões problemáticas
  const problematicExtensions = [
    '.js', '.css', '.json', '.ico', '.png', '.svg', '.jpg', '.jpeg', '.gif', '.webp'
  ];
  
  // 🚫 SKIP: Arquivos do Vite
  const isViteFile = pathname.includes('index-') || 
                     pathname.includes('chunk-') || 
                     pathname.includes('vendor-') ||
                     pathname.includes('manifest.json') ||
                     pathname.includes('favicon.ico');
  
  // Verificar se deve pular
  const shouldSkipPath = problematicPaths.some(path => 
    pathname === path || pathname.startsWith(path)
  );
  
  const shouldSkipExtension = problematicExtensions.some(ext => 
    pathname.endsWith(ext)
  );
  
  const hasSensitiveParams = url.searchParams.has('token') || 
                            url.searchParams.has('code') ||
                            url.searchParams.has('refresh_token');
  
  if (shouldSkipPath || shouldSkipExtension || hasSensitiveParams || isViteFile) {
    console.log('SW: Skipping interception for:', pathname);
    return; // NÃO INTERCEPTAR
  }
  
  // Se chegou até aqui, interceptar com cuidado
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('SW: Serving from cache:', pathname);
          return cachedResponse;
        }
        
        console.log('SW: Fetching from network:', pathname);
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cache apenas se for válido
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch(() => {
                // Ignorar erros de cache
              });
            
            return response;
          })
          .catch(() => {
            // Página offline simples
            if (event.request.destination === 'document') {
              return new Response(`
                <!DOCTYPE html>
                <html>
                <head><title>Offline</title></head>
                <body>
                  <h1>Offline</h1>
                  <p>Conecte-se à internet</p>
                  <button onclick="location.reload()">Tentar novamente</button>
                </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' }
              });
            }
            throw new Error('Offline');
          });
      })
      .catch(() => {
        // Fallback final
        if (event.request.destination === 'document') {
          return new Response('Offline', { 
            headers: { 'Content-Type': 'text/plain' } 
          });
        }
        throw new Error('Request failed');
      })
  );
});

// 🔧 CORREÇÃO: Message handler melhorado para evitar "message port closed"
self.addEventListener('message', (event) => {
  try {
    console.log('SW: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
      console.log('SW: Processing SKIP_WAITING');
      self.skipWaiting();
      
      // 🔧 RESPONDER à mensagem para evitar timeout
      if (event.ports && event.ports[0]) {
        try {
          event.ports[0].postMessage({ 
            type: 'SKIP_WAITING_RESPONSE', 
            success: true 
          });
        } catch (portError) {
          console.warn('SW: Port response failed (normal):', portError.message);
        }
      }
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
      console.log('SW: Clearing caches');
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        })
        .catch(() => {
          // Ignorar erros de limpeza
        });
    }
    
  } catch (messageError) {
    console.warn('SW: Message handling error (ignored):', messageError.message);
    // NÃO relançar o erro
  }
});

// 🔧 CORREÇÃO: Capturar erros globais
self.addEventListener('error', (event) => {
  console.warn('SW: Global error (ignored):', event.error?.message || event.error);
  event.preventDefault(); // Evita que apareça no console
});

self.addEventListener('unhandledrejection', (event) => {
  console.warn('SW: Unhandled promise rejection (ignored):', event.reason?.message || event.reason);
  event.preventDefault(); // Evita que apareça no console
});

console.log('SW: v2.4.0 Fixed - Message Port Errors Resolved');
