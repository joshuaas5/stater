
import { createClient } from '@supabase/supabase-js';

// Set your Supabase URL and ANON key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if environment variables are set
console.log('Supabase URL:', supabaseUrl);
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.log('Using default Supabase configuration values');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // ConfiguraÃƒÂ§ÃƒÂµes especÃƒÂ­ficas para mobile
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Alterado para PKCE para permitir retorno via code + troca segura no app
    flowType: 'pkce'
  }
});

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
