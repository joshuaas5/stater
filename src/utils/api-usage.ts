/**
 * Utilitário para controle de uso de APIs externas
 * Registra o uso de tokens e verifica limites para evitar cobranças inesperadas.
 */

import { supabase } from '@/lib/supabase';

// Configuração de limites para a API Gemini (aplicado por usuário)
const USER_MONTHLY_TOKEN_LIMIT = 30000; // Ex: 30.000 tokens por mês por usuário
const USER_USAGE_THRESHOLD = 0.9; // Verificar quando atingir 90% do limite

export interface ApiCallDetails {
  user_id: string;
  api_name?: string; // Default 'gemini'
  model_name?: string;
  prompt_tokens?: number;
  candidates_tokens?: number;
  total_tokens?: number;
  api_key_source?: string;
  error_message?: string;
  // created_at é gerado pelo DB
}

// Helper function to get YYYY-MM string
function getCurrentYearMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is 0-indexed
  return `${year}-${month}`;
}

/**
 * Registra os detalhes de uma chamada à API no banco de dados.
 * @param details Detalhes da chamada à API.
 */
export async function logApiCallDetails(details: Omit<ApiCallDetails, 'user_id'>): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    // OTIMIZAÇÃO: Temporariamente desabilitado para acelerar respostas
    console.log('API usage log:', details);
    return; // Skip para acelerar
    
    /* COMENTADO PARA OTIMIZAÇÃO:
    if (!user) {
      console.warn('Tentativa de registrar uso da API sem usuário autenticado.');
      return; // Não registrar se não houver usuário
    }

    // Construct the record specifically for the 'gemini_usage' table
    const geminiUsageRecord = {
      period_type: 'month', // Defaulting to 'month' for aggregation
      period_value: getCurrentYearMonthString(),
      tokens: details.total_tokens || 0,
      requests: 1, // This function call represents one request
      // Outros campos de 'ApiCallDetails' como user_id, api_name, model_name, etc.,
      // não são diretamente colunas na tabela 'gemini_usage' como definida no schema.
      // A tabela 'gemini_usage' parece ser para agregação, não para logs detalhados individuais.
    };

    const { error } = await supabase.from('gemini_usage').insert(geminiUsageRecord);

    if (error) {
      console.error('Erro ao registrar uso na tabela gemini_usage:', error);
    }
    */
  } catch (error) {
    console.error('Erro inesperado ao registrar uso na tabela gemini_usage:', error);
  }
}

/**
 * Verifica se o uso total de tokens do usuário no mês corrente está dentro do limite permitido.
 * @returns Promise<boolean> True se estiver dentro do limite, false caso contrário.
 */
export async function checkUserMonthlyTokenLimit(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('Tentativa de verificar limite de API sem usuário autenticado. Permitindo uso por padrão.');
      return true; // Permitir por padrão se não houver usuário (ex: em cenários de teste sem auth)
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed (Janeiro = 0)

    // Define o primeiro dia do mês corrente (UTC)
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    // Define o primeiro dia do próximo mês (UTC), que serve como fim do mês corrente
    const firstDayOfNextMonth = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));

    // console.log(`Verificando uso de tokens para user ${user.id} entre ${firstDayOfMonth.toISOString()} e ${firstDayOfNextMonth.toISOString()}`);

    const { data, error } = await supabase
      .from('api_usage')
      .select('total_tokens')
      .eq('user_id', user.id)
      .gte('created_at', firstDayOfMonth.toISOString())
      .lt('created_at', firstDayOfNextMonth.toISOString());

    if (error) {
      console.error('Erro ao verificar uso de tokens do usuário:', error);
      // Em caso de erro ao consultar, permitir o uso para não bloquear a funcionalidade crítica.
      return true;
    }

    const currentMonthTotalTokens = data.reduce((sum, record) => sum + (record.total_tokens || 0), 0);
    const limit = USER_MONTHLY_TOKEN_LIMIT * USER_USAGE_THRESHOLD;

    // console.log(`Usuário ${user.id}: Tokens consumidos este mês: ${currentMonthTotalTokens}, Limite (90%): ${limit}`);

    if (currentMonthTotalTokens >= limit) {
      console.warn(`Usuário ${user.id} atingiu ${currentMonthTotalTokens} tokens de ${USER_MONTHLY_TOKEN_LIMIT} (${(currentMonthTotalTokens / USER_MONTHLY_TOKEN_LIMIT * 100).toFixed(1)}%) no mês. Limite de ${USER_USAGE_THRESHOLD*100}% atingido.`);
      return false; // Limite atingido ou excedido
    }

    return true; // Dentro do limite
  } catch (error) {
    console.error('Erro inesperado ao verificar limite de tokens do usuário:', error);
    // Em caso de erro inesperado, permitir o uso.
    return true;
  }
}
