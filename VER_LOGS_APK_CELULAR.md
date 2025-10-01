# 📱 Como Ver Logs do APK Rodando no Celular

## 🎯 OBJETIVO
Ver os logs do console JavaScript do app rodando no seu celular Samsung Galaxy A54.

---

## ✅ MÉTODO 1: Chrome Remote Debugging (MAIS FÁCIL)

### Requisitos:
- Celular conectado no PC via cabo USB
- Depuração USB habilitada
- Chrome instalado no PC

### Passo a Passo:

#### 1️⃣ **Habilitar Depuração USB no Celular**

1. Abra **Configurações** no celular
2. Vá em **Sobre o telefone** (ou "Sobre o dispositivo")
3. Encontre **"Número da versão"** ou **"Número de compilação"**
4. **Toque 7 vezes seguidas** nele
5. Vai aparecer: "Você agora é um desenvolvedor!"
6. Volte para **Configurações**
7. Procure por **"Opções do desenvolvedor"** ou **"Developer options"**
8. Ative **"Depuração USB"** (USB debugging)

#### 2️⃣ **Conectar Celular no PC**

1. Conecte o cabo USB do celular no PC
2. No celular, vai aparecer um popup: **"Permitir depuração USB?"**
3. Marque **"Sempre permitir neste computador"**
4. Clique em **"OK"**

#### 3️⃣ **Abrir Chrome Inspect no PC**

1. Abra o **Google Chrome** no PC
2. Na barra de endereços, digite:
   ```
   chrome://inspect
   ```
3. Aperte Enter

#### 4️⃣ **Encontrar Seu App**

Você verá algo assim:
```
Devices
├─ Samsung SM-A546E
│  ├─ ICTUS (capacitor://localhost)
│  │  └─ [inspect] ← CLIQUE AQUI!
```

Se não aparecer:
- ✅ Verifique se o app ICTUS está **ABERTO** no celular
- ✅ Verifique se "Discover USB devices" está marcado
- ✅ Desconecte e reconecte o cabo USB
- ✅ Tente outro cabo USB

#### 5️⃣ **Ver os Logs!**

1. Clique em **"inspect"** ao lado do ICTUS
2. Uma janela **DevTools** vai abrir
3. Vá na aba **"Console"**
4. **Agora você está vendo o console do app rodando no celular!**

#### 6️⃣ **Teste e Copie os Logs**

1. No celular, tire uma foto de uma nota fiscal
2. No PC, você verá os logs aparecendo em tempo real:
   ```
   🚨🚨🚨 [INICIO_UPLOAD] handleImageUpload FOI CHAMADA!
   ✅ [CHECKPOINT_1] Usuário autenticado: xxx
   🔓 [PAYWALL_DISABLED] Paywall temporariamente desabilitado
   🎬 [PRE_FETCH] CHEGOU NA ETAPA DE FETCH!
   🚀 [STEP_1] Iniciando fetch para API OCR
   ...
   ```
3. **Clique com botão direito** no console → **"Save as..."** para salvar todos os logs
4. Ou simplesmente **copie e cole** aqui no chat

---

## 🔧 MÉTODO 2: Android Studio Logcat

Se o Chrome Inspect não funcionar, use o Android Studio:

### Passo a Passo:

#### 1️⃣ **Instalar Android Studio** (se não tiver)
- Download: https://developer.android.com/studio
- Não precisa criar projeto, só usar o Logcat

#### 2️⃣ **Conectar Celular**
- Conecte via USB com depuração USB ativada (mesmo processo acima)

#### 3️⃣ **Abrir Logcat**
1. Abra Android Studio
2. Vá em **View** → **Tool Windows** → **Logcat**
3. Selecione seu dispositivo **Samsung Galaxy A54**
4. No filtro, digite:
   ```
   chromium
   ```
   Isso vai filtrar apenas logs do webview (onde o app roda)

#### 4️⃣ **Ver Logs**
1. Abra o app ICTUS no celular
2. Tire uma foto
3. No Logcat você verá os logs do console JavaScript

