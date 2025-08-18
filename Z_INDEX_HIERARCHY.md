# 🎯 Hierarquia de Z-Index - Stater App

## 📋 **HIERARQUIA CORRETA IMPLEMENTADA**

### **Ordem de Camadas (do menor para o maior z-index)**

| **Componente** | **Z-Index** | **Descrição** |
|----------------|-------------|---------------|
| **Conteúdo Base** | `z-10` | Conteúdo principal das páginas |
| **AdBanner** | `z-30` | Banner de anúncios fixo no rodapé |
| **NavBar** | `z-40` | Barra de navegação inferior |
| **Dialog Overlay** | `z-[2147483647]` | Fundo escuro dos modais |
| **Dialog Content** | `z-[2147483648]` | Conteúdo dos modais gerais |
| **PaywallModal** | `z-[2147483648]` | Modal de paywall |
| **StaterPaywall** | `z-[2147483649]` | Paywall específico Stater |
| **TelegramModal** | `z-[2147483649]` | Modal do Telegram |
| **Toast Notifications** | `z-[2147483650]` | Notificações sempre no topo |

---

## ✅ **PROBLEMA RESOLVIDO**

**Antes**: Banner de anúncio aparecia sobre os modais, cortando a interface.

**Depois**: Hierarquia correta onde:
- Banner fica **abaixo** dos modais (`z-30` < `z-[2147483647]`)
- Modais aparecem **completamente visíveis**
- Toasts ficam **sempre no topo**

---

## 🛠️ **ARQUIVOS MODIFICADOS**

### **1. Dialog Component** (`src/components/ui/dialog.tsx`)
```tsx
// Overlay: z-[2147483647] - Fundo escuro do modal
// Content: z-[2147483648] - Conteúdo do modal
```

### **2. AdBanner** (`src/components/monetization/AdBanner.tsx`)
```tsx
// AdBanner: z-30 - Abaixo dos modais
```

### **3. StaterPaywall** (`src/components/ui/StaterPaywall.tsx`)
```tsx
// StaterPaywall: z-[2147483649] - Acima dos modais gerais
```

### **4. PaywallModal** (`src/components/ui/PaywallModal.tsx`)
```tsx
// PaywallModal: z-[2147483648] - Nivel de modal padrão
```

### **5. CSS Global** (`src/index.css`)
```css
/* NavBar: z-40 - Abaixo dos modais */
/* Toasts: z-[2147483650] - Sempre no topo */
```

### **6. CSS Fixes** (`src/styles/paywall-fixes.css`)
```css
/* Hierarquia completa documentada */
```

---

## 🧪 **COMO TESTAR**

1. **Abrir qualquer modal** (ex: "Adicionar Nova Entrada")
2. **Verificar** que o banner de anúncio não corta o modal
3. **Confirmar** que o modal aparece completamente visível
4. **Testar** que os toasts aparecem acima de tudo

---

## 📐 **REGRAS DE Z-INDEX**

### **Para Novos Componentes:**

- **Conteúdo normal**: Use `z-10` ou menor
- **Elementos fixos**: Use `z-20` a `z-30`  
- **Modais gerais**: Use `z-[2147483647]` (overlay) e `z-[2147483648]` (content)
- **Modais críticos**: Use `z-[2147483649]`
- **Notificações**: Use `z-[2147483650]`

### **⚠️ NUNCA:**
- Usar z-index maiores que `2147483650`
- Quebrar a hierarquia estabelecida
- Usar valores aleatórios

---

## ✅ **RESULTADO FINAL**

🎯 **Interface estável e previsível**
🔧 **Modais sempre visíveis**
📱 **Experiência de usuário aprimorada**
🚀 **Sem conflitos de sobreposição**

---

*Última atualização: 18 de Agosto de 2025*
