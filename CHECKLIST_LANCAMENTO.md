# 🚀 CHECKLIST DE LANÇAMENTO - STATER APP

**Data:** 15 de Outubro de 2025  
**Objetivo:** Lançar Stater.app em produção completa

---

## ✅ FASE 1: VALIDAÇÕES PRÉ-LANÇAMENTO

### **1.1 Pagamentos Stripe**
- [x] ✅ Stripe configurado em modo teste
- [x] ✅ 2 produtos criados (Semanal R$ 8,90 / Mensal R$ 19,90)
- [x] ✅ Edge Functions deployadas (create-checkout + stripe-webhook)
- [x] ✅ Teste de pagamento com cartão teste funcionando
- [ ] 🔄 **AÇÃO:** Ativar modo PRODUÇÃO no Stripe
- [ ] 🔄 **AÇÃO:** Substituir API keys de teste por produção no Vercel

### **1.2 Google AdSense**
- [ ] ⏳ Status atual: "Preparando seu site"
- [ ] ⏳ Aguardando aprovação do Google (pode levar 2-7 dias)
- [ ] 🔄 **AÇÃO:** Monitorar email para aprovação
- [ ] ⚠️ **NOTA:** Não bloqueia lançamento, ads aparecem após aprovação

### **1.3 Funcionalidades Core**
- [x] ✅ Dashboard funcionando
- [x] ✅ Transações (criar, editar, deletar)
- [x] ✅ Categorias e tags
- [x] ✅ Gráficos e relatórios
- [x] ✅ Telegram Bot integrado
- [x] ✅ OCR de documentos
- [x] ✅ IA Advisor
- [x] ✅ Dark Mode
- [x] ✅ Mobile responsivo

### **1.4 Sistema de Limites**
- [x] ✅ Plano Free: 3 análises IA/dia
- [x] ✅ Plano Premium: OCR 1.000/mês + Telegram 5.000/mês
- [x] ✅ Modal Premium sem duplicações
- [x] ✅ Paywall funcionando corretamente

---

## 🔧 FASE 2: CONFIGURAÇÕES FINAIS

### **2.1 Ambiente de Produção (Vercel)**

**Variáveis de Ambiente a Configurar:**

```bash
# Stripe (PRODUÇÃO)
VITE_STRIPE_PUBLIC_KEY=chave_publica_producao_stripeXXXXXXXXXXXXXXXXXXXXXXXX
VITE_STRIPE_PRICE_WEEKLY=price_live_XXXXXXXXXXXXXXXXXXXXXXXX
VITE_STRIPE_PRICE_MONTHLY=price_live_XXXXXXXXXXXXXXXXXXXXXXXX

# Supabase
VITE_SUPABASE_URL=https://tmucbwlhkffrhtexmjze.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Google AdSense
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_ENABLED=true

# Analytics
VITE_GA_TRACKING_ID=[seu_GA4_tracking_id]
```

### **2.2 Supabase Edge Functions (Produção)**

**Secrets a Configurar:**

```bash
supabase secrets set STRIPE_SECRET_KEY=STRIPE_SECRET_KEY_PROD_PLACEHOLDER
supabase secrets set STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET_PLACEHOLDER
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

### **2.3 Stripe Dashboard (Modo Produção)**

- [ ] 🔄 Ativar modo produção (toggle no topo)
- [ ] 🔄 Verificar webhook em produção:
  - URL: `https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/stripe-webhook`
  - Eventos: checkout.session.completed, customer.subscription.deleted, invoice.payment_failed
- [ ] 🔄 Copiar novas API Keys de produção
- [ ] 🔄 Testar pagamento real com cartão verdadeiro (seu próprio)

---

## 📊 FASE 3: MONITORAMENTO

### **3.1 Analytics e Tracking**

**Implementar Google Analytics 4:**

```typescript
// src/lib/analytics.ts
import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize(import.meta.env.VITE_GA_TRACKING_ID || '');
};

export const logPageView = () => {
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
};

export const logEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({ category, action, label });
};
```

**Eventos importantes para rastrear:**
- Cadastros (signups)
- Logins
- Cliques em "Assinar Premium"
- Checkouts concluídos
- Uso de funcionalidades (Telegram Bot, OCR, Advisor)

### **3.2 Logs de Erro**

**Implementar Sentry (opcional):**

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: 'production',
  tracesSampleRate: 1.0,
});
```

### **3.3 Monitoramento de Performance**

**Métricas para acompanhar:**
- [ ] Taxa de conversão (Free → Premium)
- [ ] Churn rate (cancelamentos)
- [ ] MRR (Monthly Recurring Revenue)
- [ ] Usuários ativos diários/mensais
- [ ] Tempo médio de sessão
- [ ] Funcionalidades mais usadas

**Dashboard Stripe:**
- Pagamentos bem-sucedidos
- Pagamentos falhados
- Assinaturas ativas
- Receita mensal

**Dashboard Supabase:**
- Usuários cadastrados
- Uso de Edge Functions
- Queries por minuto
- Storage utilizado

---

## 🎯 FASE 4: MARKETING PRÉ-LANÇAMENTO

### **4.1 Landing Page**

- [ ] 🔄 Criar página inicial atraente (home)
- [ ] 🔄 Adicionar seção de features
- [ ] 🔄 Testemunhos (após primeiros usuários)
- [ ] 🔄 FAQ (Perguntas frequentes)
- [ ] 🔄 CTA claro: "Comece Grátis" / "Teste 7 dias Premium"

### **4.2 SEO Básico**

