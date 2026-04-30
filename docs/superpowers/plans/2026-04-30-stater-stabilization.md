# Stater Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Stater preview usable enough to validate auth, AI, Telegram, checkout, public pages, and core finance flows before promoting anything to production.

**Architecture:** Keep production untouched and work only on `dev-preview`. Fix blockers first, then user-facing flows, then security/dependency hygiene. Avoid redesigns and broad rewrites unless a broken flow requires it.

**Tech Stack:** Vite, React, TypeScript, Supabase, Vercel Serverless Functions, Gemini API, Stripe, Telegram Bot API, ESLint, npm audit, Playwright.

---

## Problem Map

- Production blank screen: `https://stater-rose.vercel.app/` throws `supabaseUrl is required`; fixed only on `dev-preview` so far.
- Preview auth not active: Vercel preview renders, but Supabase env vars are not configured, so login/cadastro intentionally show "Autenticacao nao configurada".
- Server env contract was unsafe: Gemini was previously reachable through `VITE_GEMINI_API_KEY`; fixed on `dev-preview` in commit `de46c0c0`.
- Lint has hard parse blockers:
  - `api/telegram/webhook.js:1200` duplicate `handleQuickTransaction`.
  - `src/components/StripeCheckout.tsx:146` extra closing `</Button>`.
  - backup/old files are included in lint despite not being production source.
  - `src/components/financial-advisor/HotContent.tsx:9` syntax parse failure.
  - `src/plugins/superwall-professional.ts:1324` missing closing brace.
- Build passes but warns:
  - CSS minifier sees invalid tokens `-03: BRT`, `-3: BRT`, `-: T.Z`.
  - `duration-[8000ms]` Tailwind class is ambiguous.
  - `src/utils/localStorage.ts` is both static and dynamic imported.
  - `ExportReportPage` chunk is about 693 kB.
- Dependency audit: 38 vulnerabilities reported by `npm audit --audit-level=moderate`, including 2 critical and 19 high.
- Default GitHub branch reports 100 vulnerabilities.

---

## Phase 1: Environment And Auth Activation

**Files:**
- Verify: `.env.example`
- Verify: `src/lib/supabase.ts`
- Verify: `src/pages/Login.tsx`
- Configure outside git: Vercel project `stater`, Preview env for `dev-preview`

- [ ] **Step 1: Add Preview env vars in Vercel**

Set these for Preview first, preferably scoped to branch `dev-preview` when using the dashboard:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
APP_URL=https://stater-git-dev-preview-joshuaas500-gmailcoms-projects.vercel.app
```

Do not add `VITE_GEMINI_API_KEY`.

- [ ] **Step 2: Redeploy preview**

Run:

```powershell
git commit --allow-empty -m "chore: refresh preview env"
git push origin dev-preview
```

Expected: Vercel creates a new `dev-preview` deployment and it reaches `READY`.

- [ ] **Step 3: Verify public pages still render**

Run the existing Playwright route crawl against the share URL:

```powershell
$env:NODE_PATH='C:\Users\Editora Vélos\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
@'
const { chromium } = require('playwright');
const origin = 'https://stater-git-dev-preview-joshuaas500-gmailcoms-projects.vercel.app';
const routes = ['/', '/login', '/ferramentas', '/blog', '/terms', '/privacy'];
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  for (const route of routes) {
    const events = [];
    page.on('pageerror', err => events.push(err.message));
    await page.goto(origin + route, { waitUntil: 'networkidle', timeout: 45000 });
    const body = (await page.locator('body').innerText()).trim();
    console.log(route, body.length, events);
  }
  await browser.close();
})();
'@ | & 'C:\Users\Editora Vélos\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' -
```

Expected: each public route has non-zero body text and no `supabaseUrl is required`.

- [ ] **Step 4: Verify auth UI changes state**

Manual check:

1. Open `/login` on preview.
2. Try login with a known test user.
3. Expected: if credentials are valid, user reaches `/dashboard`; if invalid, message is credential-related, not "Autenticacao nao configurada".

- [ ] **Step 5: Commit**

Only commit code if verification finds a code issue. Env changes live in Vercel and must not be committed.

---

## Phase 2: Parse Errors And Lint Scope

**Files:**
- Modify: `src/components/StripeCheckout.tsx`
- Modify: `api/telegram/webhook.js`
- Modify: `eslint.config.js`
- Inspect: `src/components/financial-advisor/HotContent.tsx`
- Inspect: `src/plugins/superwall-professional.ts`

- [ ] **Step 1: Fix Stripe JSX parse blocker**

Remove the extra closing `</Button>` immediately after the checkout button in `src/components/StripeCheckout.tsx`.

Expected local diff:

```diff
-        </Button>
         </Button>
