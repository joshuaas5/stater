// API OCR funcional - baseada no teste que funcionou
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Categorias exatas do sistema (importadas do frontend)
const INCOME_CATEGORIES = [
  'SalÃ¡rio', 'SalÃ¡rio 13Âº', 'FÃ©rias', 'PLR/ParticipaÃ§Ã£o nos Lucros', 'ComissÃµes', 'Hora Extra',
  'Renda de Trabalho AutÃ´nomo', 'Freelance', 'Consultoria', 'PrestaÃ§Ã£o de ServiÃ§os', 'Venda de Produtos',
  'E-commerce', 'Investimentos', 'Dividendos', 'Juros de AplicaÃ§Ãµes', 'Rendimentos CDB', 'Rendimentos PoupanÃ§a',
  'Venda de AÃ§Ãµes', 'Fundos ImobiliÃ¡rios', 'Renda de Aluguel', 'Renda de PensÃ£o', 'Aposentadoria',
  'AuxÃ­lios Governamentais', 'Bolsa FamÃ­lia', 'AuxÃ­lio Brasil', 'Seguro Desemprego', 'FGTS', 'RestituiÃ§Ã£o de IR',
  'Presentes em Dinheiro', 'Vendas Ocasionais', 'Venda de VeÃ­culo', 'Venda de ImÃ³vel', 'Cashback', 'Reembolsos',
  'PrÃªmios e Sorteios', 'Renda Extra', 'MonetizaÃ§Ã£o Online', 'YouTube/Criador de ConteÃºdo', 'Afiliados',
  'Royalties', 'Outras Receitas'
];

const EXPENSE_CATEGORIES = [
  // HabitaÃ§Ã£o
  'Aluguel', 'Financiamento ImobiliÃ¡rio', 'CondomÃ­nio', 'IPTU', 'Luz', 'Ãgua', 'GÃ¡s', 'Internet', 'TV por Assinatura',
  'Telefone Fixo', 'ManutenÃ§Ã£o da Casa', 'MÃ³veis e DecoraÃ§Ã£o', 'EletrodomÃ©sticos',
  // Transporte
  'CombustÃ­vel', 'Transporte PÃºblico', 'Uber/99/TÃ¡xi', 'Estacionamento', 'PedÃ¡gio', 'ManutenÃ§Ã£o do VeÃ­culo',
  'Seguro do VeÃ­culo', 'IPVA', 'Licenciamento', 'Multas de TrÃ¢nsito', 'Financiamento do VeÃ­culo',
  // AlimentaÃ§Ã£o
  'Supermercado', 'AÃ§ougue/Peixaria', 'Padaria', 'Feira', 'Restaurantes', 'Lanchonetes', 'Fast Food', 'Delivery',
  'Bebidas', 'Doces e Sobremesas',
  // SaÃºde
  'Plano de SaÃºde', 'Consultas MÃ©dicas', 'Exames', 'Medicamentos', 'FarmÃ¡cia', 'Dentista', 'PsicÃ³logo',
  'Fisioterapia', 'Academia', 'Suplementos',
  // EducaÃ§Ã£o
  'Mensalidade Escolar', 'Faculdade', 'Cursos Online', 'Livros', 'Material Escolar', 'Cursos de Idiomas', 'CertificaÃ§Ãµes',
  // Entretenimento
  'Cinema', 'Teatro', 'Shows', 'Streaming (Netflix, etc)', 'Jogos', 'Viagens', 'HotÃ©is', 'Passeios', 'Bares e Baladas', 'Hobbies',
  // Cuidados Pessoais
  'Cabeleireiro', 'Manicure/Pedicure', 'EstÃ©tica', 'Roupas', 'CalÃ§ados', 'AcessÃ³rios', 'Perfumes', 'CosmÃ©ticos', 'Produtos de Higiene',
  // Tecnologia
  'Celular (Conta)', 'Aplicativos', 'Software', 'Equipamentos EletrÃ´nicos', 'Computador', 'AcessÃ³rios Tech',
  // Financeiro
  'Pagamentos de DÃ­vidas', 'CartÃ£o de CrÃ©dito', 'Financiamentos', 'EmprÃ©stimos', 'Juros e Multas', 'Anuidade do CartÃ£o', 'Tarifa BancÃ¡ria',
  // Investimentos e PoupanÃ§a
  'PoupanÃ§a', 'Investimentos', 'PrevidÃªncia Privada', 'Seguro de Vida', 'CapitalizaÃ§Ã£o',
  // Impostos e Taxas
  'Imposto de Renda', 'Impostos Diversos', 'Taxas Governamentais', 'CartÃ³rio', 'Despachante',
  // FamÃ­lia e Pets
  'Presentes', 'DoaÃ§Ãµes', 'Mesada dos Filhos', 'Pet Shop', 'VeterinÃ¡rio', 'RaÃ§Ã£o para Pets',
  // Trabalho
  'Transporte para Trabalho', 'AlmoÃ§o no Trabalho', 'Material de Trabalho', 'Uniformes',
  // Casa e ManutenÃ§Ã£o
  'Ferramentas', 'Jardinagem', 'Limpeza', 'SeguranÃ§a', 'Reformas',
  // EmergÃªncias
  'Gastos MÃ©dicos de EmergÃªncia', 'Reparos Emergenciais', 'Gastos Inesperados',
  // Outros
  'Despesas Diversas', 'NÃ£o Categorizado'
];

// FunÃ§Ã£o para selecionar categoria automaticamente baseada nas transaÃ§Ãµes
function selectAutomaticCategory(transactions: any[]): string {
  if (!transactions || transactions.length === 0) {
    return 'NÃ£o Categorizado';
  }

  // Contar frequÃªncia de categorias
  const categoryCount: { [key: string]: number } = {};
  const categoryValue: { [key: string]: number } = {};

  transactions.forEach(transaction => {
    const category = transaction.category || 'NÃ£o Categorizado';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
    categoryValue[category] = (categoryValue[category] || 0) + (transaction.amount || 0);
  });

  // Encontrar categoria mais relevante (por valor total)
  let maxValue = 0;
  let selectedCategory = 'NÃ£o Categorizado';

  Object.entries(categoryValue).forEach(([category, value]) => {
    if (value > maxValue) {
      maxValue = value;
      selectedCategory = category;
    }
  });

  // Verificar se a categoria selecionada existe nas categorias vÃ¡lidas
  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  if (!allCategories.includes(selectedCategory)) {
    // Se nÃ£o existe, tentar mapear para uma categoria vÃ¡lida baseada na descriÃ§Ã£o
    const firstTransaction = transactions[0];
    if (firstTransaction && firstTransaction.description) {
      const description = firstTransaction.description.toLowerCase();

      // Mapeamento inteligente baseado em palavras-chave
      if (description.includes('supermercado') || description.includes('mercado') || description.includes('extra') || description.includes('carrefour')) {
        return 'Supermercado';
      }
      if (description.includes('combustÃ­vel') || description.includes('posto') || description.includes('gasolina') || description.includes('Ã¡lcool')) {
        return 'CombustÃ­vel';
      }
      if (description.includes('restaurante') || description.includes('lanchonete') || description.includes('delivery')) {
        return 'Restaurantes';
      }
      if (description.includes('farmÃ¡cia') || description.includes('medicamento') || description.includes('remÃ©dio')) {
        return 'FarmÃ¡cia';
      }
      if (description.includes('uber') || description.includes('99') || description.includes('taxi')) {
        return 'Uber/99/TÃ¡xi';
      }
      if (description.includes('netflix') || description.includes('spotify') || description.includes('streaming')) {
        return 'Streaming (Netflix, etc)';
      }
      if (description.includes('aluguel')) {
        return 'Aluguel';
      }
      if (description.includes('salÃ¡rio') || description.includes('pagamento')) {
        return 'SalÃ¡rio';
      }
      if (description.includes('pix recebido') || description.includes('transferÃªncia recebida')) {
        return 'Outras Receitas';
      }
    }

    return 'NÃ£o Categorizado';
  }

  return selectedCategory;
}

