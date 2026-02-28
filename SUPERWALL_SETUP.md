# 🎯 CONFIGURAÇÃO SUPERWALL - STATER IA

## 📱 PRODUTOS PARA GOOGLE PLAY CONSOLE

### **1. PLANO SEMANAL**
```
Product ID: stater.weekly.premium
Nome: Stater Premium Semanal
Tipo: Assinatura (1 semana)
Preço: R$ 8,90
Teste grátis: 3 dias
Descrição: "Acesso completo por 1 semana - 100% livre de anúncios"
```

### **2. PLANO MENSAL** 
```
Product ID: stater.monthly.premium
Nome: Stater Premium Mensal
Tipo: Assinatura (1 mês)
Preço: R$ 15,90
Teste grátis: 7 dias
Descrição: "Plano mensal com análises avançadas e exportação de relatórios"
```

### **3. PLANO PRO**
```
Product ID: stater.pro.premium
Nome: Stater Pro
Tipo: Assinatura (1 mês)
Preço: R$ 29,90
Teste grátis: 7 dias
Descrição: "Plano completo com OCR de PDFs e insights avançados"
```

---

## 🎨 PAYWALLS PARA CONFIGURAR NO SUPERWALL

### **PAYWALL 1: "onboarding"**
- **Trigger:** Primeiro acesso ao app
- **Produtos:** Semanal (destaque), Mensal
- **Título:** "Bem-vindo ao Stater IA!"
- **Subtítulo:** "Seu assistente financeiro inteligente"
- **CTA:** "Começar Teste Grátis"

### **PAYWALL 2: "premium_features"**
- **Trigger:** Tentar usar funcionalidade premium
- **Produtos:** Mensal (destaque), Pro
- **Título:** "Recurso Premium"
- **Subtítulo:** "Desbloqueie análises avançadas"
- **CTA:** "Fazer Upgrade"

### **PAYWALL 3: "limit_reached"**
- **Trigger:** Atingir limite diário
- **Produtos:** Semanal (foco no teste grátis)
- **Título:** "Limite Atingido"
- **Subtítulo:** "Continue analisando sem limites"
- **CTA:** "Remover Limites"

---

## 🧪 COMO TESTAR OS PAYWALLS

### **MÉTODO 1: Teste Direto no App**
1. Instale o APK: `android\app\build\outputs\apk\debug\app-debug.apk`
2. Abra o app
3. Use o SuperwallImplementation component
4. Clique nos botões para trigger paywalls

### **MÉTODO 2: Via DevTools**
```javascript
// No browser console (se usando web)
window.Superwall?.presentPaywall('onboarding');
```

### **MÉTODO 3: Via Logs**
```bash
# Via Android Studio Logcat
adb logcat | grep -i superwall
```
