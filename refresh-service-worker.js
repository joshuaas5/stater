// Script para forçar atualização do Service Worker e limpar cache
// Execute no console do navegador para aplicar as mudanças do SW

console.log('🔄 Iniciando refresh do Service Worker...');

// 1. Desregistrar o Service Worker atual
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      console.log('🗑️ Desregistrando SW:', registration.scope);
      registration.unregister();
    }
    
    // 2. Limpar todos os caches
    if ('caches' in window) {
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            console.log('🗑️ Deletando cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(function() {
        console.log('✅ Todos os caches foram limpos');
        
        // 3. Recarregar a página para registrar o novo SW
        console.log('🔄 Recarregando página...');
        window.location.reload();
      });
    } else {
      console.log('🔄 Recarregando página...');
      window.location.reload();
    }
  });
} else {
  console.log('❌ Service Worker não suportado');
}
