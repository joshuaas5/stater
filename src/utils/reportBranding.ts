/**
 * Sistema centralizado de branding para relatórios STATER
 * Este arquivo contém todos os elementos de identidade visual usados nos relatórios
 */

// Logo STATER em Base64 (SVG convertido)
export const STATER_LOGO_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM0I4MkY2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxRDRFRDg7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMCIgZmlsbD0idXJsKCNncmFkMSkiIHN0cm9rZT0iIzFFNDBBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHBhdGggZD0iTTIwIDI4IEwzMiAyMCBMNDQgMjggTDMyIDM2IFoiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjkiLz4KICA8Y2lyY2xlIGN4PSIzMiIgY3k9IjQyIiByPSI0IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44Ii8+Cjwvc3ZnPgo=';

// Paleta de cores oficial STATER
export const BRAND_COLORS = {
  // Cores primárias
  PRIMARY: '#3B82F6',        // Azul principal
  PRIMARY_DARK: '#1D4ED8',   // Azul escuro
  PRIMARY_LIGHT: '#60A5FA',  // Azul claro
  
  // Cores secundárias
  SECONDARY: '#8B5CF6',      // Roxo
  ACCENT: '#06B6D4',         // Ciano
  
  // Cores de status
  SUCCESS: '#10B981',        // Verde (receitas/positivo)
  DANGER: '#EF4444',         // Vermelho (despesas/negativo)
  WARNING: '#F59E0B',        // Amarelo (alertas)
  INFO: '#3B82F6',           // Azul (informações)
  
  // Cores neutras
  TEXT_PRIMARY: '#1F2937',   // Texto principal (quase preto)
  TEXT_SECONDARY: '#6B7280', // Texto secundário (cinza)
  TEXT_MUTED: '#9CA3AF',     // Texto desabilitado
  
  // Fundos
  BACKGROUND: '#FFFFFF',
  BACKGROUND_ALT: '#F9FAFB',
  BACKGROUND_CARD: '#F3F4F6',
  
  // Bordas
  BORDER: '#E5E7EB',
  BORDER_LIGHT: '#F3F4F6',
  
  // Gradientes (arrays RGB)
  GRADIENT_PRIMARY: {
    start: [59, 130, 246] as [number, number, number],  // #3B82F6
    end: [29, 78, 216] as [number, number, number]      // #1D4ED8
  },
  GRADIENT_SUCCESS: {
    start: [16, 185, 129] as [number, number, number],  // #10B981
    end: [5, 150, 105] as [number, number, number]      // #059669
  },
  GRADIENT_DANGER: {
    start: [239, 68, 68] as [number, number, number],   // #EF4444
    end: [220, 38, 38] as [number, number, number]      // #DC2626
  },
  
  // Cores para gráficos de pizza (10 cores distintas)
  CHART_PALETTE: [
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#F59E0B', // Amarelo
    '#EF4444', // Vermelho
    '#8B5CF6', // Roxo
    '#EC4899', // Rosa
    '#06B6D4', // Ciano
    '#F97316', // Laranja
    '#84CC16', // Lima
    '#6366F1', // Índigo
  ] as const,
};

// Informações da marca
export const BRAND_INFO = {
  name: 'STATER',
  slogan: 'Inteligência para prosperar',
  website: 'stater.app',
  email: 'stater@stater.app',
  copyright: `© ${new Date().getFullYear()} Stater. Todos os direitos reservados.`,
};

// Frases motivacionais sobre finanças
export const FINANCIAL_TIPS = [
  "Economize hoje para colher amanhã.",
  "Poupar não é deixar de viver, é garantir seu futuro.",
  "Dinheiro economizado é dinheiro ganho.",
  "Invista em você: o melhor investimento que existe.",
  "O segredo da independência financeira é gastar menos do que você ganha.",
  "Pequenas economias diárias trazem grandes resultados ao longo do tempo.",
  "Planeje suas finanças hoje para realizar seus sonhos amanhã.",
  "Seja o diretor financeiro da sua vida.",
  "Economizar é um hábito que se constrói dia após dia.",
  "A disciplina financeira de hoje é a liberdade de amanhã.",
  "Controle seu dinheiro antes que ele controle você.",
  "Cada real economizado é um passo rumo à liberdade financeira.",
  "Investir em conhecimento rende os melhores juros.",
  "O orçamento é o mapa que leva você aos seus objetivos financeiros.",
  "Gaste com sabedoria, viva com abundância.",
  "O melhor momento para começar a economizar foi ontem. O segundo melhor é agora.",
  "Finanças organizadas, mente tranquila.",
  "Pense no futuro ao tomar decisões financeiras hoje.",
  "A riqueza começa com bons hábitos financeiros.",
  "Transforme seus gastos em investimentos sempre que possível.",
] as const;

