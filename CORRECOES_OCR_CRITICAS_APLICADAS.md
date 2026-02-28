# 🎯 CORREÇÕES CRÍTICAS DO OCR APLICADAS

**Data**: 01/10/2025  
**Commit**: `0d58498a`  
**Branch**: `main`

---

## 📋 PROBLEMAS IDENTIFICADOS

### 1. ❌ Erro HTML/JSON ao enviar fotos
**Sintoma**: Ao tirar foto, retorna erro "Servidor retornou HTML ao invés de JSON"

**Causa raiz**: 
- Projeto usa **Vite + Capacitor** (não Next.js)
- API está em `api/gemini-ocr.ts` mas Vite não serve arquivos `/api/*` automaticamente
- Sem proxy configurado, o fetch falhava ou caía em página de erro (HTML)

### 2. 📸 Modal só pega primeiro item de nota fiscal
**Sintoma**: Nota fiscal com vários itens (arroz, feijão, macarrão) retorna apenas o primeiro

**Causa raiz**:
- Prompt do Gemini **não instruía explicitamente** a extrair cada item como transação separada
- Gemini processava nota como uma transação única (apenas total)
- Modal recebia apenas 1 transação ao invés de N transações

---

## ✅ SOLUÇÕES APLICADAS

### 🔧 CORREÇÃO #1: Proxy no Vite (`vite.config.ts`)

```typescript
server: {
  host: "::",
  port: 8080,
  proxy: {
    '/api': {
      target: 'https://ictus-app.vercel.app',
      changeOrigin: true,
      secure: true,
      rewrite: (path) => path
    }
  }
}
```

**Impacto**: `/api/gemini-ocr` agora redireciona corretamente para o Vercel onde a API está hospedada.

---

### 📝 CORREÇÃO #2: Prompt melhorado para múltiplos itens (`api/gemini-ocr.ts`)

**Adicionado à lista de "PROCURE POR"**:
```
10. 🧾 **NOTAS FISCAIS**: Se houver MÚLTIPLOS ITENS/PRODUTOS em uma nota, 
    crie UMA TRANSAÇÃO SEPARADA para CADA ITEM

11. 🛒 **CUPONS FISCAIS**: Extraia TODOS os produtos listados, 
    cada um como transação individual

12. 🏪 **RECIBOS DE COMPRA**: Se houver lista de produtos, 
    extraia item por item
```

**Nova seção no prompt**:
```
PARA NOTAS FISCAIS COM MÚLTIPLOS ITENS:
- 🎯 **CRÍTICO**: Se a nota fiscal contém VÁRIOS PRODUTOS (ex: arroz, feijão, 
  macarrão), crie UMA TRANSAÇÃO PARA CADA PRODUTO
- 📋 Exemplo: Nota do supermercado com 5 itens = 5 transações separadas
- 💡 Use o valor individual de cada item, NÃO o total da nota
- 🏷️ Descrição deve ser específica: "Arroz Tipo 1 5kg", "Feijão Preto 1kg", etc.
- 📅 Todos os itens da mesma nota terão a mesma data
- 🏪 Use o nome do estabelecimento + nome do produto na descrição
```

**Exemplo prático adicionado**:
```json
📋 EXEMPLO PARA NOTA FISCAL COM 3 ITENS:
Se a nota fiscal tem:
- Arroz Tipo 1 (5kg) - R$ 24,90
- Feijão Preto (1kg) - R$ 8,50
- Macarrão Parafuso (500g) - R$ 4,20
TOTAL: R$ 37,60

DEVE RETORNAR 3 TRANSAÇÕES:
{
  "documentType": "nota_fiscal",
  "transactions": [
    {
      "description": "Supermercado Extra - Arroz Tipo 1 5kg", 
      "amount": 24.90, 
      "type": "expense", 
      "category": "Supermercado", 
      "date": "2024-10-01"
    },
    {
      "description": "Supermercado Extra - Feijão Preto 1kg", 
      "amount": 8.50, 
      "type": "expense", 
      "category": "Supermercado", 
      "date": "2024-10-01"
    },
    {
      "description": "Supermercado Extra - Macarrão Parafuso 500g", 
      "amount": 4.20, 
      "type": "expense", 
      "category": "Supermercado", 
      "date": "2024-10-01"
    }
  ]
}
```

---

### 🔍 CORREÇÃO #3: Logs detalhados (`src/pages/FinancialAdvisorPage.tsx`)

**Logs adicionados ANTES do fetch**:
```typescript
console.log('🌐 [STEP_1] URL completa:', window.location.origin + apiUrl);
console.log('📦 [STEP_1] Request body keys:', Object.keys(requestBody));
console.log('📦 [STEP_1] Body size (bytes):', JSON.stringify(requestBody).length);
console.log('🔧 [STEP_1] Ambiente:', import.meta.env.MODE);
```

