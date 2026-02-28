# 🚨 STRIPE EM ÁREA RESTRITA - COMO ATIVAR

**Problema:** Conta Stripe em modo restrito  
**Solução:** Completar ativação da conta

---

## ❓ O QUE É "ÁREA RESTRITA"?

Quando você cria uma conta Stripe, ela começa em **modo restrito**:

```
⚠️ Você está testando em uma área restrita.
   As alterações feitas aqui não afetam sua conta em modo de produção.
```

**Isso significa:**
- ✅ Você pode usar **modo de teste** normalmente
- ❌ Você **NÃO pode** receber pagamentos reais ainda
- ❌ Modo produção está **bloqueado**

---

## 🔓 COMO SAIR DO MODO RESTRITO

### **PASSO 1: Completar Informações da Conta**

#### 1. No Stripe Dashboard, procure no topo:
```
⚠️ Complete a ativação da conta
ou
⚠️ Ative sua conta para receber pagamentos
```

#### 2. Ou acesse diretamente:
```
https://dashboard.stripe.com/account/onboarding
```

### **PASSO 2: Informações Necessárias**

O Stripe vai pedir:

#### **1. Informações Pessoais:**
- Nome completo
- Data de nascimento
- CPF
- Endereço completo

#### **2. Informações Bancárias:**
- Banco
- Agência
- Número da conta (corrente ou poupança)
- Tipo de conta

#### **3. Informações do Negócio:**
- Tipo de negócio: **Individual** ou **Empresa**
- Descrição do que você vende: "Aplicativo de gestão financeira com planos de assinatura"
- URL do site: https://stater.app
- Categoria: Software as a Service (SaaS)

#### **4. Documentação (pode ser solicitada):**
- Foto do RG ou CNH
- Comprovante de endereço
- Comprovante bancário

---

## 📝 PASSO A PASSO VISUAL

### **1. Clique no Banner no Topo**
```
┌────────────────────────────────────────────┐
│ ⚠️ Complete sua conta para aceitar         │
│    pagamentos reais                        │
│    [Continuar ativação] ◀── CLIQUE AQUI    │
└────────────────────────────────────────────┘
```

### **2. OU vá no Menu Lateral:**
```
Configurações (Settings)
  └─ Detalhes da conta (Account details)
      └─ Ativar conta (Activate account)
```

### **3. Preencha todos os campos obrigatórios**

O Stripe tem um checklist tipo:
```
☐ Informações pessoais
☐ Informações bancárias  
☐ Detalhes do negócio
☐ Verificação de identidade
```

Vá completando cada seção!

---

## ⏱️ QUANTO TEMPO DEMORA?

### **Aprovação Instantânea (maioria dos casos):**
- Preenche tudo → Aprovação automática
- **Tempo: 5-10 minutos**

### **Análise Manual (casos específicos):**
- Stripe pode solicitar documentos adicionais
- **Tempo: 1-3 dias úteis**

---

## 🚀 ENQUANTO AGUARDA ATIVAÇÃO

### **VOCÊ PODE:**

#### ✅ 1. Continuar em modo TESTE
Suas keys de teste funcionam normalmente:
```
pk_test_51SIF7wFog1FXcH5v9uSLdcEArKlpzVSUEaCn2XjIoX3B98YL8y0q9kZxtZtMGhNaTz344ZLNB668nPtUG1Kk21H700Mq7mI5JP
```

#### ✅ 2. Lançar em BETA com modo teste
- Anuncie: "Beta gratuito temporário"
- Teste todo o fluxo com usuários reais
- Quando Stripe aprovar, ativa produção

#### ✅ 3. Usar cartões de teste
```
4242 4242 4242 4242
```

### **VOCÊ NÃO PODE (ainda):**
❌ Receber pagamentos reais  
❌ Usar modo produção  
❌ Fazer cobranças de verdade

---

## 💡 RECOMENDAÇÃO PARA VOCÊ

### **OPÇÃO 1: Ativar Stripe AGORA (Recomendado)**

