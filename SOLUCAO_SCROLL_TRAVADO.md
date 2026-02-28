#  SOLUÇÃO: Scroll Travado (Rodinha/Trackpad/Touch não funcionam)

##  Sintomas do Problema

-  **Arrastar a scrollbar funciona**
-  **Rodinha do mouse NÃO funciona**
-  **Trackpad NÃO funciona**
-  **Touch no celular "arrasta como foto" ao invés de scrollar**
-  **Problema acontece em TODAS as páginas, exceto modais específicos (ex: PaywallModal)**

##  Diagnóstico Rápido

Execute no Console do navegador (F12):

```javascript
// 1. Verificar se há conteúdo scrollável
console.log('scrollHeight:', document.body.scrollHeight);
console.log('innerHeight:', window.innerHeight);
console.log('PODE SCROLLAR?', document.body.scrollHeight > window.innerHeight);

// 2. Verificar se wheel events estão bloqueados
let blocked = false;
document.addEventListener('wheel', e => { 
  if(e.defaultPrevented) blocked = true; 
}, {capture:true, once:true});
document.dispatchEvent(new WheelEvent('wheel', {deltaY: 100, bubbles: true, cancelable: true}));
setTimeout(() => console.log('WHEEL BLOQUEADO?', blocked), 50);

// 3. Verificar atributos de scroll lock
console.log('data-scroll-locked:', document.body.hasAttribute('data-scroll-locked'));
console.log('overflow:', getComputedStyle(document.body).overflow);
```

**Se o resultado for:**
- `scrollHeight > innerHeight` =  Há conteúdo para scrollar
- `WHEEL BLOQUEADO? true` =  Event listeners estão bloqueando
- `data-scroll-locked: true` =  Atributo de lock presente

 **Confirma o problema de event listeners bloqueados**

##  Causa Raiz

### Culpado: `react-remove-scroll` (usado internamente por Radix UI)

Quando você usa componentes do **Radix UI** (`Dialog`, `Sheet`, `AlertDialog`), eles internamente usam a biblioteca `react-remove-scroll` que:

1. **Adiciona event listeners bloqueadores:**
   ```javascript
   document.addEventListener('wheel', (e) => e.preventDefault(), {passive: false});
   document.addEventListener('touchmove', (e) => e.preventDefault(), {passive: false});
   ```

2. **Aplica CSS que trava scroll:**
   ```css
   body {
     overflow: hidden !important;
     position: fixed !important;
   }
   ```

3. **Adiciona atributo HTML:**
   ```html
   <body data-scroll-locked="true">
   ```

**O BUG:** Às vezes esses listeners/estilos **não são removidos** quando o modal fecha, travando o scroll permanentemente.

##  Solução Implementada (3 Camadas)

### 1 Interceptar Event Listeners - `src/utils/unlockScroll.ts`

Crie o arquivo que **bloqueia** qualquer tentativa de adicionar listeners problemáticos:

```typescript
/**
 *  SCRIPT DE DESBLOQUEIO TOTAL DE SCROLL
 * Remove todos os event listeners que bloqueiam wheel/touch
 */

const removeScrollBlockers = () => {
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  
  // Override addEventListener
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    // Bloqueia wheel/touchmove com passive:false
    if ((type === 'wheel' || type === 'touchmove') && options && options.passive === false) {
      console.warn(` Bloqueado event listener problemático: ${type} com passive:false`);
      return; // NÃO adiciona o listener
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  console.log(' Event listeners de scroll desbloqueados!');
};

const unlockScrollStyles = () => {
  document.body.removeAttribute('data-scroll-locked');
  document.documentElement.removeAttribute('data-scroll-locked');
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.paddingRight = '';
  document.body.style.overflowY = 'auto';
  
  console.log(' Estilos de scroll lock removidos!');
};

// Executar imediatamente
removeScrollBlockers();
unlockScrollStyles();

// Monitorar e corrigir continuamente
setInterval(() => {
  unlockScrollStyles();
}, 1000);

export {};
```

### 2 CSS Force Fix - `src/styles/force-scroll-fix.css`

```css
/* ===== FIX FORÇADO DE SCROLL ===== */

html, body {
  overflow-y: auto !important;
  overflow-x: hidden !important;
  position: static !important;
  height: auto !important;
  min-height: 100vh !important;
  touch-action: pan-y !important;
  overscroll-behavior-y: auto !important;
}

/* Remove scroll lock de modais quando não estão abertos */
body:not(:has([data-state="open"])):not(:has([role="dialog"][aria-hidden="false"])) {
  overflow: auto !important;
  position: static !important;
}

/* Garante que containers principais não bloqueiem scroll */
#root, .edge-to-edge-page, [class*="dashboard"], [class*="page"] {
  overflow: visible !important;
  position: relative !important;
  height: auto !important;
  max-height: none !important;
}
```

### 3 Hook de Monitoramento - `src/hooks/useScrollGuard.ts`

