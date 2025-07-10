// Service Worker com melhorias para evitar loops de F5 e problemas de autenticação
const CACHE_NAME = 'stater-app-v2'; // Incrementar versão para forçar refresh

// Lista de arquivos para cache inicial
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.svg',
  // Adicionar outros assets estáticos importantes
];

// Arquivos críticos que NUNCA devem ser cacheados
const criticalFiles = [
  // Rotas de autenticação
  '/auth',
  '/login',
  '/register',
  '/reset-password',
  '/callback',
  '/terms',
  // Arquivos específicos para autenticação
  'supabase-auth',
  'auth.js',
  'token',
  'access_token',
  'refresh_token'
];

// Padrões de URL que devem ser ignorados pelo SW (exceto Supabase que é tratado separadamente)
const ignoreUrlPatterns = [
  // URLs com fragmentos de autenticação
  /access_token/,
  /refresh_token/,
  /provider/,
  /auth/i,
  /callback/i
];

self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Força o SW a se tornar ativo
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker ativado');
  
  // Limpar caches antigos
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
          return null;
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker pronto para lidar com requisições!');
      return self.clients.claim(); // Toma controle de todos os clientes
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Evitar interceptar URLs com fragmentos
  if (event.request.url.includes('#')) {
    console.log('[SW] Ignorando URL com fragmento:', event.request.url);
    return; // Não intercepta
  }
  
  // Verificar se é um arquivo crítico ou padrão que deve ser ignorado
  const url = event.request.url;
  
  // IMPORTANTE: Para requisições do Supabase, não interceptar DE FORMA ALGUMA
  if (url.includes('supabase.co') || url.includes('/rest/v1/') || url.includes('/auth/v1/')) {
    console.log('[SW] ✅ SUPABASE: Deixando requisição passar SEM interceptação:', url);
    return; // Não interceptar - deixa a requisição completamente normal
  }
  
  // Verificar se corresponde a algum padrão para ignorar (sem Supabase)
  const shouldIgnore = criticalFiles.some(file => url.includes(file)) ||
                      /access_token/.test(url) ||
                      /refresh_token/.test(url) ||
                      /provider/.test(url) ||
                      /auth/i.test(url) ||
                      /callback/i.test(url);
  
  if (shouldIgnore) {
    console.log('[SW] Ignorando arquivo crítico:', url);
    return; // Não interceptar - deixa a requisição normal acontecer
  }
  
  // Para todas as outras requisições, tentamos cache-first
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Resposta do cache encontrada - retornar
        if (response) {
          return response;
        }
        
        // Clonar a requisição porque só podemos usá-la uma vez
        const fetchRequest = event.request.clone();
        
        // Fazer a requisição
        return fetch(fetchRequest)
          .then(response => {
            // Verificar se recebemos uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar a resposta porque precisamos dela em dois lugares
            const responseToCache = response.clone();
            
            // Salvar no cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
      .catch(error => {
        console.error('[SW] Erro ao buscar:', error);
        // Opcionalmente, retornar uma página offline para recursos HTML
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/offline.html');
        }
        return new Response('Erro de rede', { status: 503 });
      })
  );
});

// Tratar mensagens do cliente (útil para limpar cache ou forçar atualização)
self.addEventListener('message', (event) => {
  console.log('[SW] Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting solicitado');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Limpando cache');
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW] Cache limpo com sucesso');
      // Notificar que o cache foi limpo
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true });
      }
    });
  }
});
