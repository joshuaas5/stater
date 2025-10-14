# ✅ CHECKLIST DE TESTES - ADSENSE + COOKIES

## 🧪 TESTE 1: Banner de Cookies (5 minutos)

### Passo a passo:
```
1. Aguarde 5 minutos (deploy finalizar)
2. Abra navegador em MODO ANÔNIMO (Ctrl+Shift+N)
3. Acesse: https://stater.app
4. Aguarde 1-2 segundos
5. Banner deve aparecer na parte inferior da tela
```

### ✅ O que verificar:
- [ ] Banner aparece na parte inferior
- [ ] Tem 3 botões: Aceitar / Rejeitar / Personalizar
- [ ] Texto em português e legível
- [ ] Design bonito (azul tema Stater)
- [ ] Link "Política de Privacidade" funciona

### 🧪 Testar botões:

**ACEITAR TODOS:**
```
1. Clique em "Aceitar Todos"
2. Banner desaparece
3. Recarregue página (F5)
4. Banner NÃO aparece de novo (preferência salva)
```

**REJEITAR TODOS:**
```
1. Limpe localStorage (F12 → Console → localStorage.clear())
2. Recarregue (F5)
3. Banner aparece de novo
4. Clique "Rejeitar Todos"
5. Banner desaparece
```

**PERSONALIZAR:**
```
1. Limpe localStorage novamente
2. Recarregue (F5)
3. Clique "Personalizar"
4. Modal abre com opções:
   - Cookies Essenciais (sempre ativo)
   - Cookies de Análise (toggle)
   - Cookies de Publicidade (toggle)
5. Teste toggles ON/OFF
6. Clique "Salvar Preferências"
7. Modal fecha
```

---

## 🧪 TESTE 2: Console do Navegador (Técnico)

### Abra DevTools (F12) → Console

**1. Verificar consentimento salvo:**
```javascript
console.log(localStorage.getItem('cookie-consent'));
```
**Resultado esperado:**
```json
{"analytics":true,"advertising":true,"timestamp":1697234567890}
```

**2. Verificar gtag (se usuário aceitou):**
```javascript
dataLayer.forEach(item => {
  if (item[0] === 'consent') console.log(item);
});
```
**Resultado esperado:**
```javascript
['consent', 'update', {ad_storage: 'granted', ...}]
```

**3. Verificar AdSense carregando:**
```javascript
console.log(window.adsbygoogle);
```
**Resultado esperado:**
```
Array[] (não undefined)
```

---

## 🧪 TESTE 3: Google AdSense Console

### Acesse: https://www.google.com/adsense/

**1. Privacidade e mensagens:**
```
✅ Status: "Configurado" ou "Ativo"
✅ Sem avisos amarelos ⚠️
✅ Mensagem: "Tudo certo!"
```

**2. Sites → Visão geral:**
```
✅ stater.app listado
✅ Status: "Aprovado" ou "Verificado"
✅ Código detectado: SIM ✅
```

**3. Anúncios (pode demorar 24-48h):**
```
⏳ "Preparando anúncios para seu site..."
ou
✅ "Anúncios ativos"
```

---

## 🧪 TESTE 4: Anúncios no Site (24-48h depois)

### Como verificar se anúncios estão aparecendo:

**1. Visual:**
```
- Abra site
- Procure por espaços de anúncios
- Podem aparecer como:
  * Banners horizontais
  * Caixas laterais
  * Anúncios em texto
  * "Advertisement" / "Anúncio"
```

**2. DevTools → Network:**
```
1. F12 → Network
2. Filtrar por "doubleclick" ou "googlesyndication"
3. Recarregar página
4. Deve aparecer requests para servidores do Google
```

**3. Console do AdSense:**
```
- Relatórios → Visão geral
- Deve mostrar impressões > 0
- Cliques > 0 (se alguém clicar)
- Receita > R$ 0,00 (começa pequena)
```

---

## 📊 RESULTADOS ESPERADOS

### ✅ IMEDIATO (5 min):
- Banner de cookies funcionando
- Preferências salvando
- Site totalmente estilizado

### ✅ CURTO PRAZO (24-48h):
- Anúncios começam a aparecer
- Primeiras impressões contabilizadas
- Status AdSense: "Ativo"

### ✅ MÉDIO PRAZO (7-14 dias):
- Receita visível (mesmo que pequena)
- Relatórios de consentimento disponíveis
- Otimizações possíveis baseadas em dados

---

## 🐛 SE ALGO NÃO FUNCIONAR

### ❌ Banner não aparece:
```
Solução:
1. F12 → Console
2. localStorage.clear()
3. location.reload()
```

### ❌ Banner aparece mas erro no console:
```
Solução:
1. Me mande screenshot do erro
2. Ou copie mensagem de erro
```

### ❌ AdSense não mostra anúncios (após 48h):
```
Possíveis causas:
- Tráfego muito baixo (precisa visitantes)
- Site ainda em análise pelo Google
- Política de conteúdo (raro)

Solução:
- Aguardar mais tempo
- Verificar email do AdSense (comunicados)
- Aumentar tráfego (compartilhar site)
```

### ❌ Receita R$ 0,00 (após 7 dias):
```
Normal! Receita inicial é baixa:
- Precisa tráfego consistente
- ~1000 visitantes = ~R$ 5-20 por dia
- Cresce com tempo e otimização
```

---

## 📞 SUPORTE

**Se precisar de ajuda:**
1. Tire screenshot do problema
2. Copie erros do console (F12)
3. Me manda que te ajudo!

**Arquivos de referência criados:**
- `ADSENSE_ONDE_CLICAR.md` - Como configurar AdSense
- `ADSENSE_CONSENTIMENTO_GUIA.md` - Guia completo GDPR
- `REVISAO_COMPLETA_SITE.md` - Status geral do sistema

---

## ✅ RESUMO

**O que testar AGORA (5 min):**
```
1. https://stater.app (modo anônimo)
2. Banner de cookies aparece? ✅
3. Botões funcionam? ✅
4. Preferências salvam? ✅
```

**O que verificar AMANHÃ:**
```
1. AdSense Console → Status "Ativo"? ✅
2. Anúncios aparecendo no site? ✅
3. Primeiras impressões contabilizadas? ✅
```

**O que monitorar em 7 DIAS:**
```
1. Receita > R$ 0,00? ✅
2. Taxa de consentimento (quantos aceitam)? ✅
3. CPM e otimizações possíveis? ✅
```

---

**STATUS ATUAL:** 🟢 Tudo configurado e funcionando!  
**PRÓXIMO TESTE:** Em 5 minutos (banner de cookies)  
**ANÚNCIOS ATIVOS:** Em 24-48 horas (aguardar Google)