// FunÃ§Ã£o para processar PDF com senha
async function processPdfWithPassword(pdfBase64: string, password?: string): Promise<string> {
  try {
    console.log('[OCR] Processando PDF, senha fornecida:', !!password);

    // Se nÃ£o tem senha, tentar processar normalmente
    if (!password) {
      return pdfBase64;
    }

    // Importar pdf-lib dinamicamente
    const { PDFDocument } = await import('pdf-lib');

    // Converter base64 para buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    try {
      // Tentar carregar o PDF (pdf-lib nÃ£o suporta senha diretamente)
      // Se der erro, Ã© porque precisa de senha
      const pdfDoc = await PDFDocument.load(pdfBuffer);

      // Se chegou aqui, nÃ£o precisava de senha ou jÃ¡ estava desbloqueado
      console.log('[OCR] PDF carregado sem problemas');
      return pdfBase64;

    } catch (loadError: any) {
      console.log('[OCR] Erro ao carregar PDF:', loadError.message);

      // Se Ã© erro relacionado a criptografia/senha
      if (loadError.message.includes('encrypt') || loadError.message.includes('password') ||
        loadError.message.includes('security') || loadError.message.includes('owner')) {
        throw new Error('SENHA_INCORRETA');
      }

      // Outros erros de PDF
      throw new Error('PDF_CORRUPTO');
    }

  } catch (error: any) {
    console.error('[OCR] Erro ao processar PDF com senha:', error.message);
    throw error;
  }
}

// FunÃ§Ã£o para processar PDF protegido por senha
async function processProtectedPdf(pdfBase64: string, password: string): Promise<string> {
  try {
    console.log('[OCR] Tentando desbloquear PDF com senha...');

    // Converter base64 para buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    // Para PDFs protegidos por senha, vamos tentar uma abordagem mais simples
    // Primeiro, tentar verificar se o PDF Ã© realmente protegido
    const pdfHeader = pdfBuffer.toString('ascii', 0, 100);

    if (pdfHeader.includes('Encrypt')) {
      console.log('[OCR] PDF protegido detectado, mas nÃ£o conseguimos desbloquear no servidor');
      throw new Error('NEEDS_PASSWORD');
    }

    // Se chegou aqui, assumir que o PDF nÃ£o Ã© protegido ou jÃ¡ foi processado
    return pdfBase64;

  } catch (error: any) {
    console.error('[OCR] Erro ao processar PDF:', error.message);

    if (error.message === 'NEEDS_PASSWORD') {
      throw error;
    }

    throw new Error('PDF_PROCESSING_ERROR');
  }
}

