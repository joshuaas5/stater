# Stater Project

**[Nota: Adicione aqui uma breve descrição do que é o projeto Stater e seus principais objetivos.]**

Este projeto foi desenvolvido utilizando uma stack moderna de tecnologias web e mobile, com foco em fornecer [descrever o propósito principal, ex: uma rica experiência de usuário, uma plataforma de gerenciamento, etc.].

## Visão Geral das Tecnologias

O projeto Stater é construído com:

-   **Frontend Framework**: [React](https://reactjs.org/) com [Vite](https://vitejs.dev/) para um desenvolvimento rápido e eficiente.
-   **Linguagem**: [TypeScript](https://www.typescriptlang.org/) para tipagem estática e maior robustez do código.
-   **Estilização**: [Tailwind CSS](https://tailwindcss.com/) para classes utilitárias e [Shadcn/UI](https://ui.shadcn.com/) para componentes de UI pré-construídos e personalizáveis.
-   **Roteamento**: [React Router DOM](https://reactrouter.com/) para navegação no lado do cliente.
-   **Gerenciamento de Estado de API**: [TanStack Query (React Query)](https://tanstack.com/query/latest) para data fetching, caching, e synchronization.
-   **Backend & Banco de Dados**: [Supabase](https://supabase.io/) (PostgreSQL) como Backend-as-a-Service (BaaS), incluindo autenticação, banco de dados e APIs.
-   **Desenvolvimento Mobile**: [Capacitor](https://capacitorjs.com/) para empacotar a aplicação web como um aplicativo nativo para iOS e Android.
-   **Linting**: ESLint para manter a qualidade e consistência do código.

## Estrutura do Projeto

Uma visão geral da estrutura de pastas do projeto:

-   `public/`: Contém arquivos estáticos que são servidos diretamente (ex: `index.html`, favicons).
-   `src/`: O coração da aplicação, contendo todo o código fonte TypeScript/React.
    -   `api/`: (Se aplicável, para funções serverless ou lógica de API específica)
    -   `assets/`: Imagens, fontes e outros assets estáticos importados pelos componentes.
    -   `components/`: Componentes React reutilizáveis.
        -   `ui/`: Componentes da biblioteca Shadcn/UI.
    -   `config/`: Arquivos de configuração da aplicação.
    -   `contexts/`: Contextos React para gerenciamento de estado global.
    -   `hooks/`: Hooks React customizados.
    -   `layouts/`: Componentes de layout de página.
    -   `lib/`: Funções utilitárias, configuração de clientes de API (ex: Supabase client).
    -   `pages/` ou `views/`: Componentes que representam as diferentes páginas/rotas da aplicação.
    -   `router/`: Configuração das rotas da aplicação.
    -   `services/`: Lógica para interagir com APIs externas ou backend.
    -   `styles/`: Arquivos de estilo globais ou específicos.
    -   `types/`: Definições de tipos TypeScript.
    -   `main.tsx`: Ponto de entrada principal da aplicação React.
-   `supabase/`: Configurações relacionadas ao Supabase, incluindo o schema do banco de dados (`supabase-schema.sql`).
-   `scripts/`: Scripts utilitários para o projeto.
-   `api/`: (No nível raiz) Pode conter funções serverless para Vercel/Netlify.

Para uma descrição mais detalhada da arquitetura, consulte o arquivo `architecture.md`.

## Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
-   [npm](https://www.npmjs.com/) (geralmente vem com o Node.js) ou [Bun](https://bun.sh/)
-   [Git](https://git-scm.com/)

## Configuração e Instalação

Siga estes passos para configurar o ambiente de desenvolvimento local:

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/joshuaas5/ICTUS.git
    cd ICTUS
    ```

2.  **Instale as dependências:**
    O projeto pode usar `npm` ou `bun`. Verifique o `bun.lockb` para preferência por Bun.
    Usando npm:
    ```bash
    npm install
    ```
    Ou usando Bun:
    ```bash
    bun install
    ```

3.  **Configuração de Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione as variáveis de ambiente necessárias, especialmente as chaves da API do Supabase. Consulte o arquivo `.env.example` (se existir) ou a documentação do Supabase para as variáveis requeridas.
    Exemplo de variáveis para Supabase:
    ```env
    VITE_SUPABASE_URL=SUA_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=SUA_SUPABASE_ANON_KEY
    ```

## Scripts Disponíveis

No diretório do projeto, você pode executar os seguintes scripts (definidos em `package.json`):

-   `npm run dev` ou `bun run dev`:
    Inicia o servidor de desenvolvimento Vite com hot-reloading. A aplicação estará acessível em `http://localhost:8080` (ou a porta configurada em `vite.config.ts`).

-   `npm run build` ou `bun run build`:
    Compila a aplicação para produção. Os arquivos otimizados são gerados no diretório `dist/` (ou `build/` conforme configuração de deploy).

-   `npm run build:dev` ou `bun run build:dev`:
    Compila a aplicação em modo de desenvolvimento.

-   `npm run lint` ou `bun run lint`:
    Executa o ESLint para verificar erros de linting e estilo no código.

-   `npm run preview` ou `bun run preview`:
    Inicia um servidor local para visualizar a build de produção.

## Desenvolvimento Mobile com Capacitor

Para desenvolver e testar a versão mobile:

1.  **Construa a aplicação web:**
    ```bash
    npm run build
    ```

2.  **Sincronize com as plataformas nativas:**
    ```bash
    npx capacitor sync
    ```

3.  **Adicione as plataformas (se ainda não adicionadas):**
    ```bash
    npx capacitor add ios
    npx capacitor add android
    ```

4.  **Abra no IDE nativo:**
    ```bash
    npx capacitor open ios
    npx capacitor open android
    ```
    Isso abrirá o projeto no Xcode (para iOS) ou Android Studio (para Android), onde você pode construir e executar o aplicativo em emuladores ou dispositivos físicos.

## Deploy

O projeto está configurado para deploy nas seguintes plataformas:

-   **Netlify**: Configurado através do `netlify.toml`. O comando de build é `npm run build` e o diretório de publicação é `dist/` (verifique a configuração, pois `netlify.toml` menciona `build` mas Vite e Capacitor usam `dist`).
-   **Vercel**: Configurado através do `vercel.json`, principalmente para reescritas de URL.
-   **Lovable**: O projeto parece ter origem ou integração com a plataforma Lovable (consulte `capacitor.config.ts` e o `README.md` original).

## Contribuições

[Adicione aqui diretrizes para contribuição, se aplicável, como padrões de codificação, processo de pull request, etc.]

## Informações Adicionais

-   **URL do Projeto (Lovable)**: [https://lovable.dev/projects/c5c7eb29-8378-43cd-a374-c0aaea44ef12](https://lovable.dev/projects/c5c7eb29-8378-43cd-a374-c0aaea44ef12)
-   **Repositório GitHub**: [https://github.com/joshuaas5/ICTUS](https://github.com/joshuaas5/ICTUS)

---

*Este README foi gerado e atualizado para refletir a estrutura e tecnologias do projeto ICTUS.*
