# ICTUS - Instruções de Desenvolvimento

## 🚨 REGRAS CRÍTICAS - NUNCA ESQUECER

### 📡 **Limitações do Vercel Free**
- **MÁXIMO 12 APIs**: Vercel Free tem limite de 12 funções serverless
- **Verificar sempre**: Antes de criar nova API, contar quantas já existem
- **Otimizar**: Combinar múltiplas funcionalidades em uma única API quando possível
- **Monitorar**: Dashboard do Vercel para acompanhar uso

### 🔄 **Git Workflow - ANTI LOOP INFINITO**
```bash
# SEMPRE fazer nesta sequência após commit:
git add .
git commit -m "sua mensagem"
git push origin main  # OBRIGATÓRIO - evita loop infinito
```

### 🎨 **Padrões Visuais**
- **Fundo padrão**: `linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)`
- **Sempre azul**: Todas as páginas devem seguir o mesmo tom de azul
- **CSS inline**: Usar `!important` quando necessário para forçar estilos

### 💾 **Persistência de Dados**
- **Chat**: Sempre salvar no localStorage com chave específica por usuário
- **Transações**: Forçar reload do dashboard após qualquer mudança
- **Estados**: Usar useEffect duplo para garantia de persistência
- **Onboarding**: OBRIGATÓRIO usar Supabase para persistência global (não localStorage)

### 👋 **Onboarding - PERSISTÊNCIA GLOBAL**
- **Tabela**: `user_onboarding` no Supabase para controle global
- **Migração**: Execute `migrate-onboarding-supabase.sql` no Supabase Dashboard
- **Hook**: `useOnboarding` usa Supabase para verificar status
- **Regra**: Onboarding aparece APENAS na primeira vez que usuário loga NA VIDA
- **Não depende**: localStorage, navegador, dispositivo ou sessão
- **Teste**: Use `test-onboarding-supabase.js` para validar funcionamento

### 🔧 **Debugging**
- **Console logs**: Sempre adicionar logs detalhados para troubleshooting
- **Estados**: Loggar mudanças de estado importantes
- **Erros**: Capturar e loggar todos os erros possíveis

### ⚡ **Performance**
- **Loading states**: Sempre mostrar feedback visual durante operações
- **Debounce**: Aplicar em inputs de busca e filtros
- **Memoização**: Usar React.memo em componentes pesados

### 🔐 **Segurança**
- **Validação**: Sempre validar dados antes de salvar
- **Sanitização**: Limpar inputs de usuário
- **Tipos**: Manter TypeScript strict

## 📂 **Estrutura do Projeto**
```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas principais
├── hooks/              # Custom hooks
├── utils/              # Utilitários
├── types/              # Tipos TypeScript
└── api/                # Funções serverless (MAX 12!)
```

## 🚀 **Deploy**
- **Vercel**: Deploy automático no push para main
- **Variáveis**: Configurar no dashboard do Vercel
- **Domínio**: Configurado e funcionando

## � **Setup Inicial - Migração de Onboarding**

### 1. **Executar Migração no Supabase**
```sql
-- No Supabase Dashboard > SQL Editor, execute:
-- Copie e cole todo o conteúdo de migrate-onboarding-supabase.sql
```

### 2. **Testar a Migração**
```bash
# No terminal do projeto:
node test-onboarding-supabase.js
```

### 3. **Verificar Funcionamento**
```bash
# Build e teste local:
npm run build
npm run preview
```

## �🐛 **Troubleshooting Comum**
1. **Chat não persiste**: Verificar localStorage e useEffect
2. **Fundo branco**: Aplicar CSS inline com !important
3. **Loading não aparece**: Verificar estados e condicionais
4. **Onboarding sempre aparece**: Verificar se migração foi executada no Supabase
5. **Erro de tabela user_onboarding**: Execute migrate-onboarding-supabase.sql
4. **Deploy falha**: Verificar limite de APIs (máx 12)
5. **IA confunde consulta com registro**: Verificar prompt e detecção de intenções

## 📝 **Notas de Desenvolvimento**
- Sempre seguir as regras acima
- Quando adicionar algo na memória, atualizar este arquivo
- Manter documentação sempre atualizada
- IA não deve processar JSON para consultas de saldo/resumo