// FunÃ§Ã£o para processar arquivos de texto (CSV, TXT, Excel)
async function processTextFile(req: any, res: any, textContent: string, fileType: string, excelData?: string) {
  console.log('[TEXT] Processando arquivo de texto/planilha...');
  console.log('[TEXT] Tipo:', fileType);
  console.log('[TEXT] Tamanho do conteÃºdo texto:', textContent?.length || 0);
  console.log('[TEXT] Dados Excel presentes:', !!excelData);

  let finalTextContent = textContent;

  // Processar arquivo Excel se fornecido
  if (excelData && (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('xls'))) {
    try {
      console.log('[TEXT] Processando arquivo Excel...');

      // Importar XLSX dinamicamente
      const XLSX = await import('xlsx');

      // Converter base64 para buffer
      const buffer = Buffer.from(excelData, 'base64');

      // Ler workbook
      const workbook = XLSX.read(buffer, { type: 'buffer' });

      // Pegar primeira planilha
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Converter para CSV
      const csvData = XLSX.utils.sheet_to_csv(worksheet);
      console.log('[TEXT] Excel convertido para CSV, tamanho:', csvData.length);

      finalTextContent = csvData;

    } catch (excelError: any) {
      console.error('[TEXT] Erro ao processar Excel:', excelError.message);
      return res.status(400).json({
        error: 'Arquivo nÃ£o foi lido corretamente',
        suggestions: [
          'ðŸ“¸ TIRE UMA FOTO da planilha na tela e envie',
          'ðŸ“‹ COPIE os dados da planilha e cole no chat',
          'ðŸ’¾ SALVE como PDF e envie'
        ],
        needsManualReview: true
      });
    }
  }

  if (!finalTextContent || finalTextContent.trim().length === 0) {
    return res.status(400).json({
      error: 'ConteÃºdo do arquivo vazio',
      details: 'O arquivo nÃ£o contÃ©m dados vÃ¡lidos para processamento.'
    });
  } const prompt = `
VOCÃŠ Ã‰ UM ESPECIALISTA EM ANÃLISE DE DADOS FINANCEIROS BRASILEIROS.

ANALISE ESTE CONTEÃšDO DE ARQUIVO FINANCEIRO e extraia TODAS as transaÃ§Ãµes com MÃXIMA PRECISÃƒO:

FORMATO DO ARQUIVO: ${fileType}
CONTEÃšDO A ANALISAR:
${finalTextContent}

INSTRUÃ‡Ã•ES ESPECÃFICAS POR FORMATO:

ðŸ—‚ï¸ PARA CSV/EXCEL:
- Procure colunas com: Data, DescriÃ§Ã£o/HistÃ³rico, Valor/DÃ©bito/CrÃ©dito, Tipo
- IGNORE linhas de cabeÃ§alho, totais, saldos, rodapÃ©s
- Valores sempre POSITIVOS no JSON (ex: -150.50 vira 150.50)
- Determine tipo pela coluna ou contexto da descriÃ§Ã£o
- Aceite separadores: vÃ­rgula (,) ou ponto e vÃ­rgula (;)
- Formatos de valor: "1234.56", "1.234,56", "R$ 1.234,56", "-1234,56"

ðŸ“„ PARA ARQUIVOS TXT:
- Procure padrÃµes: DD/MM/AAAA + DESCRIÃ‡ÃƒO + VALOR
- Valores com + ou sem sinal = ENTRADA (income)
- Valores com - = SAÃDA (expense)
- PIX enviado/TED = expense, PIX recebido = income
- Ignore linhas de "SALDO", "TOTAL", "ANTERIOR"

ðŸ¦ REGRAS PARA BANCOS BRASILEIROS:
- Banco do Brasil: (+) = income, (-) = expense
- Bradesco: DÃ‰BITO/D = expense, CRÃ‰DITO/C = income  
- Caixa: D = expense, C = income
- Nubank: "enviado"/"pago" = expense, "recebido" = income
- ItaÃº: (+) = income, (-) = expense
- TransferÃªncias: analise direÃ§Ã£o ("para" = expense, "de" = income)

VALIDAÃ‡ÃƒO OBRIGATÃ“RIA:
- NÃƒO extraia se sÃ³ houver valores < R$ 1,00
- Extratos tÃ­picos tÃªm MÃšLTIPLAS transaÃ§Ãµes variadas
- Se poucos dados vÃ¡lidos, retorne transactions: []
- SEMPRE use nÃºmeros positivos no campo amount

FORMATO JSON OBRIGATÃ“RIO:
{
  "documentType": "extrato_${fileType}",
  "confidence": 0.95,
  "summary": {
    "totalAmount": [SOMA TOTAL],
    "totalIncome": [SOMA receitas],
    "totalExpense": [SOMA despesas],
    "establishment": "Banco identificado",
    "period": "PerÃ­odo detectado",
    "fileFormat": "${fileType}"
  },
  "transactions": [    {
      "description": "DescriÃ§Ã£o clara da transaÃ§Ã£o",
      "amount": 150.50,
      "type": "expense",
      "category": "AlimentaÃ§Ã£o",
      "date": "2024-12-25",
      "confidence": 0.9
    }
  ]
}

CATEGORIAS VÃLIDAS (use exatamente esses nomes):

**RECEITAS:**
${INCOME_CATEGORIES.map(cat => `"${cat}"`).join(', ')}

**DESPESAS:**
${EXPENSE_CATEGORIES.map(cat => `"${cat}"`).join(', ')}

REGRAS DE CATEGORIZAÃ‡ÃƒO AUTOMÃTICA:
- MERCADO/SUPERMERCADO/EXTRA/CARREFOUR/PÃƒO DE AÃ‡ÃšCAR â†’ "Supermercado"
- POSTO/SHELL/PETROBRAS/IPIRANGA/BR â†’ "CombustÃ­vel"  
- FARMÃCIA/DROGARIA/RAIA/PACHECO â†’ "FarmÃ¡cia"
- CINEMA/NETFLIX/SPOTIFY/AMAZON PRIME â†’ "Streaming (Netflix, etc)"
- ENEL/SABESP/COMGÃS/NET/VIVO/TIM â†’ "Internet" ou "Luz" ou "Ãgua" ou "GÃ¡s"
- ESCOLA/FACULDADE/CURSO/LIVRARIA â†’ "Mensalidade Escolar" ou "Faculdade"
- SALÃƒO/BARBEARIA/O BOTICÃRIO/NATURA â†’ "Cabeleireiro" ou "CosmÃ©ticos"
- RECEITA FEDERAL/DETRAN/PREFEITURA â†’ "Impostos Diversos"
- BANCO/INVEST/POUPANÃ‡A/APLICAÃ‡ÃƒO â†’ "Investimentos" ou "PoupanÃ§a"
- EMPRÃ‰STIMO/FINANCIAMENTO/CARTÃƒO â†’ "CartÃ£o de CrÃ©dito" ou "Financiamentos"
- UBER/99/TAXI â†’ "Uber/99/TÃ¡xi"
- ALUGUEL â†’ "Aluguel"
- SALÃRIO/PAGAMENTO â†’ "SalÃ¡rio"
- Outros casos â†’ "NÃ£o Categorizado"  
- FARMÃCIA/DROGARIA/RAIA/PACHECO â†’ "SaÃºde"
- CINEMA/NETFLIX/SPOTIFY/AMAZON PRIME â†’ "Entretenimento"
- ENEL/SABESP/COMGÃS/NET/VIVO/TIM â†’ "HabitaÃ§Ã£o"
- ESCOLA/FACULDADE/CURSO/LIVRARIA â†’ "EducaÃ§Ã£o"
- SALÃƒO/BARBEARIA/O BOTICÃRIO/NATURA â†’ "Cuidados Pessoais"
- RECEITA FEDERAL/DETRAN/PREFEITURA â†’ "Impostos"
- BANCO/INVEST/POUPANÃ‡A/APLICAÃ‡ÃƒO â†’ "PoupanÃ§a e Investimentos"
- EMPRÃ‰STIMO/FINANCIAMENTO/CARTÃƒO â†’ "Pagamentos de DÃ­vidas"
- Outros casos â†’ "Outros"

CATEGORIZAÃ‡ÃƒO INTELIGENTE:
- Analise a DESCRIÃ‡ÃƒO da transaÃ§Ã£o
- Use palavras-chave para identificar a categoria
- Sempre atribua uma categoria vÃ¡lida da lista acima
- NÃƒO deixe "category" vazio ou com valores inexistentes
- "tecnologia": eletrÃ´nicos, software, internet, telefone
- "servicos": bancos, seguros, manutenÃ§Ãµes, taxas
- "compras": roupas, casa, presentes, diversos
- "transferencia": PIX, TED, transferÃªncias entre contas
- "investimento": aplicaÃ§Ãµes, resgates, corretora
- "receita": salÃ¡rio, freelance, vendas, aluguÃ©is
- "outros": quando nÃ£o se encaixa em nenhuma categoria

EXEMPLO DE SAÃDA VÃLIDA:
{
  "documentType": "extrato_csv",
  "confidence": 0.95,
  "summary": {
    "totalAmount": 2565.25,
    "totalIncome": 1500.00,
    "totalExpense": 1065.25,
    "establishment": "Banco do Brasil",
    "period": "Dezembro 2024",
    "fileFormat": "text/csv"
  },
  "transactions": [
    {
      "description": "Supermercado Extra",
      "amount": 285.90,
      "type": "expense",
      "category": "AlimentaÃ§Ã£o",
      "date": "2024-12-15",
      "confidence": 0.95
    }
  ]
}

IMPORTANTE: 
- Retorne APENAS o JSON vÃ¡lido, sem texto adicional
- Se nÃ£o encontrar dados vÃ¡lidos, retorne transactions: [] (array vazio)
- Sempre use valores numÃ©ricos (nÃ£o strings) para amounts
- Datas sempre no formato YYYY-MM-DD
- Types apenas "income" ou "expense"
`;

  try {
    console.log('[TEXT] Chamando Gemini para anÃ¡lise de texto...');
    console.log('[TEXT] Tamanho do prompt:', prompt.length);
    console.log('[TEXT] Primeiros 200 chars do conteÃºdo:', finalTextContent.substring(0, 200));

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 16,
        topP: 0.8,
        maxOutputTokens: 8192,
      }
    }; const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    ); if (!response.ok) {
      const errorText = await response.text();
      console.error('[TEXT] Erro Gemini:', response.status, errorText);
      return res.status(500).json({
        success: false,
        error: 'Erro na anÃ¡lise do arquivo',
        details: `Erro ${response.status}: ${errorText.substring(0, 200)}`,
        suggestions: [
          'ðŸ“¸ TIRE UMA FOTO da tela do extrato e envie',
          'ðŸ“‹ COPIE o texto do extrato e cole no chat',
          'ðŸ’¾ SALVE como PDF e tente novamente'
        ]
      });
    } const data = await response.json() as any;

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('[TEXT] Resposta invÃ¡lida do Gemini:', JSON.stringify(data));
      return res.status(500).json({
        success: false,
        error: 'Resposta invÃ¡lida da IA',
        details: 'A IA nÃ£o conseguiu processar o arquivo.',
        suggestions: [
          'ðŸ“¸ TIRE UMA FOTO da tela do extrato e envie',
          'ðŸ“‹ COPIE o texto do extrato e cole no chat',
          'ðŸ’¾ SALVE como PDF e tente novamente'
        ]
      });
    }

    const responseText = data.candidates[0].content.parts[0].text || '';

    console.log('[TEXT] Resposta Gemini recebida, tamanho:', responseText.length);
    console.log('[TEXT] Primeiros 200 chars:', responseText.substring(0, 200));

    // Processar resposta JSON similar ao OCR
    let textResult: any;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        textResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON nÃ£o encontrado na resposta');
      }      // Calcular totais corretamente
      const totalIncome = textResult.transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);

      const totalExpense = textResult.transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);

      textResult.summary.totalIncome = totalIncome;
      textResult.summary.totalExpense = totalExpense;
      textResult.summary.totalAmount = totalIncome + totalExpense; // Soma total movimentada
      textResult.summary.itemCount = textResult.transactions.length;

      console.log('[TEXT] Arquivo processado com sucesso!');
      console.log('[TEXT] TransaÃ§Ãµes encontradas:', textResult.transactions.length);
      console.log('[TEXT] Total receitas: R$', totalIncome.toFixed(2));
      console.log('[TEXT] Total despesas: R$', totalExpense.toFixed(2));

      // VALIDAÃ‡ÃƒO ULTRA TOLERANTE - SEMPRE RETORNAR SUCESSO
      const hasVeryFewTransactions = textResult.transactions.length === 0;
      const totalValue = totalIncome + totalExpense;

      console.log('[TEXT] ðŸ” ValidaÃ§Ã£o de resultado:');
      console.log('[TEXT] - TransaÃ§Ãµes:', textResult.transactions.length);
      console.log('[TEXT] - Total value:', totalValue);

      // SOMENTE criar estrutura vazia se literalmente nÃ£o houver nada, mas ainda retornar sucesso
      if (hasVeryFewTransactions) {
        console.log('[TEXT] âš ï¸ Nenhuma transaÃ§Ã£o encontrada - retornando estrutura vazia vÃ¡lida');
        textResult = {
          documentType: "arquivo_processado",
          confidence: 0.5,
          summary: {
            totalAmount: 0,
            totalIncome: 0,
            totalExpense: 0,
            establishment: "Arquivo analisado",
            period: "NÃ£o identificado",
            fileFormat: fileType,
            itemCount: 0
          },
          transactions: []
        };
      }

      // SELEÃ‡ÃƒO AUTOMÃTICA DE CATEGORIA PARA ARQUIVOS DE TEXTO
      let selectedCategory = 'NÃ£o Categorizado';
      if (textResult && textResult.transactions && textResult.transactions.length > 0) {
        selectedCategory = selectAutomaticCategory(textResult.transactions);
        console.log('[TEXT] ðŸŽ¯ Categoria selecionada automaticamente:', selectedCategory);
      }

      return res.status(200).json({
        success: true,
        data: textResult,
        selectedCategory: selectedCategory,
        availableCategories: {
          income: INCOME_CATEGORIES,
          expense: EXPENSE_CATEGORIES
        }
      });

    } catch (parseError: any) {
      console.error('[TEXT] Erro ao parsear JSON:', parseError.message);
      console.error('[TEXT] Resposta que causou erro:', responseText.substring(0, 500)); return res.status(500).json({
        success: false,
        error: 'Arquivo nÃ£o foi lido corretamente',
        details: 'NÃ£o foi possÃ­vel processar este formato de arquivo.',
        suggestions: [
          'ðŸ“¸ TIRE UMA FOTO da tela do extrato e envie',
          'ðŸ“‹ COPIE o texto do extrato e cole no chat',
          'ðŸ’¾ SALVE como PDF e tente novamente'
        ],
        needsManualReview: true
      });
    }

  } catch (error: any) {
    console.error('[TEXT] Erro inesperado:', error); return res.status(500).json({
      success: false,
      error: 'Erro ao processar arquivo',
      details: 'Formato de arquivo nÃ£o suportado.',
      suggestions: [
        'ðŸ“¸ TIRE UMA FOTO da tela do extrato e envie',
        'ðŸ“‹ COPIE o texto do extrato e cole no chat'
      ],
      needsManualReview: true
    });
  }
}


