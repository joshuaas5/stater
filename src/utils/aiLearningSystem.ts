/**
 * STATER IA - SISTEMA DE APRENDIZADO ADAPTATIVO
 * 
 * Este sistema permite que a IA aprenda com o comportamento dos usuários
 * para melhorar a detecção de transações e entender padrões personalizados
 */

export interface UserLearningPattern {
  id: string;
  userId: string;
  phrase: string; // Frase original do usuário
  intent: 'transaction' | 'query' | 'other'; // Intenção identificada
  transactionType?: 'income' | 'expense';
  amount?: number;
  description?: string;
  category?: string;
  confidence: number; // 0-1, confiança na classificação
  timestamp: Date;
  correctedByUser?: boolean; // Se o usuário corrigiu a interpretação
  frequency: number; // Quantas vezes essa frase apareceu
}

export interface UserVocabulary {
  userId: string;
  customPhrases: Map<string, UserLearningPattern>;
  categoryMappings: Map<string, string>; // palavra -> categoria
  amountPatterns: RegExp[]; // Padrões específicos do usuário
  lastUpdated: Date;
}

class AILearningSystem {
  private userVocabularies: Map<string, UserVocabulary> = new Map();
  private readonly CONFIDENCE_THRESHOLD = 0.7;
  private readonly MIN_FREQUENCY_FOR_LEARNING = 2;

  /**
   * Registra uma nova interação do usuário para aprendizado
   */
  public recordUserInteraction(
    userId: string,
    userMessage: string,
    detectedIntent: 'transaction' | 'query' | 'other',
    wasCorrect: boolean,
    actualTransaction?: {
      type: 'income' | 'expense';
      amount: number;
      description: string;
      category: string;
    }
  ): void {
    const vocabulary = this.getUserVocabulary(userId);
    const normalizedPhrase = this.normalizePhrase(userMessage);
    
    let pattern = vocabulary.customPhrases.get(normalizedPhrase);
    
    if (pattern) {
      // Atualizar padrão existente
      pattern.frequency++;
      pattern.confidence = wasCorrect 
        ? Math.min(1.0, pattern.confidence + 0.1)
        : Math.max(0.0, pattern.confidence - 0.2);
      pattern.correctedByUser = !wasCorrect;
    } else {
      // Criar novo padrão
      pattern = {
        id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        phrase: normalizedPhrase,
        intent: detectedIntent,
        transactionType: actualTransaction?.type,
        amount: actualTransaction?.amount,
        description: actualTransaction?.description,
        category: actualTransaction?.category,
        confidence: wasCorrect ? 0.8 : 0.3,
        timestamp: new Date(),
        correctedByUser: !wasCorrect,
        frequency: 1
      };
    }
    
    vocabulary.customPhrases.set(normalizedPhrase, pattern);
    vocabulary.lastUpdated = new Date();
    
    // Salvar no localStorage para persistência
    this.saveUserVocabulary(userId, vocabulary);
    
    console.log('🧠 [AI_LEARNING] Padrão registrado:', {
      phrase: normalizedPhrase,
      confidence: pattern.confidence,
      frequency: pattern.frequency,
      wasCorrect
    });
  }

  /**
   * Analisa uma mensagem usando padrões aprendidos do usuário
   */
  public analyzeWithUserPatterns(userId: string, message: string): {
    isTransactionLikely: boolean;
    confidence: number;
    suggestedTransaction?: {
      type: 'income' | 'expense';
      amount?: number;
      description?: string;
      category?: string;
    };
    learnedPattern?: UserLearningPattern;
  } {
    const vocabulary = this.getUserVocabulary(userId);
    const normalizedMessage = this.normalizePhrase(message);
    
    // Buscar padrão exato
    let exactPattern = vocabulary.customPhrases.get(normalizedMessage);
    
    if (!exactPattern) {
      // Buscar padrão similar (fuzzy matching)
      exactPattern = this.findSimilarPattern(vocabulary, normalizedMessage);
    }
    
    if (exactPattern && 
        exactPattern.confidence >= this.CONFIDENCE_THRESHOLD &&
        exactPattern.frequency >= this.MIN_FREQUENCY_FOR_LEARNING) {
      
      console.log('🎯 [AI_LEARNING] Padrão aprendido encontrado:', {
        pattern: exactPattern.phrase,
        confidence: exactPattern.confidence,
        frequency: exactPattern.frequency
      });
      
      return {
        isTransactionLikely: exactPattern.intent === 'transaction',
        confidence: exactPattern.confidence,
        suggestedTransaction: exactPattern.transactionType ? {
          type: exactPattern.transactionType,
          amount: exactPattern.amount,
          description: exactPattern.description,
          category: exactPattern.category
        } : undefined,
        learnedPattern: exactPattern
      };
    }
    
    return {
      isTransactionLikely: false,
      confidence: 0,
    };
  }

  /**
   * Aprende com correções do usuário quando edita transações
   */
  public learnFromUserCorrection(
    userId: string,
    originalMessage: string,
    originalDetection: any,
    userCorrection: {
      type: 'income' | 'expense';
      amount: number;
      description: string;
      category: string;
    }
  ): void {
    // Registrar que a detecção original estava incorreta
    this.recordUserInteraction(
      userId,
      originalMessage,
      'transaction',
      false, // Estava incorreto
      userCorrection
    );
    
    // Aprender o padrão correto
    this.recordUserInteraction(
      userId,
      originalMessage,
      'transaction',
      true, // Agora está correto
      userCorrection
    );
    
    console.log('📚 [AI_LEARNING] Aprendeu com correção do usuário:', {
      message: originalMessage,
      correction: userCorrection
    });
  }

