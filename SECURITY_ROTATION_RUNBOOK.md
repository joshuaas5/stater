# SECURITY ROTATION RUNBOOK (ICTUS)

Data de referencia: 2026-04-16

Este runbook cobre o passo 1 apos limpeza de historico: rotacionar todas as credenciais que ja apareceram no repositorio no passado.

## 1) Supabase (obrigatorio)

- Rotacionar `SUPABASE_SERVICE_ROLE_KEY`
- Regenerar `SUPABASE_ANON_KEY` se houver suspeita de abuso
- Atualizar secrets em ambiente de deploy (Vercel/Supabase Functions)
- Revisar politicas RLS e confirmar que funcoes usam service role apenas no servidor

## 2) Telegram Bot (obrigatorio)

- Revogar token atual via BotFather (`/revoke`)
- Gerar novo token (`/token`)
- Atualizar `TELEGRAM_BOT_TOKEN` no ambiente
- Reconfigurar webhook com novo token

## 3) Gemini API Key (obrigatorio)

- Revogar chave antiga no Google AI Studio / GCP
- Criar nova chave com restricao de uso
- Atualizar `GEMINI_API_KEY` no ambiente

## 4) Stripe (obrigatorio)

- Rotacionar `STRIPE_SECRET_KEY`
- Rotacionar `STRIPE_WEBHOOK_SECRET`
- Atualizar secrets em runtime
- Validar assinatura de webhook em producao

## 5) Firebase/Web keys (revisao)

- Revisar `google-services.json` e credenciais de projeto
- Aplicar restricoes de API key por app/package e origem

## 6) Verificacao final

Executar no repo local:

```bash
git grep -nI -E "AIza[0-9A-Za-z_-]{20,}|[0-9]{8,}:[A-Za-z0-9_-]{30,}|sk_live_[A-Za-z0-9]{20,}|sk_test_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"
```

Se esse comando nao retornar linhas, o estado atual do codigo rastreado esta limpo.

## 7) Resultado esperado

- historico reescrito
- segredos antigos invalidados
- novos segredos apenas em ambiente
- repositorio seguro para permanecer publico