export default async function handler(req: any, res: any) {
  const startTime = Date.now();
  console.log('[OCR] ðŸš€ Iniciando processamento...', new Date().toISOString());

  // ðŸ”§ CORS HEADERS - CRÃTICO PARA CAPACITOR/MOBILE
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'MÃ©todo nÃ£o permitido' });
  }

  try {
    const { imageBase64: imageBase64Direct, image, fileName, fileType, csvData, textData, excelData } = req.body;

    // Accept both 'imageBase64' and 'image' field names for backward compatibility
    const imageBase64 = imageBase64Direct || image;

    console.log('[OCR] ðŸ“Š Dados recebidos:');
    console.log('[OCR] - Arquivo presente:', !!imageBase64);
    console.log('[OCR] - Nome:', fileName);
    console.log('[OCR] - Tipo:', fileType);
    console.log('[OCR] - Tamanho base64:', imageBase64?.length || 0);
    console.log('[OCR] - API Key vÃ¡lida:', !!GEMINI_API_KEY && GEMINI_API_KEY.startsWith('AIza'));
    console.log('[OCR] - Dados CSV:', !!csvData); console.log('[OCR] - Dados Excel:', !!excelData);

    // Se for CSV, XLS, XLSM ou TXT, processar como texto
    if (fileType && (fileType.includes('csv') || fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('text'))) {
      console.log('[OCR] Processando arquivo de texto/planilha...');
      return await processTextFile(req, res, csvData || textData, fileType, excelData);
    }

    if (!imageBase64) {
      console.log('[OCR] Erro: Arquivo nÃ£o fornecido');
      return res.status(400).json({ error: 'Arquivo nÃ£o fornecido' });
    }

    let processedImageBase64 = imageBase64;// Detectar tipo de arquivo pelo cabeÃ§alho base64
    let mimeType = "image/jpeg"; // padrÃ£o
    let modelToUse = "gemini-2.5-flash-lite"; // NOVO: Gemini 2.5 Flash Lite (lanÃ§ado julho 2025)

    console.log('[OCR] Primeiros 20 chars do base64:', imageBase64.substring(0, 20));

    if (imageBase64.startsWith('/9j/') || imageBase64.startsWith('iVBOR') || imageBase64.startsWith('R0lGOD')) {
      // Ã‰ uma imagem (JPEG, PNG, GIF)
      mimeType = imageBase64.startsWith('/9j/') ? "image/jpeg" :
        imageBase64.startsWith('iVBOR') ? "image/png" : "image/gif";
      console.log('[OCR] Detectado: Imagem', mimeType);
    } else if (imageBase64.startsWith('JVBERi0') || imageBase64.startsWith('data:application/pdf')) {
      // Ã‰ um PDF - USAR GEMINI 2.5 FLASH LITE (NOVO MODELO MAIS EFICIENTE)
      mimeType = "application/pdf";
      modelToUse = "gemini-2.5-flash-lite"; // NOVO: Gemini 2.5 Flash Lite para PDFs
      console.log('[OCR] ï¿½ PDF detectado - usando Gemini 2.5 Flash (modelo otimizado para PDFs)');
      console.log('[OCR] ðŸŽ¯ Modelo selecionado:', modelToUse);
    } else {
      console.log('[OCR] Tipo de arquivo nÃ£o reconhecido, assumindo imagem JPEG');
      console.log('[OCR] Base64 comeÃ§a com:', imageBase64.substring(0, 10));
    }

    console.log('[OCR] Usando modelo:', modelToUse);
    console.log('[OCR] MIME type:', mimeType);

    console.log('[OCR] API Key presente:', !!GEMINI_API_KEY);
    if (!GEMINI_API_KEY) {
      console.log('[OCR] Erro: API Key nÃ£o encontrada');
      return res.status(500).json({ error: 'API nÃ£o configurada' });

    }    // Prompt ultra especializado para PDFs financeiros brasileiros
    const prompt = `
VOCÃŠ Ã‰ UM ESPECIALISTA OCR EM DOCUMENTOS FINANCEIROS BRASILEIROS COM FOCO ABSOLUTO EM EXTRAIR TRANSAÃ‡Ã•ES.

ðŸŽ¯ OBJETIVO PRINCIPAL: ENCONTRAR E EXTRAIR **TODAS** AS TRANSAÃ‡Ã•ES FINANCEIRAS DO DOCUMENTO.

ðŸ” ESTRATÃ‰GIA DE ANÃLISE PARA PDFs:
1. ðŸ“– LEIA O DOCUMENTO INTEIRO, pÃ¡gina por pÃ¡gina se necessÃ¡rio
2. ðŸ”Ž PROCURE por QUALQUER padrÃ£o de transaÃ§Ã£o financeira
3. ðŸ’° IDENTIFIQUE valores em R$ (Reais) em TODO o documento
4. ðŸ“… ASSOCIE datas Ã s transaÃ§Ãµes encontradas
5. ðŸª CAPTURE nomes de estabelecimentos ou descriÃ§Ãµes

âš¡ INSTRUÃ‡Ã•ES ULTRA ESPECÃFICAS:

PROCURE ESPECIFICAMENTE POR:
1. ðŸ“ LISTA DE TRANSAÃ‡Ã•ES com datas e valores
2. ðŸ“ COMPRAS ou PAGAMENTOS com nome de estabelecimentos
3. ðŸ“ TRANSFERÃŠNCIAS recebidas ou enviadas (PIX, TED, DOC)
4. ðŸ“ DEPÃ“SITOS e SAQUES
5. ðŸ“ DÃ‰BITOS e CRÃ‰DITOS
6. ðŸ“ MOVIMENTAÃ‡Ã•ES de qualquer tipo
7. ðŸ“ FATURAS de cartÃ£o de crÃ©dito
8. ðŸ“ EXTRATOS bancÃ¡rios
9. ðŸ“ COMPROVANTES de pagamento
10. ðŸ§¾ **NOTAS FISCAIS**: Se houver MÃšLTIPLOS ITENS/PRODUTOS em uma nota, crie UMA TRANSAÃ‡ÃƒO SEPARADA para CADA ITEM
11. ðŸ›’ **CUPONS FISCAIS**: Extraia TODOS os produtos listados, cada um como transaÃ§Ã£o individual
12. ðŸª **RECIBOS DE COMPRA**: Se houver lista de produtos, extraia item por item

ðŸ›ï¸ PADRÃ•ES DE BANCOS BRASILEIROS:

ðŸ’œ NUBANK (PDF roxo):
- SeÃ§Ãµes: "COMPRAS", "TRANSFERÃŠNCIAS", "ASSINATURAS"
- Formato: "DD/MM ESTABELECIMENTO R$ VALOR"
- Exemplo: "15/12 UBER *TRIP R$ 23,45"

ðŸŸ¢ BRADESCO:
- Formato tabular: Data | HistÃ³rico | Valor | Saldo
- Indicadores: D (dÃ©bito), C (crÃ©dito)
- Exemplo: "15/12/2024 SAQUE BRADESCO D 100,00"

ðŸ”¶ ITAÃš:
- SeÃ§Ãµes: "LanÃ§amentos", "Compras e saques"
- Formato: Data | DescriÃ§Ã£o | Valor
- Exemplo: "15/12 SUPERMERCADO XYZ 127,89"

ðŸ”µ CAIXA ECONÃ”MICA:
- Tabela com colunas: Data | HistÃ³rico | Doc | Valor
- CÃ³digos D/C para dÃ©bito/crÃ©dito
- Exemplo: "15/12/2024 PIX ENVIADO D 50,00"

ðŸŸ¡ BANCO DO BRASIL:
- Layout tabular com cÃ³digos internos
- Formato: Data | HistÃ³rico | Documento | Valor
- Exemplo: "15/12/2024 COMPRA CARTAO 234 D 89,50"

ðŸŸ  SANTANDER:
- Extrato com seÃ§Ãµes de movimentaÃ§Ã£o
- Formato: Data | DescriÃ§Ã£o | Valor | Saldo
- Exemplo: "15/12 NETFLIX.COM 39,90"

ðŸ’š INTER:
- Layout moderno com blocos visuais
- Formato: Data | DescriÃ§Ã£o | Valor
- Exemplo: "15/12 MERCADO EXTRA 127,89"

ï¿½ BTG/C6/OUTROS DIGITAIS:
- Interfaces modernas com transaÃ§Ãµes organizadas
- Procure por listas de compras ou movimentaÃ§Ãµes

ï¿½ TÃ‰CNICAS DE EXTRAÃ‡ÃƒO:

PARA FATURAS DE CARTÃƒO:
- TODAS as transaÃ§Ãµes sÃ£o "expense" (despesas)
- Procure seÃ§Ãµes como "Resumo da fatura", "LanÃ§amentos", "Compras"
- Valores podem estar em formato brasileiro: 1.234,56
- Ignore: limite disponÃ­vel, valor mÃ­nimo, total da fatura

PARA EXTRATOS BANCÃRIOS:
- ENTRADAS (income): PIX recebido, depÃ³sito, TED recebida, estorno a favor
- SAÃDAS (expense): PIX enviado, saque, compra, transferÃªncia enviada
- Observe indicadores D/C ou sinais +/-

PARA COMPROVANTES:
- Foque no valor principal da transaÃ§Ã£o
- Capture data, valor e descriÃ§Ã£o/beneficiÃ¡rio
- Determine se Ã© entrada ou saÃ­da pelo contexto

PARA NOTAS FISCAIS COM MÃšLTIPLOS ITENS:
- ðŸŽ¯ **CRÃTICO**: Se a nota fiscal contÃ©m VÃRIOS PRODUTOS (ex: arroz, feijÃ£o, macarrÃ£o), crie UMA TRANSAÃ‡ÃƒO PARA CADA PRODUTO
- ðŸ“‹ Exemplo: Nota do supermercado com 5 itens = 5 transaÃ§Ãµes separadas
- ðŸ’¡ Use o valor individual de cada item, NÃƒO o total da nota
- ðŸ·ï¸ DescriÃ§Ã£o deve ser especÃ­fica: "Arroz Tipo 1 5kg", "FeijÃ£o Preto 1kg", etc.
- ðŸ“… Todos os itens da mesma nota terÃ£o a mesma data
- ðŸª Use o nome do estabelecimento + nome do produto na descriÃ§Ã£o

âš ï¸ REGRAS CRÃTICAS:

1. **SEMPRE** procure por padrÃµes como:
   - "DD/MM/AAAA DESCRIÃ‡ÃƒO R$ VALOR"
   - "DD/MM ESTABELECIMENTO VALOR"
   - "Data | HistÃ³rico | Valor"
   - Valores formatados como: R$ 123,45 ou 123,45 ou 1.234,56

2. **NÃƒO IGNORE** transaÃ§Ãµes pequenas (ex: R$ 5,00 Ã© vÃ¡lido)

3. **EXTRAIA TUDO** mesmo que pareÃ§a irrelevante

4. **USE CONTEXTO** para determinar se Ã© entrada ou saÃ­da

5. **SEMPRE** retorne ao menos UMA transaÃ§Ã£o se houver qualquer valor em R$ no documento

FORMATO DE SAÃDA OBRIGATÃ“RIO (JSON PURO):

{
  "documentType": "fatura_cartao" ou "extrato_bancario" ou "comprovante_pix" ou "nota_fiscal",
  "confidence": 0.95,
  "summary": {
    "totalAmount": [soma total de todas as transaÃ§Ãµes],
    "totalIncome": [soma apenas das entradas],
    "totalExpense": [soma apenas das saÃ­das],
    "establishment": "Nome do banco/instituiÃ§Ã£o identificado",
    "period": "PerÃ­odo identificado no documento"
  },
  "transactions": [
    {
      "description": "Nome claro do estabelecimento ou descriÃ§Ã£o da transaÃ§Ã£o",
      "amount": 127.89,
      "type": "expense",
      "category": "AlimentaÃ§Ã£o",
      "date": "2024-12-15",
      "confidence": 0.95
    }
  ]
}

ðŸ“‹ EXEMPLO PARA NOTA FISCAL COM 3 ITENS:
Se a nota fiscal tem:
- Arroz Tipo 1 (5kg) - R$ 24,90
- FeijÃ£o Preto (1kg) - R$ 8,50
- MacarrÃ£o Parafuso (500g) - R$ 4,20
TOTAL: R$ 37,60

DEVE RETORNAR 3 TRANSAÃ‡Ã•ES:
{
  "documentType": "nota_fiscal",
  "transactions": [
    {"description": "Supermercado Extra - Arroz Tipo 1 5kg", "amount": 24.90, "type": "expense", "category": "Supermercado", "date": "2024-10-01"},
    {"description": "Supermercado Extra - FeijÃ£o Preto 1kg", "amount": 8.50, "type": "expense", "category": "Supermercado", "date": "2024-10-01"},
    {"description": "Supermercado Extra - MacarrÃ£o Parafuso 500g", "amount": 4.20, "type": "expense", "category": "Supermercado", "date": "2024-10-01"}
  ]
}

CATEGORIAS DISPONÃVEIS (use exatamente esses nomes):

**RECEITAS:**
${INCOME_CATEGORIES.map(cat => `"${cat}"`).join(', ')}

**DESPESAS:**
${EXPENSE_CATEGORIES.map(cat => `"${cat}"`).join(', ')}

REGRAS DE CATEGORIZAÃ‡ÃƒO AUTOMÃTICA:
- MERCADO/SUPERMERCADO/EXTRA/CARREFOUR/PÃƒO DE AÃ‡ÃšCAR â†’ "Supermercado"
- POSTO/SHELL/PETROBRAS/IPIRANGA/BR â†’ "CombustÃ­vel"  
- FARMÃCIA/DROGARIA/RAIA/PACHECO â†’ "FarmÃ¡cia"
- CINEMA/NETFLIX/SPOTIFY/AMAZON PRIME â†’ "Streaming (Netflix, etc)"
- ENEL/SABESP/COMGÃS/NET/VIVO/TIM â†’ "Internet" ou "Luz" ou "Ãgua" ou "GÃ¡s"
- ESCOLA/FACULDADE/CURSO/LIVRARIA â†’ "Mensalidade Escolar" ou "Faculdade"
- SALÃƒO/BARBEARIA/O BOTICÃRIO/NATURA â†’ "Cabeleireiro" ou "CosmÃ©ticos"
- RECEITA FEDERAL/DETRAN/PREFEITURA â†’ "Impostos Diversos"
- BANCO/INVEST/POUPANÃ‡A/APLICAÃ‡ÃƒO â†’ "Investimentos" ou "PoupanÃ§a"
- EMPRÃ‰STIMO/FINANCIAMENTO/CARTÃƒO â†’ "CartÃ£o de CrÃ©dito" ou "Financiamentos"
- UBER/99/TAXI â†’ "Uber/99/TÃ¡xi"
- ALUGUEL â†’ "Aluguel"
- SALÃRIO/PAGAMENTO â†’ "SalÃ¡rio"
- Outros casos â†’ "NÃ£o Categorizado"

ðŸš¨ IMPORTANTE:
- Retorne APENAS o JSON vÃ¡lido, sem texto adicional
- SEMPRE tente extrair ao menos algumas transaÃ§Ãµes
- Se nÃ£o conseguir ler nada, retorne transactions: [] mas NUNCA falhe
- Use valores numÃ©ricos (nÃ£o strings) para amounts
- Datas no formato YYYY-MM-DD
- Types apenas "income" ou "expense"

ðŸ’¡ DICA FINAL: Este Ã© um PDF financeiro brasileiro real. SEMPRE hÃ¡ transaÃ§Ãµes para extrair. Seja persistente e examine cada linha, tabela ou seÃ§Ã£o do documento.`;

    console.log('[OCR] Preparando payload para Gemini...');

    const payload = {
      contents: [{
        parts: [{ text: prompt }, {
          inline_data: {
            mime_type: mimeType,
            data: processedImageBase64
          }
        }
        ]
      }], generationConfig: {
        temperature: 0.05, // ULTRA baixo para mÃ¡xima precisÃ£o em PDFs
        topK: mimeType === "application/pdf" ? 2 : 8,     // MUITO conservador para PDFs
        topP: mimeType === "application/pdf" ? 0.3 : 0.7,  // MUITO conservador para PDFs
        maxOutputTokens: mimeType === "application/pdf" ? 8192 : 6144, // MAIOR para PDFs complexos
      }
    }; console.log('[OCR] Chamando Gemini:', modelToUse);

    // Implementar retry para erros 503 (UNAVAILABLE)
    let retryCount = 0;
    const maxRetries = 2; // OTIMIZADO: Reduzido de 3 para 2 para acelerar
    let lastError = null;
    let ocrResult: any = null;
    let responseData: any = null;
    let processingComplete = false;

    while (retryCount <= maxRetries) {
      try {
        console.log(`[OCR] Tentativa ${retryCount + 1}/${maxRetries + 1}`);

        // TIMEOUT OTIMIZADO: 50 segundos por tentativa (aumentado para PDFs grandes)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('[OCR] â±ï¸ Timeout de 50s atingido, cancelando requisiÃ§Ã£o...');
          controller.abort();
        }, 50000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        console.log('[OCR] Resposta Gemini - Status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[OCR] Erro Gemini:', errorText);

          // Parse do erro para obter detalhes
          let errorDetails = null;
          try {
            errorDetails = JSON.parse(errorText);
          } catch (e) {
            console.warn('[OCR] NÃ£o foi possÃ­vel parsear erro como JSON');
          }

          // Verificar se Ã© erro 503 (UNAVAILABLE) - tentar novamente
          if (response.status === 503 ||
            (errorDetails?.error?.status === 'UNAVAILABLE') ||
            (errorDetails?.error?.code === 503)) {

            lastError = new Error(`Gemini API temporariamente indisponÃ­vel (503). Tentativa ${retryCount + 1}/${maxRetries + 1}`);
            console.log(`[OCR] Erro 503 detectado, aguardando antes da prÃ³xima tentativa...`);

            if (retryCount < maxRetries) {
              // Aguardar antes de tentar novamente (backoff exponencial)
              const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
              await new Promise(resolve => setTimeout(resolve, delay));
              retryCount++;
              continue;
            } else {
              // Ãšltimo retry falhado
              throw new Error('API Gemini indisponÃ­vel apÃ³s mÃºltiplas tentativas. Tente novamente em alguns minutos.');
            }
          }

          // Verificar se Ã© erro "The document has no pages" - PDF protegido
          if (errorText.includes('The document has no pages') ||
            errorText.includes('cannot be processed') ||
            errorText.includes('PDF parsing failed') ||
            errorText.includes('unsupported')) {
            console.log('[OCR] PDF nÃ£o suportado ou protegido detectado');
            return res.status(200).json({
              success: true,
              data: {
                documentType: "pdf_nÃ£o_suportado",
                confidence: 0.1,
                summary: {
                  totalAmount: 0,
                  totalIncome: 0,
                  totalExpense: 0,
                  establishment: "PDF nÃ£o processado",
                  period: "NÃ£o identificado",
                  itemCount: 0
                },
                transactions: []
              },
              metadata: {
                processedAt: new Date().toISOString(),
                tokensUsed: 0,
                processingMode: 'pdf_fallback',
                retryCount: 0,
                processingTimeMs: Date.now() - startTime,
                hadErrors: true,
                pdfError: true,
                fallbackUsed: true,
                userMessage: 'ðŸ“„ Este PDF nÃ£o pode ser processado automaticamente.\n\nðŸ’¡ **SoluÃ§Ãµes que funcionam 100%:**\n\nðŸ“¸ **Tire fotos das pÃ¡ginas importantes:**\nâ€¢ Abra o PDF no computador/celular\nâ€¢ Tire screenshots ou fotos das pÃ¡ginas\nâ€¢ Envie as imagens aqui\n\nðŸ–¼ï¸ **Converta para imagem:**\nâ€¢ Use ferramentas online gratuitas\nâ€¢ Converta PDF â†’ PNG/JPG\nâ€¢ Envie as imagens resultantes\n\nðŸ“‹ **MÃ©todo manual:**\nâ€¢ Copie o texto do PDF\nâ€¢ Cole aqui no chat\nâ€¢ Eu processarei como texto\n\nâœ… **Essas soluÃ§Ãµes sempre funcionam!**'
              }
            });
          }

          // Verificar outros tipos de erros relacionados a PDF
          const errorLower = errorText.toLowerCase();
          if (errorLower.includes('password') || errorLower.includes('encrypted') ||
            errorLower.includes('protected') || errorLower.includes('decrypt') ||
            errorLower.includes('permission') || errorLower.includes('secure') ||
            errorLower.includes('pdf') && (errorLower.includes('invalid') ||
              errorLower.includes('corrupt') || errorLower.includes('unsupported'))) {
            console.log('[OCR] PDF com problemas detectado - retornando fallback');
            return res.status(200).json({
              success: true,
              data: {
                documentType: "pdf_com_problemas",
                confidence: 0.1,
                summary: {
                  totalAmount: 0,
                  totalIncome: 0,
                  totalExpense: 0,
                  establishment: "PDF nÃ£o processado",
                  period: "NÃ£o identificado",
                  itemCount: 0
                },
                transactions: []
              },
              metadata: {
                processedAt: new Date().toISOString(),
                tokensUsed: 0,
                processingMode: 'pdf_error_fallback',
                retryCount: 0,
                processingTimeMs: Date.now() - startTime,
                hadErrors: true,
                pdfError: true,
                fallbackUsed: true,
                userMessage: 'ðŸ”’ **PDF protegido ou com problemas**\n\nâŒ Este PDF nÃ£o pode ser processado (protegido por senha, corrompido ou formato nÃ£o suportado).\n\nðŸ’¡ **SoluÃ§Ãµes garantidas:**\n\nðŸ“¸ **Screenshots funcionam sempre:**\nâ€¢ Abra o PDF e tire fotos da tela\nâ€¢ Envie as imagens uma por uma\nâ€¢ Processamento serÃ¡ 100% preciso\n\nðŸ”“ **Para PDFs protegidos:**\nâ€¢ Remova a proteÃ§Ã£o (se possÃ­vel)\nâ€¢ Tire screenshots das pÃ¡ginas\nâ€¢ Use "Imprimir como PDF" sem proteÃ§Ã£o\n\nðŸ“‹ **Ãšltima opÃ§Ã£o:**\nâ€¢ Copie o texto manualmente\nâ€¢ Cole aqui no chat\n\nâœ… **Qualquer imagem funciona perfeitamente!**'
              }
            });
          }

          // Verificar se Ã© erro de PDF corrompido ou invÃ¡lido especÃ­fico
          if (errorLower.includes('pdf') && (errorLower.includes('invalid') || errorLower.includes('corrupt'))) {
            console.log('[OCR] PDF corrompido detectado');
            return res.status(200).json({
              success: true,
              data: {
                documentType: "pdf_corrompido",
                confidence: 0.1,
                summary: {
                  totalAmount: 0,
                  totalIncome: 0,
                  totalExpense: 0,
                  establishment: "PDF corrompido",
                  period: "NÃ£o identificado",
                  itemCount: 0
                },
                transactions: []
              },
              metadata: {
                processedAt: new Date().toISOString(),
                tokensUsed: 0,
                processingMode: 'pdf_corrupt_fallback',
                retryCount: 0,
                processingTimeMs: Date.now() - startTime,
                hadErrors: true,
                pdfError: true,
                fallbackUsed: true,
                userMessage: 'ðŸ“„ **PDF corrompido detectado**\n\nâŒ Este arquivo PDF estÃ¡ corrompido ou em formato nÃ£o suportado.\n\nðŸ’¡ **SoluÃ§Ãµes:**\nâ€¢ Baixe o PDF novamente da fonte original\nâ€¢ Tire fotos das pÃ¡ginas importantes\nâ€¢ Solicite uma nova versÃ£o do documento\n\nðŸ“¸ **Screenshots sempre funcionam!**'
              }
            });
          }

          return res.status(500).json({
            error: 'Erro na API Gemini',
            details: errorText.substring(0, 500) // Limitar tamanho do erro
          });
        }

        // Se chegou atÃ© aqui, a requisiÃ§Ã£o foi bem-sucedida
        responseData = await response.json() as any;
        console.log('[OCR] Resposta Gemini recebida com sucesso na tentativa', retryCount + 1);

        if (!responseData.candidates || responseData.candidates.length === 0) {
          console.error('[OCR] Nenhum candidato na resposta - usando fallback');
          // Ao invÃ©s de retornar erro 500, criar estrutura vÃ¡lida
          ocrResult = {
            documentType: "documento_nÃ£o_identificado",
            confidence: 0.3,
            summary: {
              totalAmount: 0,
              totalIncome: 0,
              totalExpense: 0,
              establishment: "Documento nÃ£o processado",
              period: "NÃ£o identificado",
              itemCount: 0
            },
            transactions: []
          };
          processingComplete = true;
          break;
        }

        const candidate = responseData.candidates[0];
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
          console.error('[OCR] Estrutura de resposta invÃ¡lida - usando fallback');
          // Ao invÃ©s de retornar erro 500, criar estrutura vÃ¡lida
          ocrResult = {
            documentType: "documento_nÃ£o_identificado",
            confidence: 0.3,
            summary: {
              totalAmount: 0,
              totalIncome: 0,
              totalExpense: 0,
              establishment: "Documento nÃ£o processado",
              period: "NÃ£o identificado",
              itemCount: 0
            },
            transactions: []
          };
          processingComplete = true;
          break;
        }

        const responseText = candidate.content.parts[0].text;
        console.log('[OCR] Texto da resposta (primeiros 200 chars):', responseText.substring(0, 200));


        // Parse do JSON com fallback robusto e logs
        try {
          // Log completo do texto recebido
          console.log('[OCR] Texto completo recebido:', responseText);
          // Regex para capturar o maior JSON possÃ­vel
          const jsonRegex = /\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/g;
          const jsonMatches = responseText.match(jsonRegex);
          if (jsonMatches && jsonMatches.length > 0) {
            // Tentar o match mais longo primeiro (provavelmente o JSON completo)
            const sortedMatches = jsonMatches.sort((a: string, b: string) => b.length - a.length);
            ocrResult = JSON.parse(sortedMatches[0]);
            console.log('[OCR] JSON extraÃ­do com regex avanÃ§ado');
          } else {
            // Limpar possÃ­veis marcadores de cÃ³digo (fallback)
            const cleanText = responseText
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .replace(/^[^{]*/, '')
              .replace(/[^}]*$/, '')
              .trim();
            ocrResult = JSON.parse(cleanText);
            console.log('[OCR] JSON extraÃ­do com fallback cleanText');
          }

          // Validar estrutura bÃ¡sica
          if (!ocrResult.transactions || !Array.isArray(ocrResult.transactions)) {
            console.warn('[OCR] Estrutura invÃ¡lida: transactions nÃ£o Ã© array - criando estrutura padrÃ£o');
            ocrResult = {
              documentType: "extrato_bancario",
              confidence: 0.7,
              summary: {
                totalAmount: 0,
                totalIncome: 0,
                totalExpense: 0,
                establishment: "NÃ£o identificado",
                period: "NÃ£o identificado",
                itemCount: 0
              },
              transactions: []
            };
          }

          // Validar e corrigir campos obrigatÃ³rios
          ocrResult.transactions = ocrResult.transactions.map((transaction: any) => {
            if (!transaction.type || (transaction.type !== 'income' && transaction.type !== 'expense')) {
              transaction.type = 'expense';
            }
            if (typeof transaction.amount === 'string') {
              transaction.amount = parseFloat(transaction.amount.replace(/[R$\s,]/g, '').replace(',', '.')) || 0;
            }
            if (!transaction.confidence) {
              transaction.confidence = 0.8;
            }
            return transaction;
          });

          // Atualizar summary
          if (!ocrResult.summary) {
            ocrResult.summary = {};
          }
          const totalIncome = ocrResult.transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          const totalExpense = ocrResult.transactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          ocrResult.summary.totalIncome = totalIncome;
          ocrResult.summary.totalExpense = totalExpense;
          ocrResult.summary.totalAmount = totalIncome + totalExpense;
          ocrResult.summary.itemCount = ocrResult.transactions.length;

          console.log('[OCR] JSON parseado com sucesso!');
          console.log('[OCR] TransaÃ§Ãµes encontradas:', ocrResult.transactions.length);
          console.log('[OCR] Total receitas:', totalIncome);
          console.log('[OCR] Total despesas:', totalExpense);

          // VALIDAÃ‡ÃƒO ULTRA TOLERANTE - SEMPRE PROCESSAR SE HOUVER ALGUM DADO
          const hasNoTransactions = ocrResult.transactions.length === 0;
          const totalValue = totalIncome + totalExpense;

          // Log para debugging
          console.log('[OCR] ðŸ” ValidaÃ§Ã£o de qualidade:');
          console.log('[OCR] - TransaÃ§Ãµes encontradas:', ocrResult.transactions.length);
          console.log('[OCR] - Total value:', totalValue);
          console.log('[OCR] - Has no transactions:', hasNoTransactions);

          // SOMENTE rejeitar se literalmente NÃƒO houver nenhuma transaÃ§Ã£o
          if (hasNoTransactions) {
            console.log('[OCR] âš ï¸ Nenhuma transaÃ§Ã£o encontrada - mas ainda assim retornando estrutura vÃ¡lida');
            // NÃƒO retornar erro 400, retornar estrutura vazia mas vÃ¡lida
            ocrResult = {
              documentType: "documento_processado",
              confidence: 0.5,
              summary: {
                totalAmount: 0,
                totalIncome: 0,
                totalExpense: 0,
                establishment: "Documento analisado",
                period: "NÃ£o identificado",
                itemCount: 0
              },
              transactions: []
            };
          }

          // Se chegou atÃ© aqui, o processamento foi bem-sucedido
          processingComplete = true;
          break;

        } catch (parseError: any) {
          console.error('[OCR] Erro ao parsear JSON:', parseError.message);
          console.error('[OCR] Texto problemÃ¡tico:', responseText.substring(0, 300));

          // Fallback alternativo: tentar extrair valores monetÃ¡rios do texto
          const amountRegex = /R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+,\d{2}|\d+\.\d{2})/g;
          let amounts = [];
          let match;
          while ((match = amountRegex.exec(responseText)) !== null) {
            const amountStr = match[1].replace('.', '').replace(',', '.');
            amounts.push(parseFloat(amountStr));
          }
          if (amounts.length > 0) {
            ocrResult = {
              documentType: "extrato_recuperado",
              confidence: 0.6,
              summary: {
                totalAmount: amounts.reduce((sum, val) => sum + val, 0),
                totalIncome: 0,
                totalExpense: amounts.reduce((sum, val) => sum + val, 0),
                establishment: fileName?.includes('nubank') ? "Nubank" : "Documento financeiro",
                period: new Date().toISOString().substring(0, 7),
                itemCount: amounts.length
              },
              transactions: amounts.map((amount, idx) => ({
                description: `TransaÃ§Ã£o ${idx + 1}`,
                amount: amount,
                type: "expense",
                category: "Outros",
                date: new Date().toISOString().substring(0, 10),
                confidence: 0.5
              }))
            };
            console.log('[OCR] âœ… Recuperadas', amounts.length, 'transaÃ§Ãµes via mÃ©todo alternativo');
            processingComplete = true;
            break;
          }

          // Ao invÃ©s de falhar completamente, criar resultado vazio mas vÃ¡lido
          console.log('[OCR] Criando estrutura de fallback devido a erro de parsing');
          ocrResult = {
            documentType: "documento_nÃ£o_processado",
            confidence: 0.5,
            summary: {
              totalAmount: 0,
              totalIncome: 0,
              totalExpense: 0,
              establishment: "Erro de processamento",
              period: "NÃ£o identificado",
              itemCount: 0
            },
            transactions: []
          };
          processingComplete = true;
          break;
        }

      } catch (requestError: any) {
        lastError = requestError;
        console.error(`[OCR] Erro na tentativa ${retryCount + 1}:`, requestError.message);

        // Verificar se Ã© erro de timeout (AbortController)
        if (requestError.name === 'AbortError') {
          console.log(`[OCR] â±ï¸ Timeout de 50s atingido na tentativa ${retryCount + 1}`);
          lastError = new Error(`Timeout: RequisiÃ§Ã£o demorou mais que 50 segundos`);
        }

        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`[OCR] Aguardando ${delay}ms antes da prÃ³xima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retryCount++;
          continue;
        } else {
          // Ãšltimo retry falhado
          throw new Error(`Falha apÃ³s ${maxRetries + 1} tentativas: ${requestError.message}`);
        }
      }
    }

    // VALIDAÃ‡ÃƒO CRÃTICA: Verificar se o processamento foi realmente bem-sucedido
    if (!processingComplete) {
      console.error('[OCR] âŒ Processamento falhou - nÃ£o foi concluÃ­do');
      // Garantir que ocrResult exista mesmo em caso de falha
      ocrResult = {
        documentType: "documento_nÃ£o_identificado",
        confidence: 0.3,
        summary: {
          totalAmount: 0,
          totalIncome: 0,
          totalExpense: 0,
          establishment: "Erro de processamento",
          period: "NÃ£o identificado",
          itemCount: 0
        },
        transactions: []
      };
      processingComplete = true; // Marcar como processado para continuar
    }

    // Garantir que ocrResult sempre exista
    if (!ocrResult) {
      console.error('[OCR] âŒ ocrResult ainda Ã© null - criando estrutura de emergÃªncia');
      ocrResult = {
        documentType: "documento_nÃ£o_processado",
        confidence: 0.1,
        summary: {
          totalAmount: 0,
          totalIncome: 0,
          totalExpense: 0,
          establishment: "Sistema nÃ£o conseguiu processar",
          period: "NÃ£o identificado",
          itemCount: 0
        },
        transactions: []
      };
    }

    // Se saiu do loop, o processamento foi concluÃ­do (com ou sem dados)
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    console.log('[OCR] âœ… Processamento concluÃ­do!');
    console.log('[OCR] â±ï¸ Tempo total:', processingTime, 'ms');
    console.log('[OCR] ðŸ“Š TransaÃ§Ãµes encontradas:', ocrResult?.transactions?.length || 0);

    // SELEÃ‡ÃƒO AUTOMÃTICA DE CATEGORIA
    let selectedCategory = 'NÃ£o Categorizado';
    if (ocrResult && ocrResult.transactions && ocrResult.transactions.length > 0) {
      selectedCategory = selectAutomaticCategory(ocrResult.transactions);
      console.log('[OCR] ðŸŽ¯ Categoria selecionada automaticamente:', selectedCategory);
    }

    // Sempre retornar sucesso, mesmo que com dados vazios
    return res.status(200).json({
      success: true,
      data: ocrResult,
      selectedCategory: selectedCategory, // â† NOVA PROPRIEDADE PARA A CATEGORIA SELECIONADA
      availableCategories: {
        income: INCOME_CATEGORIES,
        expense: EXPENSE_CATEGORIES
      },
      metadata: {
        processedAt: new Date().toISOString(),
        tokensUsed: responseData?.usageMetadata?.totalTokenCount || 0,
        processingMode: 'gemini',
        retryCount: retryCount,
        processingTimeMs: processingTime,
        hadErrors: (ocrResult?.transactions?.length || 0) === 0,
        fallbackUsed: ocrResult?.confidence < 0.8,
        selectedCategory: selectedCategory
      }
    });

  } catch (error: any) {
    console.error('[OCR] Erro geral:', error.message);
    console.error('[OCR] Stack:', error.stack);

    // Ao invÃ©s de retornar erro 500, sempre retornar dados vÃ¡lidos
    const fallbackResult = {
      documentType: "documento_com_erro",
      confidence: 0.1,
      summary: {
        totalAmount: 0,
        totalIncome: 0,
        totalExpense: 0,
        establishment: "Erro no processamento",
        period: "NÃ£o identificado",
        itemCount: 0
      },
      transactions: []
    };

    return res.status(200).json({
      success: true,
      data: fallbackResult,
      metadata: {
        processedAt: new Date().toISOString(),
        tokensUsed: 0,
        processingMode: 'fallback',
        retryCount: 0,
        processingTimeMs: Date.now() - startTime,
        hadErrors: true,
        errorDetails: error.message,
        fallbackUsed: true
      }
    });
  }
}




