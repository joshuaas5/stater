// Script para agendar o envio de emails semanais
// Este script pode ser executado como uma tarefa agendada no servidor

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Configurações do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sua-url-do-supabase.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sua-chave-de-serviço';

// URL da função Edge
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/send-weekly-summary`;

// Cliente Supabase com chave de serviço para acesso administrativo
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function scheduleWeeklyEmails() {
  try {
    console.log('Iniciando agendamento de emails semanais...');
    
    // Buscar usuários que optaram por receber emails semanais
    const { data: userPreferences, error: prefsError } = await supabase
      .from('user_preferences')
      .select('user_id, notifications_weekly_email, notifications_email')
      .eq('notifications_weekly_email', true)
      .eq('notifications_email', true);
    
    if (prefsError) {
      console.error('Erro ao buscar preferências de usuários:', prefsError);
      return;
    }
    
    console.log(`Encontrados ${userPreferences.length} usuários para enviar emails semanais`);
    
    // Para cada usuário, chamar a função Edge para enviar o email
    const results = await Promise.all(
      userPreferences.map(async (pref) => {
        try {
          const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            },
            body: JSON.stringify({ userId: pref.user_id })
          });
          
          const result = await response.json();
          return { userId: pref.user_id, success: response.ok, result };
        } catch (error) {
          console.error(`Erro ao enviar email para usuário ${pref.user_id}:`, error);
          return { userId: pref.user_id, success: false, error: error.message };
        }
      })
    );
    
    // Registrar resultados
    const successCount = results.filter(r => r.success).length;
    console.log(`Emails enviados com sucesso: ${successCount}/${userPreferences.length}`);
    
    // Opcionalmente, salvar logs no Supabase
    // Nota: A função Edge já registra os logs de email, então isso é redundante
    // Mantido apenas para compatibilidade com versões anteriores
    await supabase
      .from('email_logs')
      .insert(results.map(r => ({
        user_id: r.userId,
        email_to: 'email-não-registrado@exemplo.com', // A função Edge já registra o email correto
        subject: 'Seu Resumo Semanal - ICTUS',
        status: r.success ? 'sent' : 'failed',
        error_message: r.success ? null : JSON.stringify(r.error),
        type: 'weekly_summary',
        created_at: new Date().toISOString()
      })));
    
    console.log('Agendamento de emails semanais concluído.');
  } catch (error) {
    console.error('Erro ao agendar emails semanais:', error);
  }
}

// Executar a função
scheduleWeeklyEmails();
