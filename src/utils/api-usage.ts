/**
 * Utilitário para controle de uso de APIs externas
 * Evita ultrapassar limites e gerar cobranças inesperadas
 */

import { supabase } from '@/lib/supabase';

// Configuração de limites para API do Gemini
const GEMINI_MONTHLY_LIMIT = 30000; // 30k tokens por mês (ajuste conforme seu plano)
const GEMINI_USAGE_THRESHOLD = 0.9; // 90% do limite

interface ApiUsageRecord {
  id?: string;
  api_name: string;
  month_year: string;
  usage_count: number;
  last_updated: string;
}

/**
 * Verifica se o uso da API está dentro do limite permitido
 * @param apiName Nome da API a ser verificada
 * @returns Promise<boolean> True se estiver dentro do limite, false caso contrário
 */
export async function checkApiUsageLimit(apiName: string): Promise<boolean> {
  try {
    // Obter o mês e ano atual para rastreamento mensal
    const date = new Date();
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Verificar se já existe um registro para este mês
    const { data, error } = await supabase
      .from('api_usage')
      .select('*')
      .eq('api_name', apiName)
      .eq('month_year', monthYear)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erro ao verificar uso da API:', error);
      // Em caso de erro, permitir o uso para não bloquear a funcionalidade
      return true;
    }
    
    // Se não há registro ou o uso está abaixo do limite
    if (!data || (data.usage_count < GEMINI_MONTHLY_LIMIT * GEMINI_USAGE_THRESHOLD)) {
      return true;
    }
    
    // Uso excedeu o limite
    console.warn(`Uso da API ${apiName} atingiu ${data.usage_count} de ${GEMINI_MONTHLY_LIMIT} (${(data.usage_count / GEMINI_MONTHLY_LIMIT * 100).toFixed(1)}%)`);
    return false;
  } catch (error) {
    console.error('Erro ao verificar limite de API:', error);
    // Em caso de erro, permitir o uso para não bloquear a funcionalidade
    return true;
  }
}

/**
 * Incrementa o contador de uso da API
 * @param apiName Nome da API utilizada
 * @param tokenCount Número de tokens utilizados (estimativa)
 */
export async function incrementApiUsage(apiName: string, tokenCount: number = 1): Promise<void> {
  try {
    // Obter o mês e ano atual para rastreamento mensal
    const date = new Date();
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const now = new Date().toISOString();
    
    // Verificar se já existe um registro para este mês
    const { data, error } = await supabase
      .from('api_usage')
      .select('*')
      .eq('api_name', apiName)
      .eq('month_year', monthYear)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erro ao incrementar uso da API:', error);
      return;
    }
    
    if (!data) {
      // Criar novo registro
      const newRecord: ApiUsageRecord = {
        api_name: apiName,
        month_year: monthYear,
        usage_count: tokenCount,
        last_updated: now
      };
      
      const { error: insertError } = await supabase
        .from('api_usage')
        .insert(newRecord);
      
      if (insertError) {
        console.error('Erro ao criar registro de uso da API:', insertError);
      }
    } else {
      // Atualizar registro existente
      const { error: updateError } = await supabase
        .from('api_usage')
        .update({
          usage_count: data.usage_count + tokenCount,
          last_updated: now
        })
        .eq('id', data.id);
      
      if (updateError) {
        console.error('Erro ao atualizar registro de uso da API:', updateError);
      }
    }
  } catch (error) {
    console.error('Erro ao registrar uso da API:', error);
  }
}

/**
 * Estima o número de tokens em um texto
 * Esta é uma estimativa simples baseada em palavras
 * @param text Texto para estimar tokens
 * @returns Número estimado de tokens
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  
  // Estimativa simples: ~1.3 tokens por palavra
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words * 1.3);
}
