# 🔑 GUIA RÁPIDO - CONFIGURAR SERVICE_ROLE_KEY

## 📋 **PASSOS PARA PEGAR A CHAVE:**

### 1️⃣ **Acessar Supabase Dashboard**
🌐 https://supabase.com/dashboard

### 2️⃣ **Ir para Settings → API**
- Menu lateral: **Settings** ⚙️
- Submenu: **API** 📡

### 3️⃣ **Copiar a SERVICE_ROLE_KEY**
Na seção **"Project API keys"**:
- ❌ **anon/public**: Você já tem (termina com ...SJx8)
- ✅ **service_role**: **ESTA É A QUE PRECISAMOS!**

### 4️⃣ **Colar no .env**
```bash
# No arquivo: telegram-bot/.env
# Substituir esta linha:
SUPABASE_SERVICE_ROLE_KEY=COLE_AQUI_A_SERVICE_ROLE_KEY_DO_SUPABASE

# Pela chave real que você copiou (algo como):
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZm5tZmdhZWxhY292ZWdmZGdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzE3MjQ4MiwiZXhwIjoyMDQ4NzQ4NDgyfQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## ✅ **CONFIGURAÇÃO ATUAL DO SEU .env:**
```bash
✅ TELEGRAM_BOT_TOKEN - OK
✅ GEMINI_API_KEY - OK  
✅ SUPABASE_URL - OK
✅ SUPABASE_ANON_KEY - OK
✅ APP_URL - OK (https://staterbills.vercel.app)
⚠️ SUPABASE_SERVICE_ROLE_KEY - FALTANDO (adicionar)
```

## 🚀 **DEPOIS DE ADICIONAR A CHAVE:**
1. **Aplicar o script SQL** no Supabase (fix-telegram-406-error.sql)
2. **Reiniciar o bot**: `node bot.js`
3. **Testar conexão** no app → Telegram

## ⚠️ **IMPORTANTE:**
- A SERVICE_ROLE_KEY é **super sensível** - não compartilhe
- É diferente da ANON_KEY - tem mais permissões
- É essencial para resolver o erro 406

Após adicionar a chave, o erro 406 deve ser resolvido! 🎉
