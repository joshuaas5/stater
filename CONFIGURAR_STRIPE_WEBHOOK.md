# 🔔 Configurar Webhook do Stripe para Ativar PRO Automaticamente

## O Problema
O pagamento foi processado no Stripe, mas o sistema não ativou o PRO porque o **webhook não está configurado** ou não está funcionando.

## Solução: Configurar Webhook no Stripe

### Passo 1: Acessar Painel do Stripe
1. Vá para: https://dashboard.stripe.com/webhooks
2. Clique em **"Add endpoint"** (ou "Adicionar endpoint")

### Passo 2: Configurar o Endpoint
- **URL do endpoint**: 
  ```
  https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/stripe-webhook
  ```
- **Eventos a escutar** (selecione todos):
  - `checkout.session.completed` ← ESSENCIAL
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### Passo 3: Copiar o Webhook Secret
Após criar, clique no webhook e copie o **"Signing secret"** (começa com `whsec_...`)

### Passo 4: Configurar no Supabase
1. Vá para: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/settings/vault
2. Adicione o segredo:
   - Nome: `STRIPE_WEBHOOK_SECRET`
   - Valor: O secret que você copiou (`whsec_...`)

3. Vá para: Edge Functions > stripe-webhook > Configurações
4. Adicione a variável de ambiente:
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...`

### Passo 5: Fazer Deploy do Webhook (se necessário)
```powershell
npx supabase functions deploy stripe-webhook --project-ref tmucbwlhkffrhtexmjze
```

---

## 🆘 Solução Temporária: Ativar PRO Manualmente

Enquanto configura o webhook, você pode ativar o PRO manualmente:

1. Vá para: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/sql/new
2. Execute o SQL (substitua o email):

```sql
INSERT INTO user_plans (user_id, plan_type, is_active, start_date, expires_at, payment_status, product_id, updated_at)
SELECT 
    id,
    'pro',
    true,
    NOW(),
    NOW() + INTERVAL '30 days',
    'active',
    'stater_pro_1490',
    NOW()
FROM auth.users 
WHERE email = 'EMAIL_DO_USUARIO_AQUI'
ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'pro',
    is_active = true,
    start_date = NOW(),
    expires_at = NOW() + INTERVAL '30 days',
    payment_status = 'active',
    product_id = 'stater_pro_1490',
    updated_at = NOW();
```

3. Depois faça logout/login no app (ou limpe cache + F5)

---

## ✅ Verificar se o Webhook está funcionando

1. No Stripe Dashboard > Webhooks, você verá os eventos enviados
2. Clique em um evento para ver se teve sucesso (200) ou erro
3. Se houver erro, verifique os logs no Supabase:
   - https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/functions/stripe-webhook/logs

---

## 🔍 Nova Edge Function: check-subscription

Criamos uma Edge Function adicional que **verifica diretamente no Stripe** se o usuário tem assinatura ativa. Isso funciona como backup caso o webhook falhe.

O Dashboard agora:
1. Verifica no banco de dados local (tabela `user_plans`)
2. Se não encontrar PRO, verifica no Stripe via `check-subscription`
3. Se encontrar assinatura ativa no Stripe, sincroniza automaticamente

---

## 📝 Variáveis de Ambiente Necessárias no Supabase

| Variável | Onde Configurar |
|----------|-----------------|
| `STRIPE_SECRET_KEY` | Edge Functions > Secrets |
| `STRIPE_WEBHOOK_SECRET` | Edge Functions > Secrets |
| `SUPABASE_URL` | Já configurado automaticamente |
| `SUPABASE_SERVICE_ROLE_KEY` | Já configurado automaticamente |
