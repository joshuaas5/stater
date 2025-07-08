// Service Worker COMPLETAMENTE DESABILITADO para debug
console.log('SW: DESABILITADO para debug de loop');

// Install - não faz nada
self.addEventListener('install', (event) => {
  console.log('SW: Install desabilitado');
  self.skipWaiting();
});

// Activate - não faz nada
self.addEventListener('activate', (event) => {
  console.log('SW: Activate desabilitado');
  self.clients.claim();
});

// Fetch - NÃO INTERCEPTA NADA
self.addEventListener('fetch', (event) => {
  // DESABILITADO - deixa tudo passar
  return; // Não faz nada
});

// Message - não faz nada problemático
self.addEventListener('message', (event) => {
  console.log('SW: Message desabilitado:', event.data);
});

console.log('SW: TOTALMENTE DESABILITADO - sem interceptação');