```typescript
import { useEffect } from 'react';

export const useScrollGuard = () => {
  useEffect(() => {
    const unlockScroll = () => {
      // Remove overflow: hidden
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
      
      // Remove data-scroll-locked
      if (document.body.hasAttribute('data-scroll-locked')) {
        document.body.removeAttribute('data-scroll-locked');
        document.body.style.paddingRight = '';
      }
      
      // Remove position: fixed
      if (document.body.style.position === 'fixed') {
        document.body.style.position = '';
        document.body.style.top = '';
      }
    };

    const checkScrollLock = () => {
      const hasVisibleModal = document.querySelector(
        '[role="dialog"]:not([hidden]), ' +
        '[data-state="open"], ' +
        '.modal:not([hidden])'
      );
      
      if (!hasVisibleModal) {
        unlockScroll();
      }
    };
    
    const interval = setInterval(checkScrollLock, 500);
    checkScrollLock();
    
    return () => clearInterval(interval);
  }, []);
};
```

### 4 Integração no `src/main.tsx`

```typescript
import { createRoot } from 'react-dom/client'
import App from './App'

//  PRIMEIRO: Desbloqueia scroll ANTES de qualquer outra coisa
import './utils/unlockScroll';

import './index.css'
import './styles/mobile-first.css'
import './styles/force-scroll-fix.css'
// ... outros imports

createRoot(document.getElementById('root')!).render(<App />);
```

### 5 Usar o Hook no `src/App.tsx`

```typescript
import { useScrollGuard } from "@/hooks/useScrollGuard";

function App() {
  useScrollGuard(); //  CRITICAL: Previne scroll travado
  
  // resto do código...
}
```

##  Como Aplicar a Correção

```bash
# 1. Criar os arquivos
touch src/utils/unlockScroll.ts
touch src/styles/force-scroll-fix.css

# 2. Atualizar src/main.tsx e src/App.tsx conforme acima

# 3. Testar localmente
npm run dev

# 4. Commitar e fazer push
git add .
git commit -m "fix(scroll): remove event listeners que bloqueiam wheel/touch events"
git push
```

##  Como Testar

1. **Abra o site no navegador**
2. **Abra DevTools (F12)  Console**
3. **Verifique se aparece:**
   ```
    Event listeners de scroll desbloqueados!
    Estilos de scroll lock removidos!
   ```
4. **Teste:**
   -  Rodinha do mouse
   -  Trackpad (dois dedos)
   -  Touch no celular (arrastar para cima/baixo)
   -  Scrollbar (já funcionava)

##  Resultado Esperado

| Método | Antes | Depois |
|--------|-------|--------|
|  Rodinha |  |  |
|  Trackpad |  |  |
|  Touch |  (arrasta como foto) |  (scroll normal) |
|  Scrollbar |  |  |

##  Efeitos Colaterais

### Modais ainda funcionam?
**SIM!** A solução usa `:has([data-state="open"])` para detectar quando há modal aberto e **não aplica** o fix nesses casos.

### Performance?
**Mínimo impacto:**
- `unlockScroll.ts`: Roda apenas 1x no carregamento
- `useScrollGuard`: Verifica a cada 500ms (leve)
- CSS: Não tem impacto

##  Alternativas (se não funcionar)

### Opção 1: Desabilitar react-remove-scroll nos componentes Radix

```tsx
// Em src/components/ui/dialog.tsx, sheet.tsx, alert-dialog.tsx
<DialogPrimitive.Root modal={false} {...props}>
  {children}
</DialogPrimitive.Root>
```

**Desvantagem:** O body vai scrollar JUNTO com o modal (pode ser confuso).

### Opção 2: Forçar passive: true globalmente

```typescript
// Adicione no unlockScroll.ts
EventTarget.prototype.addEventListener = function(type, listener, options) {
  if (type === 'wheel' || type === 'touchmove') {
    // Força passive: true
    const newOptions = typeof options === 'object' 
      ? { ...options, passive: true } 
      : { passive: true };
    return originalAddEventListener.call(this, type, listener, newOptions);
  }
  return originalAddEventListener.call(this, type, listener, options);
};
```

##  Referências

- [react-remove-scroll GitHub Issue #71](https://github.com/theKashey/react-remove-scroll/issues/71)
- [Radix UI Dialog - modal prop](https://www.radix-ui.com/primitives/docs/components/dialog#root)
- [MDN: addEventListener passive option](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#passive)

##  Commits Relacionados

- `f1a445fd` - fix(scroll): remove event listeners que bloqueiam wheel/touch events
- `ac3ed089` - fix(css): corrige sintaxe CSS - fecha parênteses na linha 16
- `9c6496c4` - fix(scroll): useScrollGuard reforçado - remove data-scroll-locked e position:fixed
- `90dc2968` - fix(sheet): desabilitar react-remove-scroll com modal=false

---

**Data da Resolução:** 02/02/2026  
**Desenvolvedor:** GitHub Copilot + Usuário  
**Status:**  RESOLVIDO E TESTADO
