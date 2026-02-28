# 🤖 Stater IA - Telegram Bot

## 🔗 Acesso ao Bot

**Link:** https://t.me/stater

## 📱 Funcionalidades

### 🎯 **Para usuários com conta vinculada:**
- 📷 **Análise de extratos:** Envie fotos de extratos bancários para análise automática com IA
- 💬 **Chat inteligente:** Converse com o Stater IA sobre suas finanças pessoais
- 📊 **Dados em tempo real:** Acesso aos seus dados financeiros do app Stater
- 🔄 **Sincronização automática:** Transações aparecem no app instantaneamente

### ⚡ **Para usuários sem conta:**
- 📷 **Demo de OCR:** Teste a análise de extratos (sem salvamento)
- 🤖 **Respostas básicas:** Perguntas gerais sobre finanças

## 🔗 Como Vincular sua Conta

### 1. **No App Stater:**
1. Acesse **Configurações > Telegram**
2. Clique em **"Gerar código de vinculação"**
3. Copie o código gerado (expira em 10 minutos)

### 2. **No Telegram:**
1. Acesse: [@stater](https://t.me/stater)
2. Digite: `/start SEU_CODIGO_AQUI`
3. Aguarde a confirmação de vinculação

## 💬 Comandos Disponíveis

- `/start` - Iniciar bot ou vincular conta
- `/help` - Lista de comandos e ajuda
- `/chat` - Ativar modo de conversação com IA
- `/dashboard` - Link para acessar o app Stater

## 🚀 Como Usar

### 📷 **Análise de Extratos:**
1. Tire uma foto clara do extrato bancário
2. Envie a imagem para o bot
3. Aguarde a análise da IA (Gemini)
4. Revise as transações encontradas
5. Digite **"SIM"** para confirmar ou **"NÃO"** para cancelar

### 💬 **Chat com IA:**
1. Digite `/chat` para ativar
2. Faça perguntas como:
   - "Como estão meus gastos este mês?"
   - "Qual categoria eu mais gasto?"
   - "Dicas para economizar"
   - "Relatório do mês passado"

## 🛠️ Configuração Técnica

### **Variáveis de Ambiente (.env):**
```env
# Bot Telegram
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN

# API Gemini
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Supabase
SUPABASE_URL=https://cpfnmfgaelacovegfdgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App URL
APP_URL=https://ictus-app.netlify.app
```

### **Dependências:**
```bash
npm install node-telegram-bot-api axios @supabase/supabase-js dotenv
```

### **Executar:**
```bash
node bot.js
```

## 🗄️ Estrutura do Banco

### **Tabelas necessárias no Supabase:**

```sql
-- Códigos de vinculação temporários
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

-- Usuários vinculados ao Telegram
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

## 🎯 Fluxo de Integração

1. **Usuário gera código** no app Stater
2. **Bot recebe comando** `/start CODIGO`
3. **Sistema valida** código no Supabase
4. **Vinculação é salva** permanentemente
5. **Bot tem acesso** aos dados do usuário
6. **Chat funciona** com contexto personalizado

## 🔧 Recursos Técnicos

- **IA Gemini 2.0 Flash Experimental** para análise de extratos
- **Gemini 2.5 Flash** para conversas em linguagem natural
- **Supabase** para banco de dados e autenticação
- **Node.js** com Telegram Bot API
- **OCR inteligente** para bancos brasileiros
- **Anti-duplicidade** de transações
- **Sincronização em tempo real**

### 4. Copiar o token
- BotFather vai dar um TOKEN
- Exemplo: YOUR_TELEGRAM_BOT_TOKEN
- Copie esse token

## 🔗 Acesso ao Bot

**Link:** https://t.me/stater

## 📱 Como Usar

1. **Acesse o bot:** [t.me/stater](https://t.me/stater)
2. **Digite `/start`** para iniciar
3. **Envie uma foto** do seu extrato bancário
4. **Aguarde o processamento** da IA
5. **Confirme as transações** encontradas
6. **Acesse o dashboard** com `/dashboard`

### 5. Configurar no arquivo .env
- Abra o arquivo .env
- Cole o token em: TELEGRAM_BOT_TOKEN=seu_token_aqui

### 6. Configurar comandos do bot
```
No BotFather, digite:
/setcommands

Selecione seu bot e cole:
start - Iniciar conversa
help - Como usar o bot  
dashboard - Ver suas transações
```

### 7. Configurar descrição
```
/setdescription
Selecione seu bot e cole:
Stater IA - Assistente financeiro inteligente para análise automática de extratos bancários. Envie foto do extrato e receba as transações processadas automaticamente!
```

### 8. Executar o bot
```bash
cd telegram-bot
node bot.js
```

## Funcionamento:
1. Usuário inicia conversa: /start
2. Usuário envia foto do extrato
3. Bot processa com IA Gemini
4. Bot retorna transações encontradas
5. Usuário confirma: SIM
6. Transações são salvas no app Stater

## Comandos disponíveis:
- `/start` - Iniciar bot
- `/help` - Ajuda e instruções
- `/dashboard` - Link para o app

## Recursos:
- ✅ Análise automática com IA
- ✅ Suporte a extratos brasileiros
- ✅ Integração com app Stater
- ✅ Interface amigável
- ✅ Totalmente gratuito
