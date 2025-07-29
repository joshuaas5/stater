// Desabilitar Service Worker temporariamente para debug
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      console.log('Desregistrando Service Worker:', registration);
      registration.unregister();
    }
    console.log('Service Workers desregistrados. Recarregue a página.');
  });
} else {
  console.log('Service Worker não suportado');
}
