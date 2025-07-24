export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  userId: string;
  // Campos adicionais para contas a pagar
  isRecurring?: boolean;
  recurringDay?: number; // Dia do mês para transações recorrentes mensais/anuais (1-31)
  recurringWeekday?: number; // Dia da semana para transações semanais (0-6, domingo a sábado)
  recurringMonth?: number; // Mês para transações recorrentes anuais (1-12)
  recurrenceFrequency?: 'weekly' | 'monthly' | 'yearly'; // Frequência de recorrência
  nextOccurrence?: Date; // Próxima data de execução da recorrência
  lastProcessed?: Date; // Última vez que a recorrência foi processada
  isRecurringInstance?: boolean; // Indica se é uma instância criada pela recorrência
  originalRecurringId?: string; // ID da transação recorrente original
  dueDate?: Date;
  isPaid?: boolean;
  totalInstallments?: number;
  currentInstallment?: number;
  // Para cartões de crédito
  isCardBill?: boolean;
  cardItems?: CardItem[];
  dontAdjustBalanceOnSave?: boolean; // Nova flag
}

export interface CardItem {
  id: string;
  description: string;
  amount: number;
  installments?: {
    current: number;
    total: number;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'system' | 'assistant';
  timestamp: Date;
  avatarUrl?: string; // Adicionado para permitir avatares personalizados para a IA
}

export interface ConsultantMessage {
  id: string;
  userId: string;
  text: string;
  sender: 'user' | 'consultant';
  timestamp: Date;
  read: boolean;
  category?: string; // Categoria da mensagem (ex: investimentos, economia, planejamento)
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Bill {
  id: string;
  userId: string;
  title: string;
  amount: number;
  dueDate: Date; 
  category: string;
  isPaid: boolean;
  isRecurring?: boolean;
  recurringDay?: number; 
  totalInstallments?: number; 
  currentInstallment?: number; 
  paymentMethod?: string; 
  notes?: string;
  paidDate?: Date;
  cardId?: string; 
  notificationsEnabled?: boolean;
  notificationDays?: number[]; 
  isCardBill?: boolean;
  cardItems?: CardItem[];
  originalDueDate?: Date; 
  displayInstallment?: number | null; 
  originalBillId?: string; 
  isInfiniteRecurrence?: boolean; 
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate?: string;
  isoDate?: string; 
  content?: string;
  contentSnippet?: string;
  guid?: string;
  sourceName?: string; 
  imageUrl?: string;   
  categories?: string[]; 
  author?: string; 
  creator?: string | null;
  description?: string | null; 
  id?: string; 
  media?: { thumbnail?: { url?: string } }; 
  logoUrl?: string; // Adicionado para o logo da fonte
}

export type NotificationType = 'fiveDaysBefore' | 'oneDayBefore' | 'dueDay' | 'overdue' | 'almostFinished' | 'paid' | 'weekly_summary';

export interface Notification {
  id: string;
  billId: string;
  userId: string;
  type: NotificationType;
  message: string;
  date: Date;
  read: boolean;
}

export const INCOME_CATEGORIES = [
  'Salário',
  'Salário 13º',
  'Férias',
  'PLR/Participação nos Lucros',
  'Comissões',
  'Hora Extra',
  'Renda de Trabalho Autônomo',
  'Freelance',
  'Consultoria',
  'Prestação de Serviços',
  'Venda de Produtos',
  'E-commerce',
  'Investimentos',
  'Dividendos',
  'Juros de Aplicações',
  'Rendimentos CDB',
  'Rendimentos Poupança',
  'Venda de Ações',
  'Fundos Imobiliários',
  'Renda de Aluguel',
  'Renda de Pensão',
  'Aposentadoria',
  'Auxílios Governamentais',
  'Bolsa Família',
  'Auxílio Brasil',
  'Seguro Desemprego',
  'FGTS',
  'Restituição de IR',
  'Presentes em Dinheiro',
  'Vendas Ocasionais',
  'Venda de Veículo',
  'Venda de Imóvel',
  'Cashback',
  'Reembolsos',
  'Prêmios e Sorteios',
  'Renda Extra',
  'Monetização Online',
  'YouTube/Criador de Conteúdo',
  'Afiliados',
  'Royalties',
  'Outras Receitas'
];

export const EXPENSE_CATEGORIES = [
  // Habitação
  'Aluguel',
  'Financiamento Imobiliário',
  'Condomínio',
  'IPTU',
  'Luz',
  'Água',
  'Gás',
  'Internet',
  'TV por Assinatura',
  'Telefone Fixo',
  'Manutenção da Casa',
  'Móveis e Decoração',
  'Eletrodomésticos',
  
  // Transporte
  'Combustível',
  'Transporte Público',
  'Uber/99/Táxi',
  'Estacionamento',
  'Pedágio',
  'Manutenção do Veículo',
  'Seguro do Veículo',
  'IPVA',
  'Licenciamento',
  'Multas de Trânsito',
  'Financiamento do Veículo',
  
  // Alimentação
  'Supermercado',
  'Açougue/Peixaria',
  'Padaria',
  'Feira',
  'Restaurantes',
  'Lanchonetes',
  'Fast Food',
  'Delivery',
  'Bebidas',
  'Doces e Sobremesas',
  
  // Saúde
  'Plano de Saúde',
  'Consultas Médicas',
  'Exames',
  'Medicamentos',
  'Farmácia',
  'Dentista',
  'Psicólogo',
  'Fisioterapia',
  'Academia',
  'Suplementos',
  
  // Educação
  'Mensalidade Escolar',
  'Faculdade',
  'Cursos Online',
  'Livros',
  'Material Escolar',
  'Cursos de Idiomas',
  'Certificações',
  
  // Entretenimento
  'Cinema',
  'Teatro',
  'Shows',
  'Streaming (Netflix, etc)',
  'Jogos',
  'Viagens',
  'Hotéis',
  'Passeios',
  'Bares e Baladas',
  'Hobbies',
  
  // Cuidados Pessoais
  'Cabeleireiro',
  'Manicure/Pedicure',
  'Estética',
  'Roupas',
  'Calçados',
  'Acessórios',
  'Perfumes',
  'Cosméticos',
  'Produtos de Higiene',
  
  // Tecnologia
  'Celular (Conta)',
  'Aplicativos',
  'Software',
  'Equipamentos Eletrônicos',
  'Computador',
  'Acessórios Tech',
  
  // Financeiro
  'Pagamentos de Dívidas',
  'Cartão de Crédito',
  'Financiamentos',
  'Empréstimos',
  'Juros e Multas',
  'Anuidade do Cartão',
  'Tarifa Bancária',
  
  // Investimentos e Poupança
  'Poupança',
  'Investimentos',
  'Previdência Privada',
  'Seguro de Vida',
  'Capitalização',
  
  // Impostos e Taxas
  'Imposto de Renda',
  'Impostos Diversos',
  'Taxas Governamentais',
  'Cartório',
  'Despachante',
  
  // Família e Pets
  'Presentes',
  'Doações',
  'Mesada dos Filhos',
  'Pet Shop',
  'Veterinário',
  'Ração para Pets',
  
  // Trabalho
  'Transporte para Trabalho',
  'Almoço no Trabalho',
  'Material de Trabalho',
  'Uniformes',
  
  // Casa e Manutenção
  'Ferramentas',
  'Jardinagem',
  'Limpeza',
  'Segurança',
  'Reformas',
  
  // Emergências
  'Gastos Médicos de Emergência',
  'Reparos Emergenciais',
  'Gastos Inesperados',
  
  // Outros
  'Despesas Diversas',
  'Não Categorizado'
];

// ===== SISTEMA DE MONETIZAÇÃO =====

export enum PlanType {
  FREE = 'free',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly', 
  PRO = 'pro'
}

export interface UserPlan {
  userId: string;
  planType: PlanType;
  isActive: boolean;
  startDate: Date;
  expiresAt?: Date;
  trialEndsAt?: Date;
  isOnTrial: boolean;
  paymentStatus: 'active' | 'pending' | 'failed' | 'cancelled';
  purchaseToken?: string;
  productId?: string;
}

export interface PlanFeatures {
  // Limites de uso diário
  dailyMessages: number;         // IA Chat (-1 = ilimitado)
  dailyAudioMinutes: number;     // Processamento de áudio em minutos
  dailyOcrScans: number;         // Scans OCR de fotos/documentos
  dailyPdfPages: number;         // Páginas de PDF processadas
  monthlyExports: number;        // Exports de relatórios por mês
  
  // Funcionalidades boolean
  telegramBot: boolean;          // Acesso ao bot do Telegram
  exportReports: boolean;        // Capacidade de exportar relatórios
  ocrScanning: boolean;          // Scanning OCR de imagens
  pdfProcessing: boolean;        // Processamento de arquivos PDF
  advancedAnalytics: boolean;    // Analytics avançados
  prioritySupport?: boolean;     // Suporte prioritário (apenas PRO)
  
  // Configurações de monetização
  adsRequired: boolean;          // Se anúncios são obrigatórios
  showBanner?: boolean;          // Se deve mostrar banner de upgrade
}

export interface UserUsage {
  userId: string;
  date: string; // YYYY-MM-DD
  messagesUsed: number;
  transactionsAdded: number;
  billsAdded: number;
  adsWatched: number;
}

export interface UserJourney {
  userId: string;
  startDate: Date;
  currentDay: number;
  adsWatchedToday: number;
  messagesGrantedToday: number;
  hasReachedPaywall: boolean;
  lastResetDate?: string; // YYYY-MM-DD - Para controle de reset diário
}
