# Arquitetura do Projeto ICTUS

Este documento descreve a arquitetura técnica do projeto ICTUS, detalhando seus componentes, tecnologias e fluxos de dados.

## 1. Visão Geral

O ICTUS é uma aplicação web moderna com capacidade de ser empacotada como aplicativo móvel. Ele utiliza React para o frontend, Supabase como backend e banco de dados, e Capacitor para a funcionalidade móvel. A estilização é feita com Tailwind CSS e Shadcn/UI.

## 2. Tecnologias Principais

-   **Frontend**:
    -   **Framework**: React 18+
    -   **Build Tool**: Vite
    -   **Linguagem**: TypeScript
    -   **Roteamento**: React Router DOM v6
    -   **Gerenciamento de Estado de API**: TanStack Query (React Query) v5
    -   **UI Components**: Shadcn/UI, Lucide Icons
    -   **Estilização**: Tailwind CSS, PostCSS
    -   **Formulários**: React Hook Form com Zod para validação.
-   **Backend & Banco de Dados**:
    -   **Plataforma**: Supabase
    -   **Banco de Dados**: PostgreSQL
    -   **Autenticação**: Supabase Auth
    -   **APIs**: Supabase auto-gera APIs RESTful e GraphQL para o banco de dados.
    -   **Funções Serverless (Backend API)**: Localizadas na pasta `api/` (nível raiz), provavelmente para Vercel/Netlify. Inclui:
        -   `consultoria.js`
        -   `gemini.ts` (interação com API Gemini, rastreamento de uso via tabela `gemini_usage`)
        -   `get-news.js`
        -   `supabase-admin.ts` (operações administrativas no Supabase)
-   **Mobile**:
    -   **Framework**: Capacitor
    -   **Plataformas Suportadas**: iOS, Android
    -   **Plugins Nativos Usados**: SplashScreen, Local Notifications, Biometric Authentication (`capacitor-native-biometric`).
-   **Desenvolvimento e Qualidade**:
    -   **Linting**: ESLint
    -   **Formatação**: (Presumivelmente Prettier, embora não explicitamente configurado no `package.json` como script, é comum com ESLint)
-   **Deployment**:
    -   Netlify
    -   Vercel
    -   Lovable Platform

## 3. Estrutura de Diretórios Detalhada

-   `public/`: Arquivos estáticos públicos. `index.html` é o ponto de entrada HTML.
-   `src/`: Contém todo o código fonte da aplicação React.
    -   `main.tsx`: Ponto de entrada da aplicação React, onde o componente raiz (`App`) é renderizado.
    -   `App.tsx`: Componente raiz da aplicação, geralmente configura rotas, providers globais (Contexts) e layouts.
    -   `App.css`, `index.css`: Arquivos de estilo CSS globais.
    -   `components/`: Diretório para componentes React reutilizáveis.
        -   `ui/`: Componentes da biblioteca Shadcn/UI (gerados via CLI `shadcn-ui`).
        -   Pode conter subdiretórios para componentes `shared/common` ou agrupados por `feature`.
    -   `contexts/`: React Contexts para gerenciamento de estado global (ex: `ThemeContext`, `AuthContext`).
    -   `data/`: Pode conter dados mock, constantes ou configurações de dados estáticos.
    -   `hooks/`: Hooks React customizados para lógica reutilizável (ex: `useAuth`, `useSupabaseQuery`).
    -   `lib/`: Funções utilitárias, helpers, e inicialização de bibliotecas (ex: `supabaseClient.ts`, `utils.ts`, configuração do `axios` ou `fetch`).
    -   `pages/` (ou `views/`): Componentes de nível superior que representam cada rota/página da aplicação.
    -   `services/`: Módulos para interagir com a API do Supabase ou outras APIs externas. Encapsula a lógica de data fetching.
    -   `styles/`: Arquivos de estilo adicionais ou específicos de componentes, se não totalmente cobertos por Tailwind.
    -   `types/`: Definições de tipos e interfaces TypeScript globais ou compartilhadas.
    -   `utils/`: Funções utilitárias genéricas.
    -   `vite-env.d.ts`: Definições de tipos para variáveis de ambiente do Vite.
    -   `tailwind.config.js`: (Nota: Existe um `tailwind.config.ts` na raiz. Este arquivo dentro de `src/` pode ser um erro, um arquivo legado, ou para um contexto específico. O arquivo raiz é o principal para a configuração do Tailwind.)
