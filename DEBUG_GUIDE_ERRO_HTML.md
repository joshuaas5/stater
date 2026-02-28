# 🔍 GUIA DE DEBUG - Erro HTML

## ⚠️ PROBLEMA
O erro "HTML ao invés de JSON" continua acontecendo mesmo após desabilitar o paywall.

## 🎯 OBJETIVO
Rastrear **EXATAMENTE** onde o erro está acontecendo através dos logs.

---

## 📋 CHECKLIST DE LOGS

### 1️⃣ **INÍCIO DA FUNÇÃO**
**O que procurar:**
```
🚨🚨🚨 [INICIO_UPLOAD] ================================
🚨🚨🚨 [INICIO_UPLOAD] handleImageUpload FOI CHAMADA!
```

**✅ SE APARECER:** Função está sendo executada  
**❌ SE NÃO APARECER:** Upload nem está sendo chamado (problema anterior)

---

### 2️⃣ **AUTENTICAÇÃO**
**O que procurar:**
```
✅ [CHECKPOINT_1] Usuário autenticado: <id-do-usuario>
```

**✅ SE APARECER:** Usuário está logado corretamente  
**❌ SE NÃO APARECER:** Erro de autenticação bloqueando execução

---

### 3️⃣ **DETECÇÃO DE TIPO**
**O que procurar:**
```
🖼️ [CHECKPOINT_2] Arquivo de imagem/PDF detectado
📋 [CHECKPOINT_3] isPdf: false | isTextFile: false
```

**✅ SE APARECER:** Arquivo detectado como imagem  
**❌ SE isPdf:true:** Arquivo sendo detectado como PDF erroneamente

---

### 4️⃣ **PAYWALL DESABILITADO**
**O que procurar:**
```
🔓 [PAYWALL_DISABLED] Paywall temporariamente desabilitado para testes
```

**✅ SE APARECER:** Paywall foi desabilitado com sucesso  
**❌ SE NÃO APARECER:** Código antigo ainda em cache

---

### 5️⃣ **PRÉ-FETCH**
**O que procurar:**
```
🎬 [PRE_FETCH] ============================================
🎬 [PRE_FETCH] CHEGOU NA ETAPA DE FETCH!
🎬 [PRE_FETCH] Paywall foi pulado com sucesso
```

**✅ SE APARECER:** Código chegou até a etapa de fetch  
**❌ SE NÃO APARECER:** Algum erro bloqueou antes do fetch

---

### 6️⃣ **FETCH INICIADO**
**O que procurar:**
```
🚀 [STEP_1] Iniciando fetch para API OCR
🌐 [STEP_1] URL da API: https://ictus-app.vercel.app/api/gemini-ocr
🔧 [STEP_1] Detecção de ambiente:
  - isCapacitor: true
  - window.location.protocol: capacitor:
```

**✅ SE APARECER:** Fetch foi executado com URL correta  
**❌ SE URL ERRADA:** Problema na detecção de ambiente  
**❌ SE isCapacitor:false:** Detecção de Capacitor falhou

---

### 7️⃣ **RESPOSTA RECEBIDA**
**O que procurar:**
```
✅ [STEP_2] Fetch concluído, status: 200
✅ [STEP_2] Response headers:
  contentType: application/json
  
📥 [STEP_3] Resposta recebida, tamanho: XXXX
📥 [STEP_3] Primeiros 300 chars: <conteúdo da resposta>
```

**✅ SE status:200 e contentType:application/json:** API respondeu corretamente  
**❌ SE status:404 ou 500:** Erro no servidor  
**❌ SE contentType:text/html:** Servidor retornou HTML (PROBLEMA!)

---

### 8️⃣ **VERIFICAÇÃO HTML**
**O que procurar:**
```
🔍 [HTML_CHECK] Verificando se resposta é HTML...
🔍 [HTML_CHECK] Primeiros 50 chars: <conteúdo>
🔍 [HTML_CHECK] isHtml: false
```

**✅ SE isHtml:false:** Resposta é JSON válido  
**❌ SE isHtml:true:** Resposta é HTML (VER DETALHES ABAIXO)

---

### 🚨 **SE ERRO HTML FOR DETECTADO**
**Logs que aparecerão:**
```
❌ [HTML_RESPONSE] Servidor retornou HTML ao invés de JSON
🔍 [HTML_RESPONSE] URL da requisição: <url-usada>
🔍 [HTML_RESPONSE] Status da resposta: <status-code>
🔍 [HTML_RESPONSE] Content-Type: <tipo>
🔍 [HTML_RESPONSE] Resposta HTML detectada (primeiros 500): <html-content>
```

**COPIE TODOS ESSES LOGS!** Eles vão revelar:
- ✅ Qual URL está sendo chamada
- ✅ Se o servidor está respondendo
- ✅ Que tipo de HTML está sendo retornado (404? 500? Página de manutenção?)

---

## 🧪 TESTE AGORA

### PASSO A PASSO:

1. **Feche o app completamente** (force stop no Android)
2. **Abra o app novamente** (vai puxar código atualizado)
3. **Abra chrome://inspect no PC**
4. **Clique em "inspect" no seu dispositivo**
5. **Tire UMA foto de QUALQUER nota fiscal**
6. **COPIE TODOS OS LOGS** que aparecerem no console
7. **Cole aqui** os logs completos

---

## 🎯 O QUE ESTAMOS PROCURANDO

### CENÁRIO 1: Paywall ainda ativo (cache)
```
❌ Não aparece: 🔓 [PAYWALL_DISABLED]
```
**SOLUÇÃO:** Limpar cache do app ou reinstalar

### CENÁRIO 2: URL errada no Capacitor
```
❌ [STEP_1] URL da API: /api/gemini-ocr  (RELATIVA - ERRADO!)
✅ Deveria ser: https://ictus-app.vercel.app/api/gemini-ocr
```
**SOLUÇÃO:** Corrigir detecção de Capacitor

### CENÁRIO 3: Servidor retornando HTML de erro
```
❌ [HTML_RESPONSE] Status da resposta: 404
❌ [HTML_RESPONSE] Content-Type: text/html
❌ [HTML_RESPONSE] Resposta: <!DOCTYPE html><html>...404 Not Found...
```
**SOLUÇÃO:** Investigar por que Vercel está retornando 404

### CENÁRIO 4: CORS bloqueando requisição
```
❌ [FETCH_ERROR] Erro ao fazer fetch: TypeError: Failed to fetch
```
**SOLUÇÃO:** Configurar CORS no Vercel

---

## 📸 SCREENSHOT TAMBÉM AJUDA

Se possível, tire screenshot do console mostrando TODOS os logs desde:
```
🚨🚨🚨 [INICIO_UPLOAD]
```
até o erro final.

---

## ⏱️ PRÓXIMOS PASSOS

Depois de coletar os logs, vou poder identificar **EXATAMENTE**:
- ✅ Onde o erro está acontecendo
- ✅ Se é problema de URL, servidor, cache ou outro
- ✅ Qual a correção precisa a ser feita

**AGUARDANDO SEUS LOGS!** 🚀
