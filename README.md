# ICTUS (Stater) - Assistente Financeiro com IA

Aplicacao de gestao financeira pessoal com foco em uso pratico no dia a dia:

- registro de receitas e despesas
- visao de contas e compromissos
- integracao com IA para orientacao financeira
- integracao com Telegram
- OCR para leitura de extratos/documentos

## Arquitetura

- Frontend: React + TypeScript + Vite (`src/`)
- API serverless: rotas em `api/`
- Dados e auth: Supabase
- Edge Functions e migracoes: `supabase/functions` e `supabase/migrations`
- Mobile wrapper: Capacitor (Android/iOS)

## Setup local

1. Instale dependencias:

```bash
npm install
```

2. Crie `.env` com base em `.env.example`.

3. Rode em desenvolvimento:

```bash
npm run dev
```

4. Build de producao:

```bash
npm run build
```

## Scripts principais

- `npm run dev`
- `npm run build`
- `npm run type-check`
- `npm run lint`
- `npm run preview`

## Seguranca (status atual)

Em 2026-04-16 foi feito hardening completo:

- sanitizacao de credenciais no codigo atual
- remocao de `.env` e arquivos sensiveis do versionamento
- endurecimento de RLS em tabelas sensiveis
- reescrita de historico Git para remover segredos legados

Migration aplicada de seguranca:

- `supabase/migrations/20260416170000_harden_rls_sensitive_tables.sql`

Runbook de rotacao obrigatoria de chaves:

- `SECURITY_ROTATION_RUNBOOK.md`

## Observacoes importantes

- sem variaveis de ambiente corretas, recursos de IA/Telegram/Supabase nao funcionam
- scripts legados de diagnostico foram mantidos para operacao interna, mas sem segredos hardcoded

## Objetivo do projeto

Nao e so dashboard. O objetivo e transformar organizacao financeira em rotina:

- menos friccao para registrar
- mais clareza para decidir
- automacao para manter consistencia