-   `api/` (nível raiz): Contém as funções serverless.
    -   `consultoria.js`: Lógica de backend para consultoria.
    -   `gemini.ts`: Integração com a API Gemini do Google e lógica para rastrear o uso.
    -   `get-news.js`: Função para buscar notícias.
    -   `supabase-admin.ts`: Cliente Supabase com privilégios de administrador para operações de backend.
-   `supabase/`:
    -   `migrations/`: (Se usando Supabase CLI para migrações) Arquivos de migração SQL.
    -   `supabase-schema.sql`: Schema do banco de dados (como o `gemini_usage` já existente).
-   `scripts/`: Scripts de utilidade para o projeto (ex: `seed-db.ts`).

## 4. Arquitetura Frontend

-   **Modelo de Componentes**: A UI é construída usando uma arquitetura baseada em componentes React.
-   **Estilização**:
    -   Tailwind CSS é usado para estilização rápida e consistente através de classes utilitárias.
    -   Shadcn/UI fornece um conjunto de componentes acessíveis e personalizáveis que são copiados para o projeto e podem ser modificados.
    -   O `tailwind.config.ts` (na raiz do projeto) define o tema, incluindo cores (com um tema "Galileo Design"), fontes (`Plus Jakarta Sans`, `Noto Sans`) e animações.
-   **Gerenciamento de Estado**:
    -   **Estado Local**: Gerenciado por componentes React (`useState`, `useReducer`).
    -   **Estado de API/Servidor**: TanStack Query (React Query) é usado para buscar, cachear, sincronizar e atualizar dados do servidor (Supabase e as funções da pasta `api/`). Isso simplifica o tratamento de loading states, erros e otimismo de UI.
    -   **Estado Global**: React Context API (no diretório `src/contexts/`) é usado para estados globais como tema, informações do usuário autenticado, etc.
-   **Roteamento**: React Router DOM gerencia a navegação no lado do cliente, permitindo uma experiência de SPA. A configuração de rotas provavelmente está em `App.tsx` ou um arquivo dedicado como `src/router.tsx`.
-   **Formulários**: React Hook Form é usado para gerenciamento eficiente de formulários, com Zod para validação de esquemas.

## 5. Arquitetura Backend

-   **Supabase (BaaS)**:
    -   **Banco de Dados**: Supabase utiliza PostgreSQL. O schema atual (`supabase-schema.sql`) inclui a tabela `gemini_usage`.
        ```sql
        -- Tabela para controle de uso da Gemini
        create table if not exists gemini_usage (
          id serial primary key,
          period_type text not null, -- 'month', 'week', 'day', 'hour'
          period_value text not null, -- ex: '2025-05', '2025-05-09', '2025-05-09-17'
          tokens integer not null default 0,
          requests integer not null default 0,
          updated_at timestamp with time zone default now(),
          unique(period_type, period_value)
        );
        ```
    -   **Autenticação**: Supabase Auth lida com o registro de usuários, login, gerenciamento de sessão e segurança baseada em roles (Row Level Security - RLS).
    -   **APIs Geradas**: Supabase fornece automaticamente APIs RESTful e GraphQL para interagir com o banco de dados. As políticas de RLS no PostgreSQL garantem que os usuários só possam acessar ou modificar os dados que lhes são permitidos.
    -   **Realtime (Opcional)**: Supabase suporta subscrições em tempo real para alterações no banco de dados.
    -   **Edge Functions (Opcional)**: Funções serverless do Supabase para lógica de backend customizada.
-   **Funções Serverless (pasta `api/`)**:
    -   São endpoints de API customizados, provavelmente hospedados em Vercel ou Netlify.
    -   `consultoria.js`: Provê serviços ou dados relacionados a consultoria.
    -   `gemini.ts`: Interage com a API externa Gemini, possivelmente realizando chamadas e atualizando a tabela `gemini_usage` no Supabase usando o `supabase-admin.ts`.
    -   `get-news.js`: Busca e retorna notícias de alguma fonte.
    -   `supabase-admin.ts`: Inicializa um cliente Supabase com a chave de serviço (role `service_role`), permitindo bypassar RLS para operações administrativas a partir do backend. **Esta chave nunca deve ser exposta no frontend.**

## 6. Arquitetura Mobile (Capacitor)

