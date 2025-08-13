import { supabase } from '@/lib/supabase';

export interface CooldownInfo {
  isInCooldown: boolean;
  remainingMinutes?: number;
  canWatchAd: boolean;
  lastRewardAt?: Date;
  nextAvailableAt?: Date;
}

export interface CooldownConfig {
  [key: string]: {
    durationMinutes: number;
    rewardAmount: number;
  };
}

export class RewardCooldownManager {
  private static readonly COOLDOWN_CONFIG: CooldownConfig = {
    financial_analysis: {
      durationMinutes: 60,    // 1 hora de cooldown (não 7 dias)
      rewardAmount: 1         // 1 mensagem adicional por hora
    },
    bills: {
      durationMinutes: 30,
      rewardAmount: 3
    },
    transactions: {
      durationMinutes: 20,
      rewardAmount: 5
    },
    telegram_bot: {
      durationMinutes: 60,
      rewardAmount: 10
    },
    report_downloads: {
      durationMinutes: 60,    // 1 hora de cooldown
      rewardAmount: 3         // 3 downloads adicionais
    },
    recurring_transactions: {
      durationMinutes: 60,    // 1 hora de cooldown  
      rewardAmount: 2         // 2 transações recorrentes adicionais
    }
  };

  /**
   * Verifica se o usuário está em cooldown para uma feature específica
   */
  static async checkCooldownStatus(
    userId: string, 
    featureType: string
  ): Promise<CooldownInfo> {
    try {
      console.log(`🕐 [COOLDOWN] Verificando status para ${featureType} - usuário: ${userId}`);

      const { data, error } = await supabase
        .from('reward_ad_cooldowns')
        .select('*')
        .eq('user_id', userId)
        .eq('feature_type', featureType)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [COOLDOWN] Erro ao verificar cooldown:', error);
        return { isInCooldown: false, canWatchAd: true };
      }

      // Se não há registro, usuário pode assistir ad
      if (!data) {
        console.log(`✅ [COOLDOWN] Nenhum cooldown encontrado - pode assistir ad`);
        return { isInCooldown: false, canWatchAd: true };
      }

      const now = new Date();
      const cooldownEnds = new Date(data.cooldown_ends_at);
      const lastReward = new Date(data.last_reward_at);

      const isInCooldown = now < cooldownEnds;
      const remainingMs = cooldownEnds.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));

      console.log(`🕐 [COOLDOWN] Status: ${isInCooldown ? 'EM COOLDOWN' : 'DISPONÍVEL'}`);
      if (isInCooldown) {
        console.log(`⏰ [COOLDOWN] Restam ${remainingMinutes} minutos`);
      }

      return {
        isInCooldown,
        remainingMinutes: isInCooldown ? Math.max(0, remainingMinutes) : 0,
        canWatchAd: !isInCooldown,
        lastRewardAt: lastReward,
        nextAvailableAt: cooldownEnds
      };

    } catch (error) {
      console.error('❌ [COOLDOWN] Erro ao verificar status:', error);
      return { isInCooldown: false, canWatchAd: true };
    }
  }

  /**
   * Registra que o usuário assistiu um reward ad e inicia o cooldown
   */
  static async setRewardCooldown(
    userId: string, 
    featureType: string
  ): Promise<boolean> {
    try {
      const config = this.COOLDOWN_CONFIG[featureType];
      if (!config) {
        console.error(`❌ [COOLDOWN] Configuração não encontrada para: ${featureType}`);
        return false;
      }

      const now = new Date();
      const cooldownEnds = new Date(now.getTime() + (config.durationMinutes * 60 * 1000));

      console.log(`🎯 [COOLDOWN] Registrando reward para ${featureType}:`);
      console.log(`   - Duração configurada: ${config.durationMinutes} minutos`);
      console.log(`   - Cooldown termina em: ${cooldownEnds.toISOString()}`);
      console.log(`   - Minutos até o fim: ${config.durationMinutes}`);

      const { error } = await supabase
        .from('reward_ad_cooldowns')
        .upsert({
          user_id: userId,
          feature_type: featureType,
          last_reward_at: now.toISOString(),
          cooldown_ends_at: cooldownEnds.toISOString(),
          updated_at: now.toISOString()
        }, {
          onConflict: 'user_id,feature_type'
        });

      if (error) {
        console.error('❌ [COOLDOWN] Erro ao registrar cooldown:', error);
        return false;
      }

      console.log(`✅ [COOLDOWN] Cooldown registrado até: ${cooldownEnds.toLocaleString()}`);
      return true;

    } catch (error) {
      console.error('❌ [COOLDOWN] Erro ao definir cooldown:', error);
      return false;
    }
  }

  /**
   * Obtém informações sobre todos os cooldowns ativos do usuário
   */
  static async getAllUserCooldowns(userId: string): Promise<{
    [featureType: string]: CooldownInfo;
  }> {
    try {
      const { data, error } = await supabase
        .from('reward_ad_cooldowns')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ [COOLDOWN] Erro ao buscar todos os cooldowns:', error);
        return {};
      }

      const cooldowns: { [featureType: string]: CooldownInfo } = {};
      const now = new Date();

      for (const record of data || []) {
        const cooldownEnds = new Date(record.cooldown_ends_at);
        const lastReward = new Date(record.last_reward_at);
        const isInCooldown = now < cooldownEnds;
        const remainingMs = cooldownEnds.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));

        cooldowns[record.feature_type] = {
          isInCooldown,
          remainingMinutes: isInCooldown ? Math.max(0, remainingMinutes) : 0,
          canWatchAd: !isInCooldown,
          lastRewardAt: lastReward,
          nextAvailableAt: cooldownEnds
        };
      }

      return cooldowns;

    } catch (error) {
      console.error('❌ [COOLDOWN] Erro ao buscar cooldowns:', error);
      return {};
    }
  }

  /**
   * Remove um cooldown específico (apenas para debug/admin)
   */
  static async removeCooldown(
    userId: string, 
    featureType: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reward_ad_cooldowns')
        .delete()
        .eq('user_id', userId)
        .eq('feature_type', featureType);

      if (error) {
        console.error('❌ [COOLDOWN] Erro ao remover cooldown:', error);
        return false;
      }

      console.log(`🗑️ [COOLDOWN] Cooldown removido para ${featureType}`);
      return true;

    } catch (error) {
      console.error('❌ [COOLDOWN] Erro ao remover cooldown:', error);
      return false;
    }
  }

  /**
   * Obtém a configuração de cooldown para uma feature
   */
  static getCooldownConfig(featureType: string): {
    durationMinutes: number;
    rewardAmount: number;
  } | null {
    return this.COOLDOWN_CONFIG[featureType] || null;
  }

  /**
   * Formata o tempo restante de cooldown para exibição
   */
  static formatRemainingTime(minutes: number): string {
    if (minutes <= 0) return 'Disponível';
    
    if (minutes < 60) {
      return `${minutes}min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  }
}
