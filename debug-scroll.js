// Cole isso no Console do DevTools (F12)
(function debugScroll() {
  console.clear();
  console.log('=== DEBUG SCROLL ===');
  
  // 1. Verificar data-scroll-locked
  const locked = document.documentElement.getAttribute('data-scroll-locked');
  console.log('data-scroll-locked:', locked);
  
  // 2. Verificar estilos do body
  const bodyStyles = window.getComputedStyle(document.body);
  console.log('body overflow:', bodyStyles.overflow);
  console.log('body overflowY:', bodyStyles.overflowY);
  console.log('body position:', bodyStyles.position);
  console.log('body touchAction:', bodyStyles.touchAction);
  
  // 3. Verificar html
  const htmlStyles = window.getComputedStyle(document.documentElement);
  console.log('html overflow:', htmlStyles.overflow);
  console.log('html overflowY:', htmlStyles.overflowY);
  
  // 4. Verificar #root
  const root = document.getElementById('root');
  if (root) {
    const rootStyles = window.getComputedStyle(root);
    console.log('root overflow:', rootStyles.overflow);
    console.log('root overflowY:', rootStyles.overflowY);
    console.log('root height:', rootStyles.height);
    console.log('root position:', rootStyles.position);
  }
  
  // 5. Teste de wheel event
  let wheelBlocked = false;
  const testWheel = (e) => {
    console.log('Wheel event captured! defaultPrevented:', e.defaultPrevented);
    if (e.defaultPrevented) wheelBlocked = true;
  };
  
  document.addEventListener('wheel', testWheel, {capture: true});
  
  // Simular wheel
  const evt = new WheelEvent('wheel', {deltaY: 100, bubbles: true, cancelable: true});
  document.body.dispatchEvent(evt);
  
  document.removeEventListener('wheel', testWheel, {capture: true});
  
  console.log('Wheel blocked:', wheelBlocked);
  
  // 6. Listar elementos com position fixed que cobrem a tela
  const fixedElements = document.querySelectorAll('*');
  let coveringElements = [];
  fixedElements.forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.position === 'fixed' && style.pointerEvents !== 'none') {
      const rect = el.getBoundingClientRect();
      if (rect.width > window.innerWidth * 0.8 && rect.height > window.innerHeight * 0.8) {
        coveringElements.push({
          tag: el.tagName,
          class: el.className.substring(0, 50),
          zIndex: style.zIndex
        });
      }
    }
  });
  console.log('Fixed elements covering screen:', coveringElements);
})();