// Função para obter uma dica financeira aleatória
export function getRandomFinancialTip(): string {
  const randomIndex = Math.floor(Math.random() * FINANCIAL_TIPS.length);
  return FINANCIAL_TIPS[randomIndex];
}

// Função para formatar moeda brasileira
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Função para formatar data brasileira
export function formatDateBR(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  } catch {
    return '';
  }
}

// Função para formatar data por extenso
export function formatDateFull(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  } catch {
    return '';
  }
}

// Função para formatar percentual
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Função para obter cor baseada no valor (positivo/negativo)
export function getValueColor(value: number): string {
  if (value > 0) return BRAND_COLORS.SUCCESS;
  if (value < 0) return BRAND_COLORS.DANGER;
  return BRAND_COLORS.TEXT_PRIMARY;
}

// Função para obter cor RGB baseada no valor
export function getValueColorRGB(value: number): [number, number, number] {
  if (value > 0) return [16, 185, 129]; // Verde
  if (value < 0) return [239, 68, 68];  // Vermelho
  return [31, 41, 55]; // Preto
}

// Função para converter hex para RGB
export function hexToRGB(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ];
  }
  return [0, 0, 0];
}

// Componentes de texto do cabeçalho do relatório
export const REPORT_HEADER = {
  title: 'RELATÓRIO FINANCEIRO',
  subtitle: 'Gerado por STATER',
  poweredBy: 'Powered by STATER - Inteligência para prosperar',
};

// Componentes de texto do rodapé do relatório
export const REPORT_FOOTER = {
  confidential: 'Documento confidencial - Uso pessoal',
  generated: 'Gerado automaticamente pelo STATER',
  cta: 'Organize suas finanças em stater.app',
};

// Nomes das seções do relatório
export const REPORT_SECTIONS = {
  summary: 'RESUMO FINANCEIRO',
  income: 'RECEITAS',
  incomeByCategory: 'RECEITAS POR CATEGORIA',
  expenses: 'DESPESAS',
  expensesByCategory: 'DESPESAS POR CATEGORIA',
  bills: 'CONTAS A PAGAR/RECEBER',
  tip: 'DICA FINANCEIRA',
  projection: 'PROJEÇÃO',
};

// Status de contas
export const BILL_STATUS = {
  paid: { text: 'Paga', color: BRAND_COLORS.SUCCESS },
  pending: { text: 'Pendente', color: BRAND_COLORS.DANGER },
  overdue: { text: 'Vencida', color: BRAND_COLORS.DANGER },
  recurring: { text: 'Recorrente', color: BRAND_COLORS.INFO },
};

// Configurações de estilo para tabelas
export const TABLE_STYLES = {
  header: {
    fillColor: hexToRGB(BRAND_COLORS.PRIMARY),
    textColor: [255, 255, 255] as [number, number, number],
    fontSize: 10,
    fontStyle: 'bold' as const,
  },
  subheader: {
    fillColor: hexToRGB(BRAND_COLORS.BACKGROUND_CARD),
    textColor: hexToRGB(BRAND_COLORS.TEXT_PRIMARY),
    fontSize: 9,
    fontStyle: 'bold' as const,
  },
  body: {
    fillColor: [255, 255, 255] as [number, number, number],
    textColor: hexToRGB(BRAND_COLORS.TEXT_PRIMARY),
    fontSize: 9,
    fontStyle: 'normal' as const,
  },
  alternate: {
    fillColor: hexToRGB(BRAND_COLORS.BACKGROUND_ALT),
    textColor: hexToRGB(BRAND_COLORS.TEXT_PRIMARY),
    fontSize: 9,
    fontStyle: 'normal' as const,
  },
  total: {
    fillColor: hexToRGB(BRAND_COLORS.BACKGROUND_CARD),
    textColor: hexToRGB(BRAND_COLORS.TEXT_PRIMARY),
    fontSize: 10,
    fontStyle: 'bold' as const,
  },
};