**Se você tem:**
- ✅ CPF válido
- ✅ Conta bancária no seu nome
- ✅ Endereço fixo
- ✅ Documentos disponíveis

**Tempo:** 10 minutos para preencher + aprovação (geralmente instantânea)

**Vantagens:**
- Pode receber pagamentos HOJE
- Lança com Stripe 100% funcional

---

### **OPÇÃO 2: Lançar Beta com Modo Teste (Alternativa)**

**Se você:**
- ❌ Não tem todos os documentos agora
- ⏰ Quer lançar URGENTE
- 🧪 Prefere testar mais antes

**Como fazer:**
1. Lance o site HOJE em modo beta
2. Use modo TESTE do Stripe
3. Anuncie: "Beta gratuito - Funcionalidades premium liberadas temporariamente!"
4. Complete ativação Stripe nos próximos dias
5. Quando aprovar, ativa pagamentos de verdade

**Vantagens:**
- Lança AGORA
- Coleta feedback real
- Testa sistema completo
- Ativa pagamentos depois

---

## 📋 CHECKLIST: ATIVAR STRIPE PRODUÇÃO

### **Informações que você vai precisar:**

**Pessoais:**
- [ ] Nome completo
- [ ] CPF
- [ ] Data de nascimento
- [ ] Endereço completo (com CEP)
- [ ] Telefone

**Bancárias:**
- [ ] Nome do banco
- [ ] Agência (sem dígito)
- [ ] Conta (com dígito)
- [ ] Tipo: Corrente ou Poupança

**Negócio:**
- [ ] Tipo: Pessoa Física (MEI) ou Pessoa Jurídica
- [ ] Descrição: "Aplicativo SaaS de gestão financeira"
- [ ] URL: https://stater.app
- [ ] Categoria: Software/SaaS

**Documentos (se solicitados):**
- [ ] Foto do RG ou CNH (frente e verso)
- [ ] Comprovante de endereço (máx 3 meses)
- [ ] Comprovante bancário (extrato ou cartão)

---

## 🎯 DECISÃO: O QUE FAZER AGORA?

### **Minha recomendação:**

1. **Complete a ativação do Stripe AGORA** (10 min)
2. Enquanto aguarda aprovação (geralmente instantânea):
   - Configure Vercel
   - Teste tudo em modo teste
3. Assim que aprovar:
   - Pega as keys de produção
   - Atualiza env vars
   - LANÇA! 🚀

**OU**

1. **Lance HOJE em Beta com modo teste**
2. Complete Stripe nos próximos dias
3. Ativa pagamentos quando aprovar

---

## ❓ DÚVIDAS COMUNS

### **"Sou MEI, qual tipo de conta escolher?"**
- Escolha: **Pessoa Jurídica**
- CNPJ: Seu CNPJ MEI
- Razão Social: Seu nome MEI

### **"Não tenho empresa, sou pessoa física"**
- Escolha: **Pessoa Física**
- Use seus dados pessoais
- Stripe aceita normalmente!

### **"Minha conta foi aprovada, e agora?"**
- Acesse: https://dashboard.stripe.com/apikeys
- Você verá as keys de produção (pk_live_ e sk_live_)
- Siga o guia: `STRIPE_PRODUCAO_KEYS.md`

---

## 🚨 SE DER ERRO

### **"Stripe pediu documentos adicionais"**
- É normal para alguns casos
- Envie o que pedirem
- Aprovação em 1-3 dias

### **"Não consigo completar o cadastro"**
- Suporte Stripe: https://support.stripe.com/contact
- Chat ao vivo: Disponível no dashboard
- Email: support@stripe.com

---

## ✅ PRÓXIMOS PASSOS

**AGORA:**
1. Acesse: https://dashboard.stripe.com/account/onboarding
2. Complete todos os campos
3. Envie para aprovação

**DEPOIS:**
1. Aguarde email de confirmação
2. Acesse modo produção
3. Pegue as keys
4. Configure no Vercel/Supabase
5. LANCE! 🚀

---

**PRECISA DE AJUDA PARA PREENCHER?** Me avisa! 💪
