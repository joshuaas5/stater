import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface AudioUsageStats {
  dailyCount: number;
  monthlyTokens: number;
  isAtLimit: boolean;
  warningLevel: 'none' | 'warning' | 'critical';
  remainingDaily: number;
  remainingMonthly: number;
}

interface AudioLimits {
  maxDailyMessages: number;
  maxMonthlyTokens: number;
  warningThreshold: number; // Porcentagem para aviso
  blockThreshold: number; // Porcentagem para bloquear
}

const DEFAULT_LIMITS: AudioLimits = {
  maxDailyMessages: 15, // 15 mensagens por dia
  maxMonthlyTokens: 50000, // 50k tokens por mês
  warningThreshold: 80, // Aviso em 80%
  blockThreshold: 95 // Bloqueia em 95%
};

export const useAudioLimits = (userId: string | null) => {
  const [usage, setUsage] = useState<AudioUsageStats>({
    dailyCount: 0,
    monthlyTokens: 0,
    isAtLimit: false,
    warningLevel: 'none',
    remainingDaily: DEFAULT_LIMITS.maxDailyMessages,
    remainingMonthly: DEFAULT_LIMITS.maxMonthlyTokens
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obter estatísticas atuais
  const fetchUsageStats = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().toISOString().substring(0, 7);

      // Buscar uso diário
      const { data: dailyData, error: dailyError } = await supabase
        .from('audio_logs')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`);

      if (dailyError) throw dailyError;

      // Buscar uso mensal (tokens)
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('audio_logs')
        .select('input_tokens, output_tokens')
        .eq('user_id', userId)
        .gte('created_at', `${currentMonth}-01T00:00:00.000Z`);

      if (monthlyError) throw monthlyError;

      const dailyCount = dailyData?.length || 0;
      const monthlyTokens = monthlyData?.reduce((sum, log) => 
        sum + (log.input_tokens || 0) + (log.output_tokens || 0), 0) || 0;

      // Calcular status
      const dailyPercentage = (dailyCount / DEFAULT_LIMITS.maxDailyMessages) * 100;
      const monthlyPercentage = (monthlyTokens / DEFAULT_LIMITS.maxMonthlyTokens) * 100;
      
      const maxPercentage = Math.max(dailyPercentage, monthlyPercentage);
      
      const isAtLimit = maxPercentage >= DEFAULT_LIMITS.blockThreshold;
      
      let warningLevel: 'none' | 'warning' | 'critical' = 'none';
      if (maxPercentage >= DEFAULT_LIMITS.blockThreshold) {
        warningLevel = 'critical';
      } else if (maxPercentage >= DEFAULT_LIMITS.warningThreshold) {
        warningLevel = 'warning';
      }

      setUsage({
        dailyCount,
        monthlyTokens,
        isAtLimit,
        warningLevel,
        remainingDaily: Math.max(0, DEFAULT_LIMITS.maxDailyMessages - dailyCount),
        remainingMonthly: Math.max(0, DEFAULT_LIMITS.maxMonthlyTokens - monthlyTokens)
      });

    } catch (err) {
      console.error('Erro ao buscar estatísticas de áudio:', err);
      setError('Erro ao carregar limites de áudio');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Registrar uso de áudio
  const recordAudioUsage = useCallback(async (audioData: {
    sessionId: string;
    audioDuration: number;
    audioSize: number;
    sourceType: 'web' | 'telegram';
    transcript: string;
    detectedIntent: string;
    processingTime: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    success: boolean;
    errorMessage?: string;
  }) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('audio_logs')
        .insert([{
          user_id: userId,
          session_id: audioData.sessionId,
          audio_duration_seconds: audioData.audioDuration,
          audio_size_bytes: audioData.audioSize,
          source_type: audioData.sourceType,
          transcript: audioData.transcript,
          detected_intent: audioData.detectedIntent,
          processing_time_ms: audioData.processingTime,
          input_tokens: audioData.inputTokens,
          output_tokens: audioData.outputTokens,
          estimated_cost_usd: audioData.estimatedCost,
          success: audioData.success,
          error_message: audioData.errorMessage
        }]);

      if (error) throw error;

      // Atualizar estatísticas locais
      await fetchUsageStats();
      return true;

    } catch (err) {
      console.error('Erro ao registrar uso de áudio:', err);
      return false;
    }
  }, [userId, fetchUsageStats]);

  // Verificar se pode usar áudio
  const canUseAudio = useCallback(() => {
    if (isLoading) return false;
    return !usage.isAtLimit;
  }, [usage.isAtLimit, isLoading]);

  // Obter mensagem de limite
  const getLimitMessage = useCallback(() => {
    if (usage.warningLevel === 'critical') {
      return `🚫 Limite de mensagens de áudio atingido. Restam ${usage.remainingDaily} mensagens hoje.`;
    }
    
    if (usage.warningLevel === 'warning') {
      const percentage = Math.max(
        (usage.dailyCount / DEFAULT_LIMITS.maxDailyMessages) * 100,
        (usage.monthlyTokens / DEFAULT_LIMITS.maxMonthlyTokens) * 100
      );
      return `⚠️ Você usou ${percentage.toFixed(0)}% do seu limite de áudio. Use com moderação.`;
    }
    
    return null;
  }, [usage]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchUsageStats();
  }, [fetchUsageStats]);

  return {
    usage,
    isLoading,
    error,
    canUseAudio,
    recordAudioUsage,
    getLimitMessage,
    refresh: fetchUsageStats,
    limits: DEFAULT_LIMITS
  };
};