+        </Button>
```

Run:

```powershell
npm run type-check
npm run build
```

Expected: both pass.

- [ ] **Step 2: Fix or isolate Telegram duplicate handler**

Open duplicate declarations:

```powershell
Select-String -Path api\telegram\webhook.js -Pattern "function handleQuickTransaction|const handleQuickTransaction|async function handleQuickTransaction"
```

Expected: two declarations. Keep the active one used by the webhook and remove or rename the dead duplicate.

Run:

```powershell
npm run lint -- --quiet
```

Expected: no parse error for `api/telegram/webhook.js`.

- [ ] **Step 3: Exclude backup files from lint**

Modify `eslint.config.js` ignores to include generated/backup files that are not active source:

```ts
{
  ignores: [
    "dist",
    "**/*.backup.*",
    "**/*backup*",
    "**/*_backup.*",
    "**/*-old.*",
    "**/*Old.*",
    "vite-solution/**"
  ]
}
```

Run:

```powershell
npm run lint
```

Expected: lint count drops substantially without touching production code.

- [ ] **Step 4: Triage active parse errors**

For active files still failing parse, fix syntax only:

```powershell
npm run lint 2>&1 | Select-String -Pattern "Parsing error" -Context 1,1
```

Expected: zero parsing errors. Do not chase all style/type lint issues yet.

- [ ] **Step 5: Commit**

```powershell
git add src/components/StripeCheckout.tsx api/telegram/webhook.js eslint.config.js
git commit -m "fix: clear lint parse blockers"
git push origin dev-preview
```

---

## Phase 3: Core Paid Flow And Backend APIs

**Files:**
- Inspect/modify: `src/components/StripeCheckout.tsx`
- Inspect/modify: `src/components/PremiumModal.tsx`
- Inspect/modify: `src/components/ui/PaywallModal.tsx`
- Inspect/modify: `supabase/functions/create-checkout/index.ts`
- Inspect/modify: `supabase/functions/stripe-webhook/index.ts`
- Inspect/modify: `api/gemini.ts`
- Inspect/modify: `api/gemini-ocr.ts`

- [ ] **Step 1: Verify checkout entry points**

Search all checkout calls:

```powershell
git grep -n "create-checkout\|stripe\|checkout" -- src api supabase
```

Expected: one clear checkout flow for web users. Duplicates are documented before edits.

- [ ] **Step 2: Test unauthenticated checkout behavior**

Open preview logged out, click upgrade/pro checkout button.

Expected: user is redirected to login or shown a clear login-required message. No blank screen.

- [ ] **Step 3: Test authenticated checkout behavior**

With a Supabase test user, click upgrade/pro checkout button.

Expected: backend returns a Stripe Checkout URL, browser redirects to Stripe test mode or shows a clear configured error.

- [ ] **Step 4: Verify Gemini backend**

With a logged-in test user, send a basic prompt in `/financial-advisor`.

Expected: browser requests `/api/gemini`, not `generativelanguage.googleapis.com`, and receives a useful response.

- [ ] **Step 5: Commit only required fixes**

```powershell
git status --short
npm run type-check
npm run build
git add <changed-files>
git commit -m "fix: stabilize paid and ai flows"
git push origin dev-preview
```

---

## Phase 4: Public Conversion And SEO Sanity

**Files:**
- Inspect/modify: `src/pages/HomePage.tsx`
- Inspect/modify: `src/pages/public/ToolsHub.tsx`
- Inspect/modify: `src/pages/public/blog/*.tsx`
- Inspect/modify: `src/pages/public/tools/*.tsx`

- [ ] **Step 1: Crawl public pages**

Run Playwright on:

```txt
/
/ferramentas
/ferramentas/calculadora-juros-compostos
/blog
/blog/como-sair-das-dividas
/terms
/privacy
```

Expected: no page errors, titles are meaningful, CTA links go to `/login` or correct public pages.

- [ ] **Step 2: Fix broken links only**

Use:

```powershell
git grep -n "href=\\|to=" -- src/pages src/components
```

Expected: no dead internal routes in primary CTAs.

- [ ] **Step 3: Commit**

```powershell
git add src/pages src/components
git commit -m "fix: stabilize public conversion routes"
git push origin dev-preview
```

---

## Phase 5: Security And Dependency Hygiene

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Verify: GitHub Dependabot alerts

- [ ] **Step 1: Capture current audit**

Run:

```powershell
npm audit --audit-level=moderate
```

Expected: current baseline includes 38 vulnerabilities.

- [ ] **Step 2: Apply non-breaking fixes first**

Run:

```powershell
npm audit fix
npm run type-check
npm run build
```

Expected: vulnerabilities decrease and build still passes.

- [ ] **Step 3: Review breaking fixes separately**

Run:

```powershell
npm audit fix --dry-run --force
```

Expected: list any major upgrades, especially `uuid`, `@vercel/node`, or build tooling. Do not apply `--force` without a separate commit and browser verification.

- [ ] **Step 4: Commit**

```powershell
git add package.json package-lock.json
git commit -m "chore: reduce dependency vulnerabilities"
git push origin dev-preview
```

---

## Promotion Gate

Do not merge or promote to production until all are true:

- `npm run type-check` passes.
- `npm run build` passes.
- Public preview route crawl passes.
- Login with Supabase test user works.
- `/financial-advisor` calls `/api/gemini`, not Gemini directly from browser.
- Checkout behavior is verified at least through Stripe test redirect or a clear configured backend error.
- No lint parsing errors remain.
- Production env vars are prepared but not applied until preview is accepted.

