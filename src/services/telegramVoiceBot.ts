// Telegram Bot com suporte a áudio - Extensão do bot existente
import { Telegraf, Context } from 'telegraf';
import { processAudioWithGemini } from '@/utils/audioProcessing';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface VoiceMessage {
  file_id: string;
  file_unique_id: string;
  duration: number;
  mime_type?: string;
  file_size?: number;
}

interface AudioContext extends Context {
  message: Context['message'] & {
    voice?: VoiceMessage;
  };
}

export class TelegramVoiceBot {
  private bot: Telegraf;
  private processingUsers: Set<number> = new Set();

  constructor(token: string) {
    this.bot = new Telegraf(token);
    this.setupVoiceHandlers();
  }

  private setupVoiceHandlers() {
    // Handler para mensagens de voz
    this.bot.on('voice', this.handleVoiceMessage.bind(this));
    
    // Handler para notas de voz (voice notes)
    this.bot.on('audio', this.handleAudioMessage.bind(this));
    
    // Comando para ativar/desativar modo voz
    this.bot.command('voz', this.handleVoiceToggle.bind(this));
    
    // Comando de ajuda para funcionalidades de voz
    this.bot.command('ajuda_voz', this.handleVoiceHelp.bind(this));
  }

  private async handleVoiceMessage(ctx: AudioContext) {
    const userId = ctx.from?.id;
    const username = ctx.from?.username || ctx.from?.first_name || 'Usuário';

    if (!userId || !ctx.message?.voice) {
      await ctx.reply('❌ Erro ao processar mensagem de voz.');
      return;
    }

    // Evitar processamento múltiplo
    if (this.processingUsers.has(userId)) {
      await ctx.reply('🎤 Ainda estou processando sua mensagem anterior. Aguarde um momento...');
      return;
    }

    this.processingUsers.add(userId);

    try {
      // Confirmar recebimento
      await ctx.reply('🎧 Processando sua mensagem de voz...');

      // Baixar arquivo de áudio
      const fileId = ctx.message.voice.file_id;
      const file = await ctx.telegram.getFile(fileId);
      
      if (!file.file_path) {
        throw new Error('Não foi possível baixar o arquivo de áudio');
      }

      // Baixar o arquivo
      const fileUrl = `https://api.telegram.org/file/bot${this.bot.token}/${file.file_path}`;
      const response = await fetch(fileUrl);
      const audioBuffer = await response.arrayBuffer();
      
      // Converter para File object
      const audioFile = new File([audioBuffer], 'voice-message.ogg', { 
        type: 'audio/ogg' 
      });

      // Processar com Gemini
      const result = await processAudioWithGemini(audioFile, userId.toString());

      // Enviar transcrição
      await ctx.reply(`📝 *Transcrição:*\n"${result.transcript}"`, { 
        parse_mode: 'Markdown' 
      });

      // Processar intenção
      await this.processVoiceIntent(ctx, result, userId);

    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      await ctx.reply(`❌ Erro ao processar áudio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      this.processingUsers.delete(userId);
    }
  }

  private async handleAudioMessage(ctx: AudioContext) {
    // Similar ao voice, mas para arquivos de áudio
    await ctx.reply('🎵 Áudio recebido! Para mensagens de voz, use a função de nota de voz do Telegram.');
  }

  private async processVoiceIntent(ctx: AudioContext, result: any, userId: number) {
    const { intent, response } = result;

    // Enviar resposta da IA
    await ctx.reply(`🤖 ${response}`);

    switch (intent?.type) {
      case 'ADD_TRANSACTION':
        await this.handleVoiceTransaction(ctx, intent.data, userId);
        break;
        
      case 'GET_BALANCE':
        await this.handleVoiceBalance(ctx, userId);
        break;
        
      case 'GET_REPORT':
        await this.handleVoiceReport(ctx, userId);
        break;
        
      default:
        // Para intenções gerais, apenas manter a conversa
        break;
    }
  }

  private async handleVoiceTransaction(ctx: AudioContext, transactionData: any, userId: number) {
    const { amount, category, type, description } = transactionData;

    // Criar mensagem de confirmação
    const confirmationMessage = `
💰 *Confirmação de Transação via Voz*

${type === 'income' ? '📈 Tipo: Receita' : '📉 Tipo: Despesa'}
💵 Valor: R$ ${amount?.toFixed(2) || '0,00'}
🏷️ Categoria: ${category || 'Não especificada'}
📝 Descrição: ${description || 'Transação via voz'}

Confirma essa transação? Use /sim ou /nao`;

    await ctx.reply(confirmationMessage, { 
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Confirmar', callback_data: `confirm_transaction_${userId}` },
            { text: '❌ Cancelar', callback_data: `cancel_transaction_${userId}` }
          ]
        ]
      }
    });

    // Salvar transação pendente para o usuário
    this.savePendingTransaction(userId, transactionData);
  }

  private async handleVoiceBalance(ctx: AudioContext, userId: number) {
    try {
      // Aqui você integraria com o sistema de saldo real
      // Por enquanto, é um exemplo
      const balance = await this.getUserBalance(userId);
      
      const balanceMessage = `
💰 *Seu Saldo Atual*

💳 Saldo: R$ ${balance.toFixed(2)}
📊 Status: ${balance >= 0 ? '✅ Positivo' : '⚠️ Negativo'}

Para mais detalhes, use /relatorio`;

      await ctx.reply(balanceMessage, { parse_mode: 'Markdown' });
      
    } catch (error) {
      await ctx.reply('❌ Erro ao consultar saldo. Tente novamente mais tarde.');
    }
  }

  private async handleVoiceReport(ctx: AudioContext, userId: number) {
    try {
      // Gerar relatório básico
      const report = await this.generateUserReport(userId);
      
      await ctx.reply(report, { parse_mode: 'Markdown' });
      
    } catch (error) {
      await ctx.reply('❌ Erro ao gerar relatório. Tente novamente mais tarde.');
    }
  }

  private async handleVoiceToggle(ctx: Context) {
    const userId = ctx.from?.id;
    
    if (!userId) return;

    // Aqui você salvaria a preferência do usuário sobre modo voz
    const voiceEnabled = await this.toggleVoiceMode(userId);
    
    const message = voiceEnabled 
      ? '🎤 Modo voz ativado! Envie mensagens de voz para interagir.'
      : '🔇 Modo voz desativado. Use comandos de texto.';
      
    await ctx.reply(message);
  }

  private async handleVoiceHelp(ctx: Context) {
    const helpMessage = `
🎤 *Ajuda - Funcionalidades de Voz*

*Como usar:*
• Envie uma nota de voz com sua solicitação
• Fale naturalmente em português

*Exemplos:*
🗣️ "Adicionar gasto de 50 reais em alimentação"
🗣️ "Quanto tenho de saldo?"
🗣️ "Relatório da semana"
🗣️ "Recebi mil reais de salário"

*Comandos:*
/voz - Ativar/desativar modo voz
/ajuda_voz - Esta ajuda

*Dicas:*
• Fale claro e pausadamente
• Inclua valor, categoria e tipo
• O sistema confirmará antes de salvar`;

    await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
  }

  // Métodos auxiliares (implementar conforme sua arquitetura)
  private async savePendingTransaction(userId: number, transactionData: any) {
    // Implementar salvamento de transação pendente
    console.log(`Saving pending transaction for user ${userId}:`, transactionData);
  }

  private async getUserBalance(userId: number): Promise<number> {
    // Implementar consulta de saldo real
    return 1500.75; // Exemplo
  }

  private async generateUserReport(userId: number): Promise<string> {
    // Implementar geração de relatório
    return `
📊 *Relatório Financeiro*

📅 Período: Últimos 7 dias
💰 Receitas: R$ 2.000,00
💸 Despesas: R$ 1.200,00
💳 Saldo: R$ 800,00

🏆 Maior gasto: Alimentação (R$ 400,00)
📈 Tendência: Economia de 15%`;
  }

  private async toggleVoiceMode(userId: number): Promise<boolean> {
    // Implementar toggle do modo voz
    return true; // Exemplo
  }

  public start() {
    this.bot.launch();
    console.log('🤖 Telegram Voice Bot iniciado!');
  }

  public stop() {
    this.bot.stop();
  }
}

// Configuração e inicialização
export const initializeTelegramVoiceBot = (token: string) => {
  const voiceBot = new TelegramVoiceBot(token);
  voiceBot.start();
  return voiceBot;
};