```html
<!-- public/index.html -->
<title>Stater - Gestão Financeira Inteligente com IA</title>
<meta name="description" content="Controle suas finanças pessoais com IA, Telegram Bot, OCR de documentos e análises avançadas. Grátis para começar!">
<meta name="keywords" content="gestão financeira, controle financeiro, IA, Telegram, OCR, planilha financeira">

<!-- Open Graph -->
<meta property="og:title" content="Stater - Gestão Financeira Inteligente">
<meta property="og:description" content="A forma mais inteligente de gerenciar suas finanças">
<meta property="og:image" content="https://stater.app/og-image.png">
<meta property="og:url" content="https://stater.app">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Stater - Gestão Financeira Inteligente">
<meta name="twitter:description" content="A forma mais inteligente de gerenciar suas finanças">
<meta name="twitter:image" content="https://stater.app/twitter-card.png">
```

### **4.3 Google Search Console**

- [ ] 🔄 Adicionar site no Google Search Console
- [ ] 🔄 Enviar sitemap.xml
- [ ] 🔄 Solicitar indexação das páginas principais

---

## 🚨 FASE 5: CONTINGÊNCIAS

### **5.1 Plano B para Problemas**

**Se Stripe der erro:**
- Logs disponíveis em: Stripe Dashboard → Developers → Logs
- Webhook logs: Supabase Dashboard → Functions → stripe-webhook → Logs
- Email de suporte: Stripe suporta português

**Se AdSense não aprovar:**
- Alternativas: Google AdMob (mobile), Media.net, PropellerAds
- Ou focar em receita Premium (melhor margem)

**Se Supabase cair:**
- Status: https://status.supabase.com
- Backup manual: Export de dados SQL
- Plano de migração: Railway, Render, Fly.io

### **5.2 Rollback Strategy**

**Se algo quebrar em produção:**

```bash
# Voltar para commit anterior
git revert HEAD
git push origin main

# Ou fazer rollback no Vercel Dashboard:
# Vercel → Deployments → [Último deploy estável] → Promote to Production
```

---

## ✅ FASE 6: CHECKLIST FINAL DE LANÇAMENTO

### **Dia do Lançamento:**

- [ ] ✅ Stripe em modo PRODUÇÃO
- [ ] ✅ Variáveis de ambiente configuradas no Vercel
- [ ] ✅ Edge Functions com secrets de produção
- [ ] ✅ Teste completo: cadastro → login → transação → premium → pagamento
- [ ] ✅ Mobile testado (iOS + Android)
- [ ] ✅ Dark mode funcionando
- [ ] ✅ Links de redes sociais atualizados
- [ ] ✅ Email de suporte configurado (ex: suporte@stater.app)
- [ ] ✅ Termos de Uso + Política de Privacidade publicados
- [ ] ✅ Monitoramento ativo (Analytics, Stripe, Supabase)

### **Pós-Lançamento (Primeiras 24h):**

- [ ] 🔄 Monitorar logs de erro
- [ ] 🔄 Verificar pagamentos entrando corretamente
- [ ] 🔄 Acompanhar métricas de cadastro
- [ ] 🔄 Responder dúvidas de usuários
- [ ] 🔄 Ajustar limites de rate se necessário

### **Primeira Semana:**

- [ ] 🔄 Coletar feedback dos primeiros usuários
- [ ] 🔄 Corrigir bugs urgentes
- [ ] 🔄 Otimizar conversão Free → Premium
- [ ] 🔄 Adicionar features mais pedidas

---

## 🎉 PRÓXIMOS PASSOS APÓS LANÇAMENTO

### **Curto Prazo (1-2 semanas):**
1. Campanha de lançamento nas redes sociais
2. Divulgação em comunidades (Product Hunt, Reddit, Grupos Facebook)
3. Email marketing para beta testers
4. Parceria com influenciadores de finanças

### **Médio Prazo (1-3 meses):**
1. Implementar sistema de referral (indique e ganhe)
2. Criar versão mobile nativa (React Native / Flutter)
3. Integração com bancos (Open Banking)
4. Expandir funcionalidades de IA

### **Longo Prazo (6+ meses):**
1. Plano Enterprise (para empresas)
2. API pública para desenvolvedores
3. Marketplace de integrações
4. Expansão internacional

---

## 📞 CONTATOS IMPORTANTES

- **Stripe Suporte:** https://support.stripe.com
- **Supabase Suporte:** https://supabase.com/support
- **Vercel Suporte:** https://vercel.com/support
- **Google AdSense:** https://support.google.com/adsense

---

## 🔥 DECISÃO: QUANDO LANÇAR?

### **Opção 1: Lançamento Beta (RECOMENDADO)**
✅ **Agora mesmo!**
- Stripe funcionando ✅
- Core features prontas ✅
- AdSense pendente (não bloqueia)
- Permite testar com usuários reais
- Correções com feedback real

### **Opção 2: Lançamento Oficial**
⏳ **Aguardar:**
- Aprovação Google AdSense (2-7 dias)
- Mais testes internos
- Landing page mais robusta
- Maior risco: atrasar sem ganhar qualidade

---

## 🚀 MINHA RECOMENDAÇÃO

**LANCE AGORA EM MODO BETA:**

1. ✅ Stripe funcionando → receita ativa
2. ✅ Funcionalidades core → valor entregue
3. ⏳ AdSense → adiciona receita depois (não é crítico)
4. 🎯 Feedback real → melhora produto mais rápido

**O que fazer:**
1. Poste nas redes: "🎉 Stater em Beta Público! Primeiros 100 usuários ganham 50% desconto no Premium!"
2. Divulgue em grupos de finanças pessoais
3. Monitore métricas e bugs
4. Ajuste conforme feedback
5. Lançamento oficial em 2 semanas com melhorias

---

**ESTÁ PRONTO PARA LANÇAR?** 🚀

Só falta:
1. Ativar Stripe em produção
2. Configurar variáveis no Vercel
3. Apertar o botão! 🔥