  /**
   * Sugere melhorias para o prompt da IA baseado nos padrões aprendidos
   */
  public generatePersonalizedPromptAddition(userId: string): string {
    const vocabulary = this.getUserVocabulary(userId);
    const learnedPatterns = Array.from(vocabulary.customPhrases.values())
      .filter(p => p.confidence >= this.CONFIDENCE_THRESHOLD && p.frequency >= 2);
    
    if (learnedPatterns.length === 0) {
      return '';
    }
    
    let promptAddition = '\n\nPADRÕES PERSONALIZADOS DO USUÁRIO:\n';
    
    // Adicionar padrões de transação aprendidos
    const transactionPatterns = learnedPatterns.filter(p => p.intent === 'transaction');
    if (transactionPatterns.length > 0) {
      promptAddition += 'Frases que o usuário usa para transações:\n';
      transactionPatterns.forEach(pattern => {
        promptAddition += `- "${pattern.phrase}" = ${pattern.transactionType === 'income' ? 'RECEITA' : 'DESPESA'}`;
        if (pattern.category) promptAddition += ` na categoria "${pattern.category}"`;
        promptAddition += '\n';
      });
    }
    
    // Adicionar mapeamentos de categoria personalizados
    const categoryMappings = Array.from(vocabulary.categoryMappings.entries());
    if (categoryMappings.length > 0) {
      promptAddition += '\nCategorias preferidas do usuário:\n';
      categoryMappings.forEach(([word, category]) => {
        promptAddition += `- "${word}" → categoria "${category}"\n`;
      });
    }
    
    return promptAddition;
  }

  private getUserVocabulary(userId: string): UserVocabulary {
    if (!this.userVocabularies.has(userId)) {
      // Tentar carregar do localStorage
      const saved = this.loadUserVocabulary(userId);
      if (saved) {
        this.userVocabularies.set(userId, saved);
      } else {
        // Criar novo
        const newVocabulary: UserVocabulary = {
          userId,
          customPhrases: new Map(),
          categoryMappings: new Map(),
          amountPatterns: [],
          lastUpdated: new Date()
        };
        this.userVocabularies.set(userId, newVocabulary);
      }
    }
    
    return this.userVocabularies.get(userId)!;
  }

  private normalizePhrase(phrase: string): string {
    return phrase
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Normalizar espaços
      .replace(/[.,!?;]/g, '') // Remover pontuação
      .replace(/\d+/g, 'NUM'); // Substituir números por placeholder
  }

  private findSimilarPattern(vocabulary: UserVocabulary, normalizedMessage: string): UserLearningPattern | undefined {
    const threshold = 0.8; // 80% de similaridade
    
    for (const [phrase, pattern] of vocabulary.customPhrases) {
      const similarity = this.calculateSimilarity(normalizedMessage, phrase);
      if (similarity >= threshold) {
        return pattern;
      }
    }
    
    return undefined;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const intersection = words1.filter(word => words2.includes(word));
    const union = new Set([...words1, ...words2]);
    
    return intersection.length / union.size; // Jaccard similarity
  }

  private saveUserVocabulary(userId: string, vocabulary: UserVocabulary): void {
    try {
      const serializable = {
        userId: vocabulary.userId,
        customPhrases: Array.from(vocabulary.customPhrases.entries()),
        categoryMappings: Array.from(vocabulary.categoryMappings.entries()),
        amountPatterns: vocabulary.amountPatterns.map(r => r.source),
        lastUpdated: vocabulary.lastUpdated.toISOString()
      };
      
      localStorage.setItem(`ai_learning_${userId}`, JSON.stringify(serializable));
    } catch (error) {
      console.error('❌ [AI_LEARNING] Erro ao salvar vocabulário:', error);
    }
  }

  private loadUserVocabulary(userId: string): UserVocabulary | null {
    try {
      const saved = localStorage.getItem(`ai_learning_${userId}`);
      if (!saved) return null;
      
      const data = JSON.parse(saved);
      
      return {
        userId: data.userId,
        customPhrases: new Map(data.customPhrases),
        categoryMappings: new Map(data.categoryMappings),
        amountPatterns: data.amountPatterns.map((source: string) => new RegExp(source, 'i')),
        lastUpdated: new Date(data.lastUpdated)
      };
    } catch (error) {
      console.error('❌ [AI_LEARNING] Erro ao carregar vocabulário:', error);
      return null;
    }
  }
}

// Instância global do sistema de aprendizado
export const aiLearningSystem = new AILearningSystem();

// Hooks para facilitar uso nos componentes
export const useAILearning = (userId: string) => {
  return {
    recordInteraction: (message: string, intent: 'transaction' | 'query' | 'other', wasCorrect: boolean, transaction?: any) => 
      aiLearningSystem.recordUserInteraction(userId, message, intent, wasCorrect, transaction),
    
    analyzeMessage: (message: string) => 
      aiLearningSystem.analyzeWithUserPatterns(userId, message),
    
    learnFromCorrection: (originalMessage: string, originalDetection: any, correction: any) =>
      aiLearningSystem.learnFromUserCorrection(userId, originalMessage, originalDetection, correction),
    
    getPersonalizedPrompt: () =>
      aiLearningSystem.generatePersonalizedPromptAddition(userId)
  };
};