**Logs adicionados DEPOIS do Gemini processar**:
```typescript
console.log('🔥 [CRÍTICO] ANTES DE ABRIR MODAL:');
console.log('  - transactions originais do Gemini:', transactions.length);
console.log('  - formattedTransactions preparadas:', formattedTransactions.length);
console.log('  - Transações formatadas:', JSON.stringify(formattedTransactions, null, 2));
```

**Objetivo**: Ver EXATAMENTE:
1. Se a URL da API está correta
2. Quantas transações o Gemini retornou
3. Quantas transações são passadas para o modal
4. Conteúdo completo das transações

---

## 🧪 COMO TESTAR

### Para testar ERRO HTML/JSON (Correção #1):
1. Abrir app no celular
2. **Pressionar F12 no navegador** (ou usar Remote Debugging)
3. Tirar **qualquer foto** (pode ser até da tela)
4. Ver no console:
   ```
   ✅ [STEP_2] Fetch concluído, status: 200
   📥 [STEP_3] Resposta recebida, tamanho: XXX
   ```
   Se aparecer `status: 404` ou `status: 500`, o proxy ainda não está funcionando.

### Para testar MÚLTIPLOS ITENS (Correção #2):
1. Tirar foto de **nota fiscal com 3+ itens** (ex: cupom de supermercado)
2. Ver no console:
   ```
   🔥 [CRÍTICO] ANTES DE ABRIR MODAL:
     - transactions originais do Gemini: 5
     - formattedTransactions preparadas: 5
   ```
3. Modal deve abrir mostrando:
   ```
   Transação 1 de 5
   [Botões < >] 
   ```

---

## ⚠️ PONTOS DE ATENÇÃO

1. **Proxy só funciona em DEV** (`npm run dev`):
   - Em produção (Vercel), não precisa de proxy (API já está no mesmo domínio)
   - No app Capacitor em DEV, o proxy redireciona para Vercel

2. **Gemini pode levar tempo**:
   - Notas fiscais complexas podem levar 10-15 segundos
   - Se aparecer "transactions: 0", pode ser que Gemini não detectou itens

3. **Qualidade da foto importa**:
   - Foto borrada = Gemini não lê itens
   - Boa iluminação + foco = mais itens detectados

---

## 📊 RESULTADOS ESPERADOS

### ✅ Comportamento correto após correções:

| Situação | Antes | Depois |
|----------|-------|--------|
| **Foto de nota com 5 itens** | Modal mostra "Transação 1 de 1" (só total) | Modal mostra "Transação 1 de 5" com navegação |
| **Erro HTML/JSON** | Aparecia sempre ao tirar foto | Não deve mais aparecer (exceto se Vercel cair) |
| **Log "transactions: 0"** | Aparecia mesmo com nota válida | Só deve aparecer se foto ilegível |

### 🎯 Transações individualizadas:

**Nota fiscal exemplo**:
```
Supermercado Extra
01/10/2025

Arroz Branco 5kg ..... R$ 24,90
Feijão Preto 1kg ...... R$ 8,50
Macarrão 500g ......... R$ 4,20
Óleo Soja 900ml ....... R$ 7,80
Açúcar Cristal 1kg .... R$ 4,60
---------------------------------
TOTAL ................. R$ 50,00
```

**Modal deve mostrar**:
```
Transação 1 de 5: Arroz Branco 5kg - R$ 24,90
[Próximo >]

Transação 2 de 5: Feijão Preto 1kg - R$ 8,50
[< Anterior] [Próximo >]

...
```

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ **PUSH FEITO** - commit `0d58498a` já no GitHub
2. 🔄 **TESTAR NO APP**:
   - Fechar app completamente
   - Reabrir (webview puxa última versão do site)
   - Testar foto de nota fiscal com múltiplos itens
3. 📱 **VER LOGS NO CONSOLE**:
   - Conectar celular no PC
   - Chrome DevTools > Remote Debugging
   - Ver logs `[CRÍTICO]` e `[STEP_X]`

---

## 🆘 TROUBLESHOOTING

### Se continuar dando erro HTML/JSON:
1. Verificar se Vercel está UP: https://ictus-app.vercel.app/api/gemini-ocr
2. Ver console: `[STEP_1] URL completa:` → deve apontar para Vercel
3. Se `status: 404`, o proxy não está funcionando (reiniciar `npm run dev`)

### Se modal continuar mostrando só 1 item:
1. Ver console: `transactions originais do Gemini: X`
2. Se for 1, Gemini não detectou múltiplos itens (foto ruim)
3. Se for > 1, problema está em `openTransactionModal` (investigar)

---

**Status**: ✅ PRONTO PARA TESTE  
**Requer rebuild APK?**: ❌ NÃO (é código webview)  
**Requer restart app?**: ✅ SIM (para puxar novo código do site)
