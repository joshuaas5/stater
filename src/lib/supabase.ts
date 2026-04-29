
import { createClient } from '@supabase/supabase-js';

// Set your Supabase URL and ANON key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

type SupabaseClientInstance = ReturnType<typeof createClient>;

const supabaseConfigError = {
  name: 'SupabaseConfigurationError',
  message: 'Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
};

const missingResult = () => ({
  data: null,
  error: supabaseConfigError,
  count: null,
  status: 0,
  statusText: 'Supabase not configured',
});

const createMissingQuery = (): unknown => {
  const resolveMissing = () => Promise.resolve(missingResult());

  const query = new Proxy(function missingSupabaseQuery() {}, {
    get(_target, prop) {
      if (prop === 'then') {
        const promise = resolveMissing();
        return promise.then.bind(promise);
      }

      if (['single', 'maybeSingle', 'csv', 'geojson', 'explain'].includes(String(prop))) {
        return resolveMissing;
      }

      return () => query;
    },
  });

  return query;
};

const missingAuth = new Proxy({
  getSession: async () => ({ data: { session: null }, error: null }),
  getUser: async () => ({ data: { user: null }, error: null }),
  onAuthStateChange: () => ({
    data: {
      subscription: {
        unsubscribe: () => {},
      },
    },
  }),
  signOut: async () => ({ error: null }),
}, {
  get(target, prop, receiver) {
    if (prop in target) {
      return Reflect.get(target, prop, receiver);
    }

    return async () => missingResult();
  },
});

const missingSupabase = {
  auth: missingAuth,
  from: () => createMissingQuery(),
  rpc: () => createMissingQuery(),
  storage: {
    from: () => createMissingQuery(),
  },
} as unknown as SupabaseClientInstance;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

// Create Supabase client
export const supabase = isSupabaseConfigured
  ? createClient(
      supabaseUrl as string,
      supabaseAnonKey as string,
      {
        auth: {
          // Mobile-friendly auth session handling.
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          // PKCE supports code redirects with secure token exchange.
          flowType: 'pkce',
        },
      }
    )
  : missingSupabase;

// Guide for customizing Supabase email templates:
/*
Para personalizar os templates de email do Supabase, siga os passos abaixo:

1. Acesse o Dashboard do Supabase: https://app.supabase.com 
2. Selecione seu projeto
3. Navegue atÃƒÂ© Authentication > Email Templates
4. Personalize os seguintes templates:
   - Confirmation: email de confirmaÃƒÂ§ÃƒÂ£o de cadastro
   - Invite: email de convite
   - Magic Link: email com link mÃƒÂ¡gico para login
   - Change Email: email para confirmar mudanÃƒÂ§a de email
   - Reset Password: email para redefiniÃƒÂ§ÃƒÂ£o de senha

Exemplos de personalizaÃƒÂ§ÃƒÂ£o para Reset Password:

ASSUNTO:
"Sprout - RedefiniÃƒÂ§ÃƒÂ£o de Senha Solicitada"

CONTEÃƒÅ¡DO:
<h2>OlÃƒÂ¡!</h2>

<p>Recebemos uma solicitaÃƒÂ§ÃƒÂ£o para redefinir sua senha no aplicativo Sprout.</p>

<p>Clique no botÃƒÂ£o abaixo para criar uma nova senha:</p>

<p><a href="{{ .ConfirmationURL }}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Redefinir Minha Senha</a></p>

<p>Se vocÃƒÂª nÃƒÂ£o solicitou esta mudanÃƒÂ§a, pode ignorar este email com seguranÃƒÂ§a.</p>

<p>Atenciosamente,<br>Equipe Sprout</p>

<hr style="border: 1px solid #eaeaea; margin: 30px 0;" />

<p style="font-size: 12px; color: #666;">Este link expira em 24 horas.</p>

-------

Para o Email de ConfirmaÃƒÂ§ÃƒÂ£o de Conta:

ASSUNTO:
"Boas-vindas ao Sprout - Confirme sua conta"

CONTEÃƒÅ¡DO:
<h2>Bem-vindo(a) ao Sprout! Ã°Å¸Å’Â±</h2>

<p>Estamos muito felizes em ter vocÃƒÂª conosco! SÃƒÂ³ falta um passo para comeÃƒÂ§ar sua jornada de organizaÃƒÂ§ÃƒÂ£o financeira.</p>

<p>Clique no botÃƒÂ£o abaixo para confirmar seu email e ativar sua conta:</p>

<p><a href="{{ .ConfirmationURL }}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Confirmar Minha Conta</a></p>

<p>Com o Sprout, vocÃƒÂª poderÃƒÂ¡:</p>
<ul>
  <li>Acompanhar suas finanÃƒÂ§as em tempo real</li>
  <li>Criar orÃƒÂ§amentos personalizados</li>
  <li>Receber alertas sobre contas a pagar</li>
  <li>Visualizar relatÃƒÂ³rios detalhados sobre seus gastos</li>
</ul>

<p>Estamos ansiosos para ajudÃƒÂ¡-lo(a) a alcanÃƒÂ§ar seus objetivos financeiros!</p>

<p>Atenciosamente,<br>Equipe Sprout</p>

<hr style="border: 1px solid #eaeaea; margin: 30px 0;" />

<p style="font-size: 12px; color: #666;">Este link expira em 24 horas. Se precisar de um novo link, visite nossa pÃƒÂ¡gina de login.</p>
*/

export const supabaseAdmin = supabase;