#### 5️⃣ **Copiar Logs**
- Clique com botão direito → **Copy**
- Cole aqui no chat

---

## 🚨 MÉTODO 3: Usar Terminal ADB (Avançado)

Se nenhum dos anteriores funcionar:

### Passo a Passo:

#### 1️⃣ **Verificar se ADB está instalado**

Abra PowerShell e execute:
```powershell
adb version
```

Se não estiver instalado:
```powershell
# Instalar via Chocolatey
choco install adb

# OU baixar Android Platform Tools:
# https://developer.android.com/tools/releases/platform-tools
```

#### 2️⃣ **Conectar Celular**
```powershell
# Verificar se celular está conectado
adb devices
```

Deve aparecer:
```
List of devices attached
XXXXXXXXXXXXXX  device
```

#### 3️⃣ **Ver Logs em Tempo Real**
```powershell
# Filtrar apenas logs do webview/chromium
adb logcat chromium:V *:S
```

#### 4️⃣ **Salvar Logs em Arquivo**
```powershell
# Salvar logs em arquivo de texto
adb logcat chromium:V *:S > logs_ictus.txt
```

#### 5️⃣ **Limpar e Coletar Logs Frescos**
```powershell
# Limpar logs antigos
adb logcat -c

# Iniciar coleta
adb logcat chromium:V *:S > logs_ictus.txt

# No celular, tire a foto agora
# Depois pressione Ctrl+C para parar

# Abra o arquivo logs_ictus.txt e me envie
```

---

## 📋 MÉTODO 4: Via App de Log no Celular (Menos Confiável)

Se você não puder conectar o celular no PC:

1. Instale um app de logs (exemplo: **"Logcat Reader"** na Play Store)
2. Dê permissões de leitura de logs
3. Filtre por "chromium" ou "console"
4. Tire screenshot dos logs
5. Me envie as screenshots

---

## 🎯 QUAL MÉTODO USAR?

### ✅ **RECOMENDADO: Método 1 (Chrome Inspect)**
- Mais fácil
- Mostra exatamente o console JavaScript
- Logs formatados e coloridos
- Pode até debugar o código!

### 🔸 **ALTERNATIVO: Método 2 (Android Studio Logcat)**
- Se Chrome Inspect não funcionar
- Mais completo (mostra todos os logs do sistema)
- Precisa filtrar muito

### 🔹 **ÚLTIMO RECURSO: Método 3 (ADB Terminal)**
- Se nenhum dos anteriores funcionar
- Mais técnico
- Salva em arquivo de texto

---

## ❓ PROBLEMAS COMUNS

### "Dispositivo não aparece no chrome://inspect"
✅ Verifique se app está **aberto** no celular  
✅ Verifique se depuração USB está **ativada**  
✅ Desconecte e reconecte o cabo USB  
✅ Tente outro cabo USB  
✅ Reinicie o celular  

### "Appear empty" ou página em branco no DevTools
✅ Feche e abra o app no celular  
✅ Clique em "reload" no DevTools  
✅ Verifique se o celular não está bloqueado  

### "Unauthorized" ou "device unauthorized"
✅ No celular, vai aparecer popup "Permitir depuração USB?"  
✅ Clique em "OK" e marque "Sempre permitir"  

---

## 🚀 PRÓXIMOS PASSOS

1. **Escolha o Método 1 (Chrome Inspect)** - é o mais fácil!
2. Siga o passo a passo
3. Tire uma foto no app
4. **Copie TODOS os logs** que aparecerem no console
5. Cole aqui no chat

**Os logs vão revelar exatamente onde está o problema!** 🔍

---

## 💡 DICA PRO

Depois que conectar o Chrome Inspect, você pode:
- ✅ Ver logs em tempo real
- ✅ Ver erros JavaScript
- ✅ Inspecionar elementos HTML
- ✅ Ver requisições de rede (aba Network)
- ✅ Debugar código com breakpoints!

É como se estivesse desenvolvendo no PC, mas vendo o app do celular! 🎯
