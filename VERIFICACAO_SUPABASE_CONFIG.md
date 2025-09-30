# VERIFICAÇÃO CONFIGURAÇÃO SUPABASE

## 🎯 Problema Identificado

A URL OAuth estava sendo construída manualmente, mas precisa usar a URL oficial do Supabase para garantir que todos os parâmetros de segurança estejam corretos.

## ✅ Correção Aplicada

### 1. Mudança Principal (`googleAuth.ts`)
- **ANTES**: URL construída manualmente
- **AGORA**: Usa `supabase.auth.signInWithOAuth()` com `skipBrowserRedirect: true`

### 2. Verificação Necessária no Painel Supabase

No painel do Supabase (https://app.supabase.com), verificar:

**Authentication > URL Configuration:**
- **Site URL**: `com.timothy.stater://auth/callback`
- **Redirect URLs**: Deve conter `com.timothy.stater://auth/callback`

**Authentication > Providers > Google:**
- **Client ID**: `470692281777-9hqk7ba14vtq26n2drvnqhpv2c7q0nof.apps.googleusercontent.com`
- **Client Secret**: (deve estar configurado)
- **Redirect URL**: `https://tmucbwlhkffrhtexmjze.supabase.co/auth/v1/callback`

## 🔍 Fluxo Correto

1. **App chama** → `supabase.auth.signInWithOAuth()`
2. **Supabase retorna** → URL OAuth oficial com parâmetros corretos
3. **Plugin nativo** → Intercepta e abre WebView interno
4. **Google Auth** → Processa no WebView interno
5. **Callback** → `com.timothy.stater://auth/callback?code=...`
6. **Deep link** → Capturado pela MainActivity
7. **Supabase** → Troca code por session token

## ⚠️ Se Ainda Não Funcionar

Verificar no painel Supabase se:
- Deep link `com.timothy.stater://auth/callback` está nas Redirect URLs
- Google Provider está habilitado e configurado corretamente
- Site URL não está forçando redirecionamento para web
