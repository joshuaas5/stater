# Stater Financial Assistant

**Assistente financeiro inteligente com IA integrada**

Este projeto Ã© uma aplicaÃ§Ã£o web moderna desenvolvida com React + TypeScript + Vite, focada em fornecer uma experiÃªncia completa de gestÃ£o financeira pessoal com integraÃ§Ã£o de inteligÃªncia artificial.

## ðŸš€ Build Status
- âœ… Vite v6.3.5 
- âœ… React 18.3.1
- âœ… TypeScript 5.5.3
- âœ… Vercel Deploy Ready

## VisÃ£o Geral das Tecnologias

O projeto Stater Ã© construÃ­do com:

-   **Frontend Framework**: [React](https://reactjs.org/) com [Vite](https://vitejs.dev/) para um desenvolvimento rÃ¡pido e eficiente.
-   **Linguagem**: [TypeScript](https://www.typescriptlang.org/) para tipagem estÃ¡tica e maior robustez do cÃ³digo.
-   **EstilizaÃ§Ã£o**: [Tailwind CSS](https://tailwindcss.com/) para classes utilitÃ¡rias e [Shadcn/UI](https://ui.shadcn.com/) para componentes de UI prÃ©-construÃ­dos e personalizÃ¡veis.
-   **Roteamento**: [React Router DOM](https://reactrouter.com/) para navegaÃ§Ã£o no lado do cliente.
-   **Gerenciamento de Estado de API**: [TanStack Query (React Query)](https://tanstack.com/query/latest) para data fetching, caching, e synchronization.
-   **Backend & Banco de Dados**: [Supabase](https://supabase.io/) (PostgreSQL) como Backend-as-a-Service (BaaS), incluindo autenticaÃ§Ã£o, banco de dados e APIs.
-   **Desenvolvimento Mobile**: [Capacitor](https://capacitorjs.com/) para empacotar a aplicaÃ§Ã£o web como um aplicativo nativo para iOS e Android.
-   **Linting**: ESLint para manter a qualidade e consistÃªncia do cÃ³digo.

## Estrutura do Projeto

Uma visÃ£o geral da estrutura de pastas do projeto:

-   `public/`: ContÃ©m arquivos estÃ¡ticos que sÃ£o servidos diretamente (ex: `index.html`, favicons).
-   `src/`: O coraÃ§Ã£o da aplicaÃ§Ã£o, contendo todo o cÃ³digo fonte TypeScript/React.
    -   `api/`: (Se aplicÃ¡vel, para funÃ§Ãµes serverless ou lÃ³gica de API especÃ­fica)
    -   `assets/`: Imagens, fontes e outros assets estÃ¡ticos importados pelos componentes.
    -   `components/`: Componentes React reutilizÃ¡veis.
        -   `ui/`: Componentes da biblioteca Shadcn/UI.
    -   `config/`: Arquivos de configuraÃ§Ã£o da aplicaÃ§Ã£o.
    -   `contexts/`: Contextos React para gerenciamento de estado global.
    -   `hooks/`: Hooks React customizados.
    -   `layouts/`: Componentes de layout de pÃ¡gina.
    -   `lib/`: FunÃ§Ãµes utilitÃ¡rias, configuraÃ§Ã£o de clientes de API (ex: Supabase client).
    -   `pages/` ou `views/`: Componentes que representam as diferentes pÃ¡ginas/rotas da aplicaÃ§Ã£o.
    -   `router/`: ConfiguraÃ§Ã£o das rotas da aplicaÃ§Ã£o.
    -   `services/`: LÃ³gica para interagir com APIs externas ou backend.
    -   `styles/`: Arquivos de estilo globais ou especÃ­ficos.
    -   `types/`: DefiniÃ§Ãµes de tipos TypeScript.
    -   `main.tsx`: Ponto de entrada principal da aplicaÃ§Ã£o React.
-   `supabase/`: ConfiguraÃ§Ãµes relacionadas ao Supabase, incluindo o schema do banco de dados (`supabase-schema.sql`).
-   `scripts/`: Scripts utilitÃ¡rios para o projeto.
-   `api/`: (No nÃ­vel raiz) Pode conter funÃ§Ãµes serverless para Vercel/Netlify.

Para uma descriÃ§Ã£o mais detalhada da arquitetura, consulte o arquivo `architecture.md`.

## PrÃ©-requisitos

-   [Node.js](https://nodejs.org/) (versÃ£o 18 ou superior recomendada)
-   [npm](https://www.npmjs.com/) (geralmente vem com o Node.js) ou [Bun](https://bun.sh/)
-   [Git](https://git-scm.com/)

## ConfiguraÃ§Ã£o e InstalaÃ§Ã£o

Siga estes passos para configurar o ambiente de desenvolvimento local:

1.  **Clone o repositÃ³rio:**
    ```bash
    git clone https://github.com/joshuaas5/ICTUS.git
    cd ICTUS
    ```

2.  **Instale as dependÃªncias:**
    O projeto pode usar `npm` ou `bun`. Verifique o `bun.lockb` para preferÃªncia por Bun.
    Usando npm:
    ```bash
    npm install
    ```
    Ou usando Bun:
    ```bash
    bun install
    ```

3.  **ConfiguraÃ§Ã£o de VariÃ¡veis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione as variÃ¡veis de ambiente necessÃ¡rias, especialmente as chaves da API do Supabase. Consulte o arquivo `.env.example` (se existir) ou a documentaÃ§Ã£o do Supabase para as variÃ¡veis requeridas.
    Exemplo de variÃ¡veis para Supabase:
    ```env
    VITE_SUPABASE_URL=SUA_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

## Scripts DisponÃ­veis

No diretÃ³rio do projeto, vocÃª pode executar os seguintes scripts (definidos em `package.json`):

-   `npm run dev` ou `bun run dev`:
    Inicia o servidor de desenvolvimento Vite com hot-reloading. A aplicaÃ§Ã£o estarÃ¡ acessÃ­vel em `http://localhost:8080` (ou a porta configurada em `vite.config.ts`).

-   `npm run build` ou `bun run build`:
    Compila a aplicaÃ§Ã£o para produÃ§Ã£o. Os arquivos otimizados sÃ£o gerados no diretÃ³rio `dist/` (ou `build/` conforme configuraÃ§Ã£o de deploy).

-   `npm run build:dev` ou `bun run build:dev`:
    Compila a aplicaÃ§Ã£o em modo de desenvolvimento.

-   `npm run lint` ou `bun run lint`:
    Executa o ESLint para verificar erros de linting e estilo no cÃ³digo.

-   `npm run preview` ou `bun run preview`:
    Inicia um servidor local para visualizar a build de produÃ§Ã£o.

## Desenvolvimento Mobile com Capacitor

Para desenvolver e testar a versÃ£o mobile:

1.  **Construa a aplicaÃ§Ã£o web:**
    ```bash
    npm run build
    ```

2.  **Sincronize com as plataformas nativas:**
    ```bash
    npx capacitor sync
    ```

3.  **Adicione as plataformas (se ainda nÃ£o adicionadas):**
    ```bash
    npx capacitor add ios
    npx capacitor add android
    ```

4.  **Abra no IDE nativo:**
    ```bash
    npx capacitor open ios
    npx capacitor open android
    ```
    Isso abrirÃ¡ o projeto no Xcode (para iOS) ou Android Studio (para Android), onde vocÃª pode construir e executar o aplicativo em emuladores ou dispositivos fÃ­sicos.

## Deploy

O projeto estÃ¡ configurado para deploy nas seguintes plataformas:

-   **Netlify**: Configurado atravÃ©s do `netlify.toml`. O comando de build Ã© `npm run build` e o diretÃ³rio de publicaÃ§Ã£o Ã© `dist/` (verifique a configuraÃ§Ã£o, pois `netlify.toml` menciona `build` mas Vite e Capacitor usam `dist`).
-   **Vercel**: Configurado atravÃ©s do `vercel.json`, principalmente para reescritas de URL.
-   **Lovable**: O projeto parece ter origem ou integraÃ§Ã£o com a plataforma Lovable (consulte `capacitor.config.ts` e o `README.md` original).

## ContribuiÃ§Ãµes

[Adicione aqui diretrizes para contribuiÃ§Ã£o, se aplicÃ¡vel, como padrÃµes de codificaÃ§Ã£o, processo de pull request, etc.]

## InformaÃ§Ãµes Adicionais

-   **URL do Projeto (Lovable)**: [https://lovable.dev/projects/c5c7eb29-8378-43cd-a374-c0aaea44ef12](https://lovable.dev/projects/c5c7eb29-8378-43cd-a374-c0aaea44ef12)
-   **RepositÃ³rio GitHub**: [https://github.com/joshuaas5/ICTUS](https://github.com/joshuaas5/ICTUS)

---

*Este README foi gerado e atualizado para refletir a estrutura e tecnologias do projeto ICTUS.*

