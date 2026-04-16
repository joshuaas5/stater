# ðŸ”‘ GUIA RÃPIDO - CONFIGURAR SERVICE_ROLE_KEY

## ðŸ“‹ **PASSOS PARA PEGAR A CHAVE:**

### 1ï¸âƒ£ **Acessar Supabase Dashboard**
ðŸŒ https://supabase.com/dashboard

### 2ï¸âƒ£ **Ir para Settings â†’ API**
- Menu lateral: **Settings** âš™ï¸
- Submenu: **API** ðŸ“¡

### 3ï¸âƒ£ **Copiar a SERVICE_ROLE_KEY**
Na seÃ§Ã£o **"Project API keys"**:
- âŒ **anon/public**: VocÃª jÃ¡ tem (termina com ...SJx8)
- âœ… **service_role**: **ESTA Ã‰ A QUE PRECISAMOS!**

### 4ï¸âƒ£ **Colar no .env**
```bash
# No arquivo: telegram-bot/.env
# Substituir esta linha:
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# Pela chave real que vocÃª copiou (algo como):
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

## âœ… **CONFIGURAÃ‡ÃƒO ATUAL DO SEU .env:**
```bash
âœ… TELEGRAM_BOT_TOKEN - OK
âœ… GEMINI_API_KEY - OK  
âœ… SUPABASE_URL - OK
âœ… SUPABASE_ANON_KEY - OK
âœ… APP_URL - OK (https://stater.app)
âš ï¸ SUPABASE_SERVICE_ROLE_KEY - FALTANDO (adicionar)
```

## ðŸš€ **DEPOIS DE ADICIONAR A CHAVE:**
1. **Aplicar o script SQL** no Supabase (fix-telegram-406-error.sql)
2. **Reiniciar o bot**: `node bot.js`
3. **Testar conexÃ£o** no app â†’ Telegram

## âš ï¸ **IMPORTANTE:**
- A SERVICE_ROLE_KEY Ã© **super sensÃ­vel** - nÃ£o compartilhe
- Ã‰ diferente da ANON_KEY - tem mais permissÃµes
- Ã‰ essencial para resolver o erro 406

ApÃ³s adicionar a chave, o erro 406 deve ser resolvido! ðŸŽ‰

