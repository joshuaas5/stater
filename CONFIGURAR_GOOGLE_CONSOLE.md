# 🔧 CONFIGURAÇÕES NECESSÁRIAS NO GOOGLE CONSOLE

## ❌ PROBLEMA ATUAL
- GoogleAuth plugin retorna **código de erro 10**
- Isso indica problema na configuração OAuth no Google Console
- O SHA-1 fingerprint não está configurado corretamente

## ✅ SOLUÇÕES REQUERIDAS

### 1. **Google Cloud Console** (console.cloud.google.com)
Acesse o projeto: **stater-financial-assistant**

### 2. **Credentials > OAuth 2.0 Client IDs**
Você precisa configurar/atualizar o **Android Client ID**:

**Client ID Android atual:**
```
1011686437516-msfgio4ev9jdu3ck4hj0vb2s4bvvcq8e.apps.googleusercontent.com
```

**CONFIGURAÇÕES OBRIGATÓRIAS:**
- **Application type:** Android
- **Package name:** `com.timothy.stater`
- **SHA-1 certificate fingerprint:** `19:C2:55:D2:5F:FD:37:29:26:B1:70:4E:D7:31:84:27:21:C4:41:C6`

### 3. **Verificar APIs Habilitadas**
Certifique-se de que estas APIs estão ativadas:
- ✅ Google+ API (ou People API)
- ✅ Gmail API (se necessário)
- ✅ Google Identity API

### 4. **OAuth consent screen**
- Status: **Published** (não em testing)
- Usuários de teste adicionados (se ainda em testing)

## 🚀 PASSOS DETALHADOS

### **Passo 1: Atualize o Android Client ID**
1. Vá para Google Cloud Console
2. Navegue até "Credentials"
3. Encontre o Client ID Android existente
4. **EDITE** e adicione o SHA-1 fingerprint:
   ```
   19:C2:55:D2:5F:FD:37:29:26:B1:70:4E:D7:31:84:27:21:C4:41:C6
   ```
5. Salve as alterações

### **Passo 2: Verifique o OAuth Consent Screen**
1. Vá para "OAuth consent screen"
2. Se estiver em **Testing**: adicione seu email como test user
3. Se possível, publique o app (**Published** status)

### **Passo 3: Teste Novamente**
Após fazer essas configurações:
1. Aguarde 5-10 minutos para propagação
2. Teste o login nativo no app
3. O erro código 10 deve desaparecer

## 📱 RESULTADO ESPERADO
Depois das configurações corretas:
- ❌ Login nativo falha (código 10) → ✅ Login nativo funciona
- Sem mais fallback para Custom Chrome Tabs
- Login 100% interno no app, sem WebView

## ⚡ ALTERNATIVA RÁPIDA
Se as configurações do Google Console estiverem complicadas, posso implementar uma solução que:
1. Desabilita temporariamente o login nativo
2. Usa SEMPRE Custom Chrome Tabs (que funciona)
3. Remove as barras do navegador para experiência mais nativa

Qual você prefere: configurar o Google Console ou usar a alternativa rápida?