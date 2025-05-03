
import { createClient } from '@supabase/supabase-js';

// Set your Supabase URL and ANON key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';

// Check if environment variables are set
console.log('Supabase URL:', supabaseUrl);
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.log('Using default Supabase configuration values');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Guide for customizing Supabase email templates:
/*
Para personalizar os templates de email do Supabase, siga os passos abaixo:

1. Acesse o Dashboard do Supabase: https://app.supabase.com 
2. Selecione seu projeto
3. Navegue até Authentication > Email Templates
4. Personalize os seguintes templates:
   - Confirmation: email de confirmação de cadastro
   - Invite: email de convite
   - Magic Link: email com link mágico para login
   - Change Email: email para confirmar mudança de email
   - Reset Password: email para redefinição de senha

Exemplos de personalização para Reset Password:

ASSUNTO:
"Sprout - Redefinição de Senha Solicitada"

CONTEÚDO:
<h2>Olá!</h2>

<p>Recebemos uma solicitação para redefinir sua senha no aplicativo Sprout.</p>

<p>Clique no botão abaixo para criar uma nova senha:</p>

<p><a href="{{ .ConfirmationURL }}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Redefinir Minha Senha</a></p>

<p>Se você não solicitou esta mudança, pode ignorar este email com segurança.</p>

<p>Atenciosamente,<br>Equipe Sprout</p>

<hr style="border: 1px solid #eaeaea; margin: 30px 0;" />

<p style="font-size: 12px; color: #666;">Este link expira em 24 horas.</p>

-------

Para o Email de Confirmação de Conta:

ASSUNTO:
"Boas-vindas ao Sprout - Confirme sua conta"

CONTEÚDO:
<h2>Bem-vindo(a) ao Sprout! 🌱</h2>

<p>Estamos muito felizes em ter você conosco! Só falta um passo para começar sua jornada de organização financeira.</p>

<p>Clique no botão abaixo para confirmar seu email e ativar sua conta:</p>

<p><a href="{{ .ConfirmationURL }}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Confirmar Minha Conta</a></p>

<p>Com o Sprout, você poderá:</p>
<ul>
  <li>Acompanhar suas finanças em tempo real</li>
  <li>Criar orçamentos personalizados</li>
  <li>Receber alertas sobre contas a pagar</li>
  <li>Visualizar relatórios detalhados sobre seus gastos</li>
</ul>

<p>Estamos ansiosos para ajudá-lo(a) a alcançar seus objetivos financeiros!</p>

<p>Atenciosamente,<br>Equipe Sprout</p>

<hr style="border: 1px solid #eaeaea; margin: 30px 0;" />

<p style="font-size: 12px; color: #666;">Este link expira em 24 horas. Se precisar de um novo link, visite nossa página de login.</p>
*/

export const supabaseAdmin = supabase;
