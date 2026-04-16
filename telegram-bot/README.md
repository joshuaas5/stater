# ðŸ¤– Stater IA - Telegram Bot

## ðŸ”— Acesso ao Bot

**Link:** https://t.me/stater

## ðŸ“± Funcionalidades

### ðŸŽ¯ **Para usuÃ¡rios com conta vinculada:**
- ðŸ“· **AnÃ¡lise de extratos:** Envie fotos de extratos bancÃ¡rios para anÃ¡lise automÃ¡tica com IA
- ðŸ’¬ **Chat inteligente:** Converse com o Stater IA sobre suas finanÃ§as pessoais
- ðŸ“Š **Dados em tempo real:** Acesso aos seus dados financeiros do app Stater
- ðŸ”„ **SincronizaÃ§Ã£o automÃ¡tica:** TransaÃ§Ãµes aparecem no app instantaneamente

### âš¡ **Para usuÃ¡rios sem conta:**
- ðŸ“· **Demo de OCR:** Teste a anÃ¡lise de extratos (sem salvamento)
- ðŸ¤– **Respostas bÃ¡sicas:** Perguntas gerais sobre finanÃ§as

## ðŸ”— Como Vincular sua Conta

### 1. **No App Stater:**
1. Acesse **ConfiguraÃ§Ãµes > Telegram**
2. Clique em **"Gerar cÃ³digo de vinculaÃ§Ã£o"**
3. Copie o cÃ³digo gerado (expira em 10 minutos)

### 2. **No Telegram:**
1. Acesse: [@stater](https://t.me/stater)
2. Digite: `/start SEU_CODIGO_AQUI`
3. Aguarde a confirmaÃ§Ã£o de vinculaÃ§Ã£o

## ðŸ’¬ Comandos DisponÃ­veis

- `/start` - Iniciar bot ou vincular conta
- `/help` - Lista de comandos e ajuda
- `/chat` - Ativar modo de conversaÃ§Ã£o com IA
- `/dashboard` - Link para acessar o app Stater

## ðŸš€ Como Usar

### ðŸ“· **AnÃ¡lise de Extratos:**
1. Tire uma foto clara do extrato bancÃ¡rio
2. Envie a imagem para o bot
3. Aguarde a anÃ¡lise da IA (Gemini)
4. Revise as transaÃ§Ãµes encontradas
5. Digite **"SIM"** para confirmar ou **"NÃƒO"** para cancelar

### ðŸ’¬ **Chat com IA:**
1. Digite `/chat` para ativar
2. FaÃ§a perguntas como:
   - "Como estÃ£o meus gastos este mÃªs?"
   - "Qual categoria eu mais gasto?"
   - "Dicas para economizar"
   - "RelatÃ³rio do mÃªs passado"

## ðŸ› ï¸ ConfiguraÃ§Ã£o TÃ©cnica

### **VariÃ¡veis de Ambiente (.env):**
```env
# Bot Telegram
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN

# API Gemini
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Supabase
SUPABASE_URL=https://cpfnmfgaelacovegfdgh.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# App URL
APP_URL=https://ictus-app.netlify.app
```

### **DependÃªncias:**
```bash
npm install node-telegram-bot-api axios @supabase/supabase-js dotenv
```

### **Executar:**
```bash
node bot.js
```

## ðŸ—„ï¸ Estrutura do Banco

### **Tabelas necessÃ¡rias no Supabase:**

```sql
-- CÃ³digos de vinculaÃ§Ã£o temporÃ¡rios
CREATE TABLE telegram_link_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NULL
);

-- UsuÃ¡rios vinculados ao Telegram
CREATE TABLE telegram_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_chat_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

## ðŸŽ¯ Fluxo de IntegraÃ§Ã£o

1. **UsuÃ¡rio gera cÃ³digo** no app Stater
2. **Bot recebe comando** `/start CODIGO`
3. **Sistema valida** cÃ³digo no Supabase
4. **VinculaÃ§Ã£o Ã© salva** permanentemente
5. **Bot tem acesso** aos dados do usuÃ¡rio
6. **Chat funciona** com contexto personalizado

## ðŸ”§ Recursos TÃ©cnicos

- **IA Gemini 2.0 Flash Experimental** para anÃ¡lise de extratos
- **Gemini 2.5 Flash** para conversas em linguagem natural
- **Supabase** para banco de dados e autenticaÃ§Ã£o
- **Node.js** com Telegram Bot API
- **OCR inteligente** para bancos brasileiros
- **Anti-duplicidade** de transaÃ§Ãµes
- **SincronizaÃ§Ã£o em tempo real**

### 4. Copiar o token
- BotFather vai dar um TOKEN
- Exemplo: YOUR_TELEGRAM_BOT_TOKEN
- Copie esse token

## ðŸ”— Acesso ao Bot

**Link:** https://t.me/stater

## ðŸ“± Como Usar

1. **Acesse o bot:** [t.me/stater](https://t.me/stater)
2. **Digite `/start`** para iniciar
3. **Envie uma foto** do seu extrato bancÃ¡rio
4. **Aguarde o processamento** da IA
5. **Confirme as transaÃ§Ãµes** encontradas
6. **Acesse o dashboard** com `/dashboard`

### 5. Configurar no arquivo .env
- Abra o arquivo .env
- Cole o token em: TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN

### 6. Configurar comandos do bot
```
No BotFather, digite:
/setcommands

Selecione seu bot e cole:
start - Iniciar conversa
help - Como usar o bot  
dashboard - Ver suas transaÃ§Ãµes
```

### 7. Configurar descriÃ§Ã£o
```
/setdescription
Selecione seu bot e cole:
Stater IA - Assistente financeiro inteligente para anÃ¡lise automÃ¡tica de extratos bancÃ¡rios. Envie foto do extrato e receba as transaÃ§Ãµes processadas automaticamente!
```

### 8. Executar o bot
```bash
cd telegram-bot
node bot.js
```

## Funcionamento:
1. UsuÃ¡rio inicia conversa: /start
2. UsuÃ¡rio envia foto do extrato
3. Bot processa com IA Gemini
4. Bot retorna transaÃ§Ãµes encontradas
5. UsuÃ¡rio confirma: SIM
6. TransaÃ§Ãµes sÃ£o salvas no app Stater

## Comandos disponÃ­veis:
- `/start` - Iniciar bot
- `/help` - Ajuda e instruÃ§Ãµes
- `/dashboard` - Link para o app

## Recursos:
- âœ… AnÃ¡lise automÃ¡tica com IA
- âœ… Suporte a extratos brasileiros
- âœ… IntegraÃ§Ã£o com app Stater
- âœ… Interface amigÃ¡vel
- âœ… Totalmente gratuito

