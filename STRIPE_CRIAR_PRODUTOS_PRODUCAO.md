# 🛍️ REGISTRAR PRODUTOS STRIPE - MODO PRODUÇÃO

**Data:** 15 de Outubro de 2025  
**Objetivo:** Criar os 2 produtos de assinatura em produção

---

## 🎯 ACESSO DIRETO

```
https://dashboard.stripe.com/products
```

⚠️ **IMPORTANTE:** Certifique-se de estar em **MODO PRODUÇÃO** (não teste)!

---

## 📦 PRODUTO 1: PLANO SEMANAL

### **1. Clique em: "+ Adicionar produto"**

### **2. Preencha os campos:**

#### **Nome do produto:**
```
Stater Premium - Plano Semanal
```

#### **Descrição:**
```
Acesso completo às funcionalidades premium do Stater por 7 dias. Inclui: transações ilimitadas, análise financeira com IA avançada, Telegram Bot (5.000 análises/mês), OCR (1.000 documentos/mês), relatórios personalizados, suporte prioritário 24/7, backup automático na nuvem e acesso antecipado a novos recursos.
```

#### **Imagem do produto (opcional):**
- Pode adicionar um logo/ícone depois
- Ou deixe em branco por enquanto

---

### **3. Informações de preço:**

#### **Modelo de preço:**
- Selecione: ✅ **"Preço padrão"**

#### **Preço:**
```
8.90
```

#### **Moeda:**
```
BRL - Real brasileiro
```

#### **Cobrança recorrente:**
- Selecione: ✅ **"Recorrente"**

#### **Intervalo de cobrança:**
- Selecione: ✅ **"Semanal"** (Weekly)
- Intervalo: `1` (a cada 1 semana)

#### **Tipo de uso:**
- Selecione: ✅ **"Licenciado"**

---

### **4. Configurações adicionais (Expandir "Mais opções"):**

#### **Nome de exibição do preço (opcional):**
```
Plano Semanal
```

#### **Descrição do preço:**
```
R$ 8,90 cobrado semanalmente
```

#### **Período de teste gratuito:**
- ❌ Deixe em branco (não vamos oferecer trial agora)
- **OU** se quiser: `7` dias de teste grátis

#### **URL da fatura:**
```
https://stater.app
```

---

### **5. Clique em: "Salvar produto"**

### **6. 🔑 COPIE O PRICE ID:**

Após salvar, você verá:
```
Price ID: price_XXXXXXXXXXXXXXXXXXXXXXXX
```

**ANOTE ESSE ID!** Vai precisar depois!

---

## 📦 PRODUTO 2: PLANO MENSAL

### **1. Clique em: "+ Adicionar produto"** novamente

### **2. Preencha os campos:**

#### **Nome do produto:**
```
Stater Premium - Plano Mensal
```

#### **Descrição:**
```
Acesso completo às funcionalidades premium do Stater por 30 dias com DESCONTO! Inclui: transações ilimitadas, análise financeira com IA avançada, Telegram Bot (5.000 análises/mês), OCR (1.000 documentos/mês), relatórios personalizados, suporte prioritário 24/7, backup automático na nuvem e acesso antecipado a novos recursos. Economize mais de 50% comparado ao plano semanal!
```

---

### **3. Informações de preço:**

#### **Modelo de preço:**
- Selecione: ✅ **"Preço padrão"**

#### **Preço:**
```
19.90
```

#### **Moeda:**
```
BRL - Real brasileiro
```

#### **Cobrança recorrente:**
- Selecione: ✅ **"Recorrente"**

#### **Intervalo de cobrança:**
- Selecione: ✅ **"Mensal"** (Monthly)
- Intervalo: `1` (a cada 1 mês)

#### **Tipo de uso:**
- Selecione: ✅ **"Licenciado"**

---

### **4. Configurações adicionais:**

#### **Nome de exibição do preço:**
```
Plano Mensal
```

#### **Descrição do preço:**
```
R$ 19,90 cobrado mensalmente - Economize 56%!
```

#### **Período de teste gratuito:**
- ❌ Deixe em branco
- **OU** se quiser: `7` dias de teste grátis

#### **URL da fatura:**
```
https://stater.app
```

---

### **5. Clique em: "Salvar produto"**

### **6. 🔑 COPIE O PRICE ID:**

```
Price ID: price_XXXXXXXXXXXXXXXXXXXXXXXX
```

**ANOTE ESSE ID TAMBÉM!**

---

## 📋 RESUMO DOS IDS QUE VOCÊ VAI TER

Depois de criar os 2 produtos, você terá:

```
PLANO SEMANAL:
Price ID: price_XXXXXXXXXXXXXXXXXXXX

PLANO MENSAL:
Price ID: price_YYYYYYYYYYYYYYYYYYYY
```

---

## 🔧 ONDE USAR ESSES IDS

### **1. Vercel (Environment Variables):**

```
VITE_STRIPE_PRICE_WEEKLY=price_XXXXXXXXXXXXXXXXXXXX
VITE_STRIPE_PRICE_MONTHLY=price_YYYYYYYYYYYYYYYYYYYY
```

### **2. Supabase (se tiver hardcoded):**

Substitua nos arquivos:
- `src/lib/stripe.ts`
- Edge Functions (se tiver)

---

## ✅ CHECKLIST

Depois de criar os produtos:

- [ ] ✅ Produto "Stater Premium - Plano Semanal" criado
- [ ] ✅ Preço: R$ 8,90 / semana
- [ ] ✅ Price ID semanal copiado
- [ ] ✅ Produto "Stater Premium - Plano Mensal" criado
- [ ] ✅ Preço: R$ 19,90 / mês
- [ ] ✅ Price ID mensal copiado
- [ ] 🔄 IDs configurados no Vercel
- [ ] 🔄 Vercel redeployado

---

## 💡 DICAS EXTRAS

### **Adicionar Badge "Mais Popular":**

No Stripe, você pode:
1. Editar o produto mensal
2. Adicionar metadata: `featured: true`
3. Usar isso no frontend para destacar

### **Cupons de Desconto:**

Criar cupom de 50% OFF para primeiros usuários:
1. Stripe Dashboard → Produtos → Cupons
2. Criar cupom: `LANCAMENTO50`
3. Desconto: 50%
4. Duração: 1 mês ou para sempre
5. Compartilhar código com primeiros usuários!

### **Teste os Produtos:**

Antes de ir live:
1. Faça um teste com cartão real (seu próprio)
2. Verifique se o webhook ativa o premium
3. Cancele logo em seguida se não quiser ser cobrado

---

## 🚨 IMPORTANTE

### **❌ NÃO ESQUEÇA:**
- Copiar os Price IDs de PRODUÇÃO (não os de teste!)
- Verificar se está em modo produção ao criar
- Salvar os IDs em local seguro

### **✅ SEMPRE FAÇA:**
- Teste com cartão real antes de divulgar
- Monitore os primeiros pagamentos
- Verifique se webhook está funcionando

---

## 📞 PRECISA DE AJUDA?

Se tiver dúvida em algum campo:
- Chat Stripe: Canto inferior direito do dashboard
- Suporte: https://support.stripe.com

---

**COLA AQUI OS PRICE IDS DEPOIS QUE CRIAR!** Vou te ajudar a configurar no Vercel! 🚀