-   **Wrapper Nativo**: Capacitor pega a build da aplicação web (`dist/`) e a empacota em um WebView nativo para iOS e Android.
-   **Acesso a APIs Nativas**:
    -   Através de plugins do Capacitor, a aplicação web pode acessar funcionalidades nativas do dispositivo.
    -   Plugins configurados (`capacitor.config.ts`):
        -   `SplashScreen`: Para exibir uma tela de splash durante o carregamento inicial.
        -   `LocalNotifications`: Para agendar e exibir notificações locais.
        -   `BiometricAuth` (`capacitor-native-biometric`): Para autenticação biométrica.
-   **Configuração**: O arquivo `capacitor.config.ts` define o ID da app, nome, e configurações específicas de plugins e plataformas.
    -   `appId`: 'app.lovable.c5c7eb29837843cda374c0aaea44ef12'
    -   `appName`: 'sprout-spending-hub'
    -   `webDir`: 'dist'

## 7. Build e Deployment

-   **Build**:
    -   `vite build` (invocado por `npm run build`) compila o código TypeScript/React, otimiza os assets e gera os arquivos finais no diretório `dist/`.
    -   O `vite.config.ts` define aliases (`@` para `src/`) e outras configurações de build.
-   **Deployment**:
    -   **Netlify**: `netlify.toml` configura o processo de build (`npm run build`) e o diretório de publicação (`publish = "build"` - **Atenção**: isso deve ser `dist` para alinhar com Vite e Capacitor).
    -   **Vercel**: `vercel.json` inclui reescritas para suportar roteamento de SPA. As funções da pasta `api/` podem ser deployadas como Vercel Serverless Functions.
    -   **Lovable**: A URL no `capacitor.config.ts` (`https://c5c7eb29-8378-43cd-a374-c0aaea44ef12.lovableproject.com`) sugere deploy ou integração com esta plataforma.

## 8. Fluxo de Dados (Exemplo - Chamada à API Gemini)

1.  **Requisição do Frontend**:
    -   Um componente React (ex: `ChatInterface`) precisa fazer uma pergunta à API Gemini.
    -   Ele chama uma função (ex: `askGemini(prompt)`) de um serviço em `src/services/`.
    -   Esta função faz uma requisição HTTP (POST) para o endpoint `/api/gemini` (que é uma serverless function).
2.  **Processamento no Backend (Serverless Function `api/gemini.ts`)**:
    -   A função `api/gemini.ts` recebe o prompt.
    -   Ela pode primeiro verificar o uso na tabela `gemini_usage` usando `supabase-admin.ts` para garantir que os limites não foram excedidos.
    -   Se permitido, ela faz a chamada real para a API externa do Google Gemini.
    -   Após receber a resposta do Gemini, ela atualiza a contagem de tokens/requisições na tabela `gemini_usage` (novamente usando `supabase-admin.ts`).
    -   Retorna a resposta do Gemini para o frontend.
3.  **Renderização no Frontend**:
    -   O serviço no frontend recebe a resposta.
    -   TanStack Query (se usado para esta chamada) atualiza o estado.
    -   O componente React é re-renderizado para exibir a resposta.

## 9. Pontos de Atenção e Melhorias Potenciais

-   **Consistência do Diretório de Build**: Confirmar e corrigir o diretório de publicação (`publish`) no `netlify.toml` para `dist`.
-   **Arquivo `tailwind.config.js` em `src/`**: Investigar o propósito deste arquivo e se ele é necessário, dado que existe `tailwind.config.ts` na raiz. Pode ser um resquício e deve ser removido se não for usado.
-   **Testes**: Não há configuração explícita de testes. Adicionar testes unitários, de integração e E2E.
-   **Gerenciamento de Variáveis de Ambiente**: Assegurar que todas as chaves sensíveis (API keys do Supabase, API Key do Gemini) sejam gerenciadas através de variáveis de ambiente (`.env`) e não hardcoded, especialmente para as serverless functions.
-   **Segurança**:
    -   Revisar as políticas de RLS do Supabase.
    -   Garantir que a chave de `service_role` do Supabase usada em `supabase-admin.ts` nunca seja exposta ao cliente.
    -   Validar entradas em todas as serverless functions.
-   **Documentação de API**: Adicionar comentários ou documentação (ex: Swagger/OpenAPI para as funções em `api/`) para os endpoints customizados.

Este documento serve como um guia para entender a arquitetura do projeto ICTUS. Ele deve ser mantido atualizado à medida que o projeto evolui.
