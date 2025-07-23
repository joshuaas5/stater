// API OCR funcional - baseada no teste que funcionou
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDTTPO0otruHVzh7bXsi7MCyG674P03758";

// Categorias exatas do sistema (importadas do frontend)
const INCOME_CATEGORIES = [
  'Salário', 'Salário 13º', 'Férias', 'PLR/Participação nos Lucros', 'Comissões', 'Hora Extra',
  'Renda de Trabalho Autônomo', 'Freelance', 'Consultoria', 'Prestação de Serviços', 'Venda de Produtos',
  'E-commerce', 'Investimentos', 'Dividendos', 'Juros de Aplicações', 'Rendimentos CDB', 'Rendimentos Poupança',
  'Venda de Ações', 'Fundos Imobiliários', 'Renda de Aluguel', 'Renda de Pensão', 'Aposentadoria',
  'Auxílios Governamentais', 'Bolsa Família', 'Auxílio Brasil', 'Seguro Desemprego', 'FGTS', 'Restituição de IR',
  'Presentes em Dinheiro', 'Vendas Ocasionais', 'Venda de Veículo', 'Venda de Imóvel', 'Cashback', 'Reembolsos',
  'Prêmios e Sorteios', 'Renda Extra', 'Monetização Online', 'YouTube/Criador de Conteúdo', 'Afiliados',
  'Royalties', 'Outras Receitas'
];

const EXPENSE_CATEGORIES = [
  // Habitação
  'Aluguel', 'Financiamento Imobiliário', 'Condomínio', 'IPTU', 'Luz', 'Água', 'Gás', 'Internet', 'TV por Assinatura',
  'Telefone Fixo', 'Manutenção da Casa', 'Móveis e Decoração', 'Eletrodomésticos',
  // Transporte
  'Combustível', 'Transporte Público', 'Uber/99/Táxi', 'Estacionamento', 'Pedágio', 'Manutenção do Veículo',
  'Seguro do Veículo', 'IPVA', 'Licenciamento', 'Multas de Trânsito', 'Financiamento do Veículo',
  // Alimentação
  'Supermercado', 'Açougue/Peixaria', 'Padaria', 'Feira', 'Restaurantes', 'Lanchonetes', 'Fast Food', 'Delivery',
  'Bebidas', 'Doces e Sobremesas',
  // Saúde
  'Plano de Saúde', 'Consultas Médicas', 'Exames', 'Medicamentos', 'Farmácia', 'Dentista', 'Psicólogo',
  'Fisioterapia', 'Academia', 'Suplementos',
  // Educação
  'Mensalidade Escolar', 'Faculdade', 'Cursos Online', 'Livros', 'Material Escolar', 'Cursos de Idiomas', 'Certificações',
  // Entretenimento
  'Cinema', 'Teatro', 'Shows', 'Streaming (Netflix, etc)', 'Jogos', 'Viagens', 'Hotéis', 'Passeios', 'Bares e Baladas', 'Hobbies',
  // Cuidados Pessoais
  'Cabeleireiro', 'Manicure/Pedicure', 'Estética', 'Roupas', 'Calçados', 'Acessórios', 'Perfumes', 'Cosméticos', 'Produtos de Higiene',
  // Tecnologia
  'Celular (Conta)', 'Aplicativos', 'Software', 'Equipamentos Eletrônicos', 'Computador', 'Acessórios Tech',
  // Financeiro
  'Pagamentos de Dívidas', 'Cartão de Crédito', 'Financiamentos', 'Empréstimos', 'Juros e Multas', 'Anuidade do Cartão', 'Tarifa Bancária',
  // Investimentos e Poupança
  'Poupança', 'Investimentos', 'Previdência Privada', 'Seguro de Vida', 'Capitalização',
  // Impostos e Taxas
  'Imposto de Renda', 'Impostos Diversos', 'Taxas Governamentais', 'Cartório', 'Despachante',
  // Família e Pets
  'Presentes', 'Doações', 'Mesada dos Filhos', 'Pet Shop', 'Veterinário', 'Ração para Pets',
  // Trabalho
  'Transporte para Trabalho', 'Almoço no Trabalho', 'Material de Trabalho', 'Uniformes',
  // Casa e Manutenção
  'Ferramentas', 'Jardinagem', 'Limpeza', 'Segurança', 'Reformas',
  // Emergências
  'Gastos Médicos de Emergência', 'Reparos Emergenciais', 'Gastos Inesperados',
  // Outros
  'Despesas Diversas', 'Não Categorizado'
];

// Função para selecionar categoria automaticamente baseada nas transações
function selectAutomaticCategory(transactions: any[]): string {
  if (!transactions || transactions.length === 0) {
    return 'Não Categorizado';
  }

  // Contar frequência de categorias
  const categoryCount: { [key: string]: number } = {};
  const categoryValue: { [key: string]: number } = {};

  transactions.forEach(transaction => {
    const category = transaction.category || 'Não Categorizado';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
    categoryValue[category] = (categoryValue[category] || 0) + (transaction.amount || 0);
  });

  // Encontrar categoria mais relevante (por valor total)
  let maxValue = 0;
  let selectedCategory = 'Não Categorizado';

  Object.entries(categoryValue).forEach(([category, value]) => {
    if (value > maxValue) {
      maxValue = value;
      selectedCategory = category;
    }
  });

  // Verificar se a categoria selecionada existe nas categorias válidas
  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  if (!allCategories.includes(selectedCategory)) {
    // Se não existe, tentar mapear para uma categoria válida baseada na descrição
    const firstTransaction = transactions[0];
    if (firstTransaction && firstTransaction.description) {
      const description = firstTransaction.description.toLowerCase();
      
      // Mapeamento inteligente baseado em palavras-chave
      if (description.includes('supermercado') || description.includes('mercado') || description.includes('extra') || description.includes('carrefour')) {
        return 'Supermercado';
      }
      if (description.includes('combustível') || description.includes('posto') || description.includes('gasolina') || description.includes('álcool')) {
        return 'Combustível';
      }
      if (description.includes('restaurante') || description.includes('lanchonete') || description.includes('delivery')) {
        return 'Restaurantes';
      }
      if (description.includes('farmácia') || description.includes('medicamento') || description.includes('remédio')) {
        return 'Farmácia';
      }
      if (description.includes('uber') || description.includes('99') || description.includes('taxi')) {
        return 'Uber/99/Táxi';
      }
      if (description.includes('netflix') || description.includes('spotify') || description.includes('streaming')) {
        return 'Streaming (Netflix, etc)';
      }
      if (description.includes('aluguel')) {
        return 'Aluguel';
      }
      if (description.includes('salário') || description.includes('pagamento')) {
        return 'Salário';
      }
      if (description.includes('pix recebido') || description.includes('transferência recebida')) {
        return 'Outras Receitas';
      }
    }
    
    return 'Não Categorizado';
  }

  return selectedCategory;
}

// Função para processar PDF com senha
async function processPdfWithPassword(pdfBase64: string, password?: string): Promise<string> {
  try {
    console.log('[OCR] Processando PDF, senha fornecida:', !!password);
    
    // Se não tem senha, tentar processar normalmente
    if (!password) {
      return pdfBase64;
    }

    // Importar pdf-lib dinamicamente
    const { PDFDocument } = await import('pdf-lib');
    
    // Converter base64 para buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    
    try {
      // Tentar carregar o PDF (pdf-lib não suporta senha diretamente)
      // Se der erro, é porque precisa de senha
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      
      // Se chegou aqui, não precisava de senha ou já estava desbloqueado
      console.log('[OCR] PDF carregado sem problemas');
      return pdfBase64;
      
    } catch (loadError: any) {
      console.log('[OCR] Erro ao carregar PDF:', loadError.message);
      
      // Se é erro relacionado a criptografia/senha
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

// Função para processar PDF protegido por senha
async function processProtectedPdf(pdfBase64: string, password: string): Promise<string> {
  try {
    console.log('[OCR] Tentando desbloquear PDF com senha...');
    
    // Converter base64 para buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    
    // Para PDFs protegidos por senha, vamos tentar uma abordagem mais simples
    // Primeiro, tentar verificar se o PDF é realmente protegido
    const pdfHeader = pdfBuffer.toString('ascii', 0, 100);
    
    if (pdfHeader.includes('Encrypt')) {
      console.log('[OCR] PDF protegido detectado, mas não conseguimos desbloquear no servidor');
      throw new Error('NEEDS_PASSWORD');
    }
    
    // Se chegou aqui, assumir que o PDF não é protegido ou já foi processado
    return pdfBase64;
    
  } catch (error: any) {
    console.error('[OCR] Erro ao processar PDF:', error.message);
    
    if (error.message === 'NEEDS_PASSWORD') {
      throw error;
    }
    
    throw new Error('PDF_PROCESSING_ERROR');
  }
}

// Função para processar arquivos de texto (CSV, TXT, Excel)
async function processTextFile(req: any, res: any, textContent: string, fileType: string, excelData?: string) {
  console.log('[TEXT] Processando arquivo de texto/planilha...');
  console.log('[TEXT] Tipo:', fileType);
  console.log('[TEXT] Tamanho do conteúdo texto:', textContent?.length || 0);
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
        error: 'Arquivo não foi lido corretamente',
        suggestions: [
          '📸 TIRE UMA FOTO da planilha na tela e envie',
          '📋 COPIE os dados da planilha e cole no chat',
          '💾 SALVE como PDF e envie'
        ],
        needsManualReview: true
      });
    }
  }
  
  if (!finalTextContent || finalTextContent.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Conteúdo do arquivo vazio',
      details: 'O arquivo não contém dados válidos para processamento.'
    });
  }  const prompt = `
VOCÊ É UM ESPECIALISTA EM ANÁLISE DE DADOS FINANCEIROS BRASILEIROS.

ANALISE ESTE CONTEÚDO DE ARQUIVO FINANCEIRO e extraia TODAS as transações com MÁXIMA PRECISÃO:

FORMATO DO ARQUIVO: ${fileType}
CONTEÚDO A ANALISAR:
${finalTextContent}

INSTRUÇÕES ESPECÍFICAS POR FORMATO:

🗂️ PARA CSV/EXCEL:
- Procure colunas com: Data, Descrição/Histórico, Valor/Débito/Crédito, Tipo
- IGNORE linhas de cabeçalho, totais, saldos, rodapés
- Valores sempre POSITIVOS no JSON (ex: -150.50 vira 150.50)
- Determine tipo pela coluna ou contexto da descrição
- Aceite separadores: vírgula (,) ou ponto e vírgula (;)
- Formatos de valor: "1234.56", "1.234,56", "R$ 1.234,56", "-1234,56"

📄 PARA ARQUIVOS TXT:
- Procure padrões: DD/MM/AAAA + DESCRIÇÃO + VALOR
- Valores com + ou sem sinal = ENTRADA (income)
- Valores com - = SAÍDA (expense)
- PIX enviado/TED = expense, PIX recebido = income
- Ignore linhas de "SALDO", "TOTAL", "ANTERIOR"

🏦 REGRAS PARA BANCOS BRASILEIROS:
- Banco do Brasil: (+) = income, (-) = expense
- Bradesco: DÉBITO/D = expense, CRÉDITO/C = income  
- Caixa: D = expense, C = income
- Nubank: "enviado"/"pago" = expense, "recebido" = income
- Itaú: (+) = income, (-) = expense
- Transferências: analise direção ("para" = expense, "de" = income)

VALIDAÇÃO OBRIGATÓRIA:
- NÃO extraia se só houver valores < R$ 1,00
- Extratos típicos têm MÚLTIPLAS transações variadas
- Se poucos dados válidos, retorne transactions: []
- SEMPRE use números positivos no campo amount

FORMATO JSON OBRIGATÓRIO:
{
  "documentType": "extrato_${fileType}",
  "confidence": 0.95,
  "summary": {
    "totalAmount": [SOMA TOTAL],
    "totalIncome": [SOMA receitas],
    "totalExpense": [SOMA despesas],
    "establishment": "Banco identificado",
    "period": "Período detectado",
    "fileFormat": "${fileType}"
  },
  "transactions": [    {
      "description": "Descrição clara da transação",
      "amount": 150.50,
      "type": "expense",
      "category": "Alimentação",
      "date": "2024-12-25",
      "confidence": 0.9
    }
  ]
}

CATEGORIAS VÁLIDAS (use exatamente esses nomes):

**RECEITAS:**
${INCOME_CATEGORIES.map(cat => `"${cat}"`).join(', ')}

**DESPESAS:**
${EXPENSE_CATEGORIES.map(cat => `"${cat}"`).join(', ')}

REGRAS DE CATEGORIZAÇÃO AUTOMÁTICA:
- MERCADO/SUPERMERCADO/EXTRA/CARREFOUR/PÃO DE AÇÚCAR → "Supermercado"
- POSTO/SHELL/PETROBRAS/IPIRANGA/BR → "Combustível"  
- FARMÁCIA/DROGARIA/RAIA/PACHECO → "Farmácia"
- CINEMA/NETFLIX/SPOTIFY/AMAZON PRIME → "Streaming (Netflix, etc)"
- ENEL/SABESP/COMGÁS/NET/VIVO/TIM → "Internet" ou "Luz" ou "Água" ou "Gás"
- ESCOLA/FACULDADE/CURSO/LIVRARIA → "Mensalidade Escolar" ou "Faculdade"
- SALÃO/BARBEARIA/O BOTICÁRIO/NATURA → "Cabeleireiro" ou "Cosméticos"
- RECEITA FEDERAL/DETRAN/PREFEITURA → "Impostos Diversos"
- BANCO/INVEST/POUPANÇA/APLICAÇÃO → "Investimentos" ou "Poupança"
- EMPRÉSTIMO/FINANCIAMENTO/CARTÃO → "Cartão de Crédito" ou "Financiamentos"
- UBER/99/TAXI → "Uber/99/Táxi"
- ALUGUEL → "Aluguel"
- SALÁRIO/PAGAMENTO → "Salário"
- Outros casos → "Não Categorizado"  
- FARMÁCIA/DROGARIA/RAIA/PACHECO → "Saúde"
- CINEMA/NETFLIX/SPOTIFY/AMAZON PRIME → "Entretenimento"
- ENEL/SABESP/COMGÁS/NET/VIVO/TIM → "Habitação"
- ESCOLA/FACULDADE/CURSO/LIVRARIA → "Educação"
- SALÃO/BARBEARIA/O BOTICÁRIO/NATURA → "Cuidados Pessoais"
- RECEITA FEDERAL/DETRAN/PREFEITURA → "Impostos"
- BANCO/INVEST/POUPANÇA/APLICAÇÃO → "Poupança e Investimentos"
- EMPRÉSTIMO/FINANCIAMENTO/CARTÃO → "Pagamentos de Dívidas"
- Outros casos → "Outros"

CATEGORIZAÇÃO INTELIGENTE:
- Analise a DESCRIÇÃO da transação
- Use palavras-chave para identificar a categoria
- Sempre atribua uma categoria válida da lista acima
- NÃO deixe "category" vazio ou com valores inexistentes
- "tecnologia": eletrônicos, software, internet, telefone
- "servicos": bancos, seguros, manutenções, taxas
- "compras": roupas, casa, presentes, diversos
- "transferencia": PIX, TED, transferências entre contas
- "investimento": aplicações, resgates, corretora
- "receita": salário, freelance, vendas, aluguéis
- "outros": quando não se encaixa em nenhuma categoria

EXEMPLO DE SAÍDA VÁLIDA:
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
      "category": "Alimentação",
      "date": "2024-12-15",
      "confidence": 0.95
    }
  ]
}

IMPORTANTE: 
- Retorne APENAS o JSON válido, sem texto adicional
- Se não encontrar dados válidos, retorne transactions: [] (array vazio)
- Sempre use valores numéricos (não strings) para amounts
- Datas sempre no formato YYYY-MM-DD
- Types apenas "income" ou "expense"
`;

  try {
    console.log('[TEXT] Chamando Gemini para análise de texto...');
    console.log('[TEXT] Tamanho do prompt:', prompt.length);
    console.log('[TEXT] Primeiros 200 chars do conteúdo:', finalTextContent.substring(0, 200));
    
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
    };    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );if (!response.ok) {
      const errorText = await response.text();
      console.error('[TEXT] Erro Gemini:', response.status, errorText);
      return res.status(500).json({ 
        success: false,
        error: 'Erro na análise do arquivo',
        details: `Erro ${response.status}: ${errorText.substring(0, 200)}`,
        suggestions: [
          '📸 TIRE UMA FOTO da tela do extrato e envie',
          '📋 COPIE o texto do extrato e cole no chat',
          '💾 SALVE como PDF e tente novamente'
        ]
      });
    }    const data = await response.json() as any;
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('[TEXT] Resposta inválida do Gemini:', JSON.stringify(data));
      return res.status(500).json({
        success: false,
        error: 'Resposta inválida da IA',
        details: 'A IA não conseguiu processar o arquivo.',
        suggestions: [
          '📸 TIRE UMA FOTO da tela do extrato e envie',
          '📋 COPIE o texto do extrato e cole no chat',
          '💾 SALVE como PDF e tente novamente'
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
        throw new Error('JSON não encontrado na resposta');
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
      console.log('[TEXT] Transações encontradas:', textResult.transactions.length);
      console.log('[TEXT] Total receitas: R$', totalIncome.toFixed(2));
      console.log('[TEXT] Total despesas: R$', totalExpense.toFixed(2));

      // VALIDAÇÃO ULTRA TOLERANTE - SEMPRE RETORNAR SUCESSO
      const hasVeryFewTransactions = textResult.transactions.length === 0;
      const totalValue = totalIncome + totalExpense;
      
      console.log('[TEXT] 🔍 Validação de resultado:');
      console.log('[TEXT] - Transações:', textResult.transactions.length);
      console.log('[TEXT] - Total value:', totalValue);
      
      // SOMENTE criar estrutura vazia se literalmente não houver nada, mas ainda retornar sucesso
      if (hasVeryFewTransactions) {
        console.log('[TEXT] ⚠️ Nenhuma transação encontrada - retornando estrutura vazia válida');
        textResult = {
          documentType: "arquivo_processado",
          confidence: 0.5,
          summary: {
            totalAmount: 0,
            totalIncome: 0,
            totalExpense: 0,
            establishment: "Arquivo analisado",
            period: "Não identificado",
            fileFormat: fileType,
            itemCount: 0
          },
          transactions: []
        };
      }

      // SELEÇÃO AUTOMÁTICA DE CATEGORIA PARA ARQUIVOS DE TEXTO
      let selectedCategory = 'Não Categorizado';
      if (textResult && textResult.transactions && textResult.transactions.length > 0) {
        selectedCategory = selectAutomaticCategory(textResult.transactions);
        console.log('[TEXT] 🎯 Categoria selecionada automaticamente:', selectedCategory);
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
      console.error('[TEXT] Resposta que causou erro:', responseText.substring(0, 500));        return res.status(500).json({
        success: false,
        error: 'Arquivo não foi lido corretamente',
        details: 'Não foi possível processar este formato de arquivo.',
        suggestions: [
          '📸 TIRE UMA FOTO da tela do extrato e envie',
          '📋 COPIE o texto do extrato e cole no chat',
          '💾 SALVE como PDF e tente novamente'
        ],
        needsManualReview: true
      });
    }

  } catch (error: any) {
    console.error('[TEXT] Erro inesperado:', error);    return res.status(500).json({
      success: false,
      error: 'Erro ao processar arquivo',
      details: 'Formato de arquivo não suportado.',
      suggestions: [
        '📸 TIRE UMA FOTO da tela do extrato e envie',
        '📋 COPIE o texto do extrato e cole no chat'
      ],
      needsManualReview: true
    });
  }
}

export default async function handler(req: any, res: any) {
  const startTime = Date.now();
  console.log('[OCR] 🚀 Iniciando processamento...', new Date().toISOString());
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }  try {
    const { imageBase64, fileName, fileType, csvData, textData, excelData } = req.body;
    
    console.log('[OCR] 📊 Dados recebidos:');
    console.log('[OCR] - Arquivo presente:', !!imageBase64);
    console.log('[OCR] - Nome:', fileName);
    console.log('[OCR] - Tipo:', fileType);
    console.log('[OCR] - Tamanho base64:', imageBase64?.length || 0);
    console.log('[OCR] - API Key válida:', !!GEMINI_API_KEY && GEMINI_API_KEY.startsWith('AIza'));
    console.log('[OCR] - Dados CSV:', !!csvData);    console.log('[OCR] - Dados Excel:', !!excelData);
    
    // Se for CSV, XLS, XLSM ou TXT, processar como texto
    if (fileType && (fileType.includes('csv') || fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('text'))) {
      console.log('[OCR] Processando arquivo de texto/planilha...');
      return await processTextFile(req, res, csvData || textData, fileType, excelData);
    }
    
    if (!imageBase64) {
      console.log('[OCR] Erro: Arquivo não fornecido');
      return res.status(400).json({ error: 'Arquivo não fornecido' });
    }

    let processedImageBase64 = imageBase64;// Detectar tipo de arquivo pelo cabeçalho base64
    let mimeType = "image/jpeg"; // padrão
    let modelToUse = "gemini-2.5-flash-lite"; // NOVO: Gemini 2.5 Flash Lite (lançado julho 2025)
    
    console.log('[OCR] Primeiros 20 chars do base64:', imageBase64.substring(0, 20));
    
    if (imageBase64.startsWith('/9j/') || imageBase64.startsWith('iVBOR') || imageBase64.startsWith('R0lGOD')) {
      // É uma imagem (JPEG, PNG, GIF)
      mimeType = imageBase64.startsWith('/9j/') ? "image/jpeg" : 
                 imageBase64.startsWith('iVBOR') ? "image/png" : "image/gif";
      console.log('[OCR] Detectado: Imagem', mimeType);
    } else if (imageBase64.startsWith('JVBERi0') || imageBase64.startsWith('data:application/pdf')) {
      // É um PDF - USAR GEMINI 2.5 FLASH LITE (NOVO MODELO MAIS EFICIENTE)
      mimeType = "application/pdf";
      modelToUse = "gemini-2.5-flash-lite"; // NOVO: Gemini 2.5 Flash Lite para PDFs
      console.log('[OCR] � PDF detectado - usando Gemini 2.5 Flash (modelo otimizado para PDFs)');
      console.log('[OCR] 🎯 Modelo selecionado:', modelToUse);
    }else {
      console.log('[OCR] Tipo de arquivo não reconhecido, assumindo imagem JPEG');
      console.log('[OCR] Base64 começa com:', imageBase64.substring(0, 10));
    }

    console.log('[OCR] Usando modelo:', modelToUse);
    console.log('[OCR] MIME type:', mimeType);

    console.log('[OCR] API Key presente:', !!GEMINI_API_KEY);
    if (!GEMINI_API_KEY) {
      console.log('[OCR] Erro: API Key não encontrada');
      return res.status(500).json({ error: 'API não configurada' });

    }    // Prompt ultra especializado para PDFs financeiros brasileiros
    const prompt = `
VOCÊ É UM ESPECIALISTA OCR EM DOCUMENTOS FINANCEIROS BRASILEIROS COM FOCO ABSOLUTO EM EXTRAIR TRANSAÇÕES.

🎯 OBJETIVO PRINCIPAL: ENCONTRAR E EXTRAIR **TODAS** AS TRANSAÇÕES FINANCEIRAS DO DOCUMENTO.

🔍 ESTRATÉGIA DE ANÁLISE PARA PDFs:
1. 📖 LEIA O DOCUMENTO INTEIRO, página por página se necessário
2. 🔎 PROCURE por QUALQUER padrão de transação financeira
3. 💰 IDENTIFIQUE valores em R$ (Reais) em TODO o documento
4. 📅 ASSOCIE datas às transações encontradas
5. 🏪 CAPTURE nomes de estabelecimentos ou descrições

⚡ INSTRUÇÕES ULTRA ESPECÍFICAS:

PROCURE ESPECIFICAMENTE POR:
1. 📍 LISTA DE TRANSAÇÕES com datas e valores
2. 📍 COMPRAS ou PAGAMENTOS com nome de estabelecimentos
3. 📍 TRANSFERÊNCIAS recebidas ou enviadas (PIX, TED, DOC)
4. 📍 DEPÓSITOS e SAQUES
5. 📍 DÉBITOS e CRÉDITOS
6. 📍 MOVIMENTAÇÕES de qualquer tipo
7. 📍 FATURAS de cartão de crédito
8. 📍 EXTRATOS bancários
9. 📍 COMPROVANTES de pagamento

🏛️ PADRÕES DE BANCOS BRASILEIROS:

💜 NUBANK (PDF roxo):
- Seções: "COMPRAS", "TRANSFERÊNCIAS", "ASSINATURAS"
- Formato: "DD/MM ESTABELECIMENTO R$ VALOR"
- Exemplo: "15/12 UBER *TRIP R$ 23,45"

🟢 BRADESCO:
- Formato tabular: Data | Histórico | Valor | Saldo
- Indicadores: D (débito), C (crédito)
- Exemplo: "15/12/2024 SAQUE BRADESCO D 100,00"

🔶 ITAÚ:
- Seções: "Lançamentos", "Compras e saques"
- Formato: Data | Descrição | Valor
- Exemplo: "15/12 SUPERMERCADO XYZ 127,89"

🔵 CAIXA ECONÔMICA:
- Tabela com colunas: Data | Histórico | Doc | Valor
- Códigos D/C para débito/crédito
- Exemplo: "15/12/2024 PIX ENVIADO D 50,00"

🟡 BANCO DO BRASIL:
- Layout tabular com códigos internos
- Formato: Data | Histórico | Documento | Valor
- Exemplo: "15/12/2024 COMPRA CARTAO 234 D 89,50"

🟠 SANTANDER:
- Extrato com seções de movimentação
- Formato: Data | Descrição | Valor | Saldo
- Exemplo: "15/12 NETFLIX.COM 39,90"

💚 INTER:
- Layout moderno com blocos visuais
- Formato: Data | Descrição | Valor
- Exemplo: "15/12 MERCADO EXTRA 127,89"

� BTG/C6/OUTROS DIGITAIS:
- Interfaces modernas com transações organizadas
- Procure por listas de compras ou movimentações

� TÉCNICAS DE EXTRAÇÃO:

PARA FATURAS DE CARTÃO:
- TODAS as transações são "expense" (despesas)
- Procure seções como "Resumo da fatura", "Lançamentos", "Compras"
- Valores podem estar em formato brasileiro: 1.234,56
- Ignore: limite disponível, valor mínimo, total da fatura

PARA EXTRATOS BANCÁRIOS:
- ENTRADAS (income): PIX recebido, depósito, TED recebida, estorno a favor
- SAÍDAS (expense): PIX enviado, saque, compra, transferência enviada
- Observe indicadores D/C ou sinais +/-

PARA COMPROVANTES:
- Foque no valor principal da transação
- Capture data, valor e descrição/beneficiário
- Determine se é entrada ou saída pelo contexto

⚠️ REGRAS CRÍTICAS:

1. **SEMPRE** procure por padrões como:
   - "DD/MM/AAAA DESCRIÇÃO R$ VALOR"
   - "DD/MM ESTABELECIMENTO VALOR"
   - "Data | Histórico | Valor"
   - Valores formatados como: R$ 123,45 ou 123,45 ou 1.234,56

2. **NÃO IGNORE** transações pequenas (ex: R$ 5,00 é válido)

3. **EXTRAIA TUDO** mesmo que pareça irrelevante

4. **USE CONTEXTO** para determinar se é entrada ou saída

5. **SEMPRE** retorne ao menos UMA transação se houver qualquer valor em R$ no documento

FORMATO DE SAÍDA OBRIGATÓRIO (JSON PURO):

{
  "documentType": "fatura_cartao" ou "extrato_bancario" ou "comprovante_pix",
  "confidence": 0.95,
  "summary": {
    "totalAmount": [soma total de todas as transações],
    "totalIncome": [soma apenas das entradas],
    "totalExpense": [soma apenas das saídas],
    "establishment": "Nome do banco/instituição identificado",
    "period": "Período identificado no documento"
  },
  "transactions": [
    {
      "description": "Nome claro do estabelecimento ou descrição da transação",
      "amount": 127.89,
      "type": "expense",
      "category": "Alimentação",
      "date": "2024-12-15",
      "confidence": 0.95
    }
  ]
}

CATEGORIAS DISPONÍVEIS (use exatamente esses nomes):

**RECEITAS:**
${INCOME_CATEGORIES.map(cat => `"${cat}"`).join(', ')}

**DESPESAS:**
${EXPENSE_CATEGORIES.map(cat => `"${cat}"`).join(', ')}

REGRAS DE CATEGORIZAÇÃO AUTOMÁTICA:
- MERCADO/SUPERMERCADO/EXTRA/CARREFOUR/PÃO DE AÇÚCAR → "Supermercado"
- POSTO/SHELL/PETROBRAS/IPIRANGA/BR → "Combustível"  
- FARMÁCIA/DROGARIA/RAIA/PACHECO → "Farmácia"
- CINEMA/NETFLIX/SPOTIFY/AMAZON PRIME → "Streaming (Netflix, etc)"
- ENEL/SABESP/COMGÁS/NET/VIVO/TIM → "Internet" ou "Luz" ou "Água" ou "Gás"
- ESCOLA/FACULDADE/CURSO/LIVRARIA → "Mensalidade Escolar" ou "Faculdade"
- SALÃO/BARBEARIA/O BOTICÁRIO/NATURA → "Cabeleireiro" ou "Cosméticos"
- RECEITA FEDERAL/DETRAN/PREFEITURA → "Impostos Diversos"
- BANCO/INVEST/POUPANÇA/APLICAÇÃO → "Investimentos" ou "Poupança"
- EMPRÉSTIMO/FINANCIAMENTO/CARTÃO → "Cartão de Crédito" ou "Financiamentos"
- UBER/99/TAXI → "Uber/99/Táxi"
- ALUGUEL → "Aluguel"
- SALÁRIO/PAGAMENTO → "Salário"
- Outros casos → "Não Categorizado"

🚨 IMPORTANTE:
- Retorne APENAS o JSON válido, sem texto adicional
- SEMPRE tente extrair ao menos algumas transações
- Se não conseguir ler nada, retorne transactions: [] mas NUNCA falhe
- Use valores numéricos (não strings) para amounts
- Datas no formato YYYY-MM-DD
- Types apenas "income" ou "expense"

💡 DICA FINAL: Este é um PDF financeiro brasileiro real. SEMPRE há transações para extrair. Seja persistente e examine cada linha, tabela ou seção do documento.`;

    console.log('[OCR] Preparando payload para Gemini...');

    const payload = {
      contents: [{
        parts: [          { text: prompt },          {
            inline_data: {
              mime_type: mimeType,
              data: processedImageBase64
            }
          }
        ]
      }],      generationConfig: {
        temperature: 0.05, // ULTRA baixo para máxima precisão em PDFs
        topK: mimeType === "application/pdf" ? 2 : 8,     // MUITO conservador para PDFs
        topP: mimeType === "application/pdf" ? 0.3 : 0.7,  // MUITO conservador para PDFs
        maxOutputTokens: mimeType === "application/pdf" ? 8192 : 6144, // MAIOR para PDFs complexos
      }
    };    console.log('[OCR] Chamando Gemini:', modelToUse);

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
          console.log('[OCR] ⏱️ Timeout de 50s atingido, cancelando requisição...');
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
            console.warn('[OCR] Não foi possível parsear erro como JSON');
          }
          
          // Verificar se é erro 503 (UNAVAILABLE) - tentar novamente
          if (response.status === 503 || 
              (errorDetails?.error?.status === 'UNAVAILABLE') ||
              (errorDetails?.error?.code === 503)) {
            
            lastError = new Error(`Gemini API temporariamente indisponível (503). Tentativa ${retryCount + 1}/${maxRetries + 1}`);
            console.log(`[OCR] Erro 503 detectado, aguardando antes da próxima tentativa...`);
            
            if (retryCount < maxRetries) {
              // Aguardar antes de tentar novamente (backoff exponencial)
              const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
              await new Promise(resolve => setTimeout(resolve, delay));
              retryCount++;
              continue;
            } else {
              // Último retry falhado
              throw new Error('API Gemini indisponível após múltiplas tentativas. Tente novamente em alguns minutos.');
            }
          }
          
          // Verificar se é erro "The document has no pages" - PDF protegido
      if (errorText.includes('The document has no pages') || 
          errorText.includes('cannot be processed') ||
          errorText.includes('PDF parsing failed') ||
          errorText.includes('unsupported')) {
        console.log('[OCR] PDF não suportado ou protegido detectado');
        return res.status(200).json({ 
          success: true,
          data: {
            documentType: "pdf_não_suportado",
            confidence: 0.1,
            summary: {
              totalAmount: 0,
              totalIncome: 0,
              totalExpense: 0,
              establishment: "PDF não processado",
              period: "Não identificado",
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
            userMessage: '📄 Este PDF não pode ser processado automaticamente.\n\n💡 **Soluções que funcionam 100%:**\n\n📸 **Tire fotos das páginas importantes:**\n• Abra o PDF no computador/celular\n• Tire screenshots ou fotos das páginas\n• Envie as imagens aqui\n\n🖼️ **Converta para imagem:**\n• Use ferramentas online gratuitas\n• Converta PDF → PNG/JPG\n• Envie as imagens resultantes\n\n📋 **Método manual:**\n• Copie o texto do PDF\n• Cole aqui no chat\n• Eu processarei como texto\n\n✅ **Essas soluções sempre funcionam!**'
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
              establishment: "PDF não processado",
              period: "Não identificado",
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
            userMessage: '🔒 **PDF protegido ou com problemas**\n\n❌ Este PDF não pode ser processado (protegido por senha, corrompido ou formato não suportado).\n\n💡 **Soluções garantidas:**\n\n📸 **Screenshots funcionam sempre:**\n• Abra o PDF e tire fotos da tela\n• Envie as imagens uma por uma\n• Processamento será 100% preciso\n\n🔓 **Para PDFs protegidos:**\n• Remova a proteção (se possível)\n• Tire screenshots das páginas\n• Use "Imprimir como PDF" sem proteção\n\n📋 **Última opção:**\n• Copie o texto manualmente\n• Cole aqui no chat\n\n✅ **Qualquer imagem funciona perfeitamente!**'
          }
        });
      }
      
      // Verificar se é erro de PDF corrompido ou inválido específico
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
              period: "Não identificado",
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
            userMessage: '📄 **PDF corrompido detectado**\n\n❌ Este arquivo PDF está corrompido ou em formato não suportado.\n\n💡 **Soluções:**\n• Baixe o PDF novamente da fonte original\n• Tire fotos das páginas importantes\n• Solicite uma nova versão do documento\n\n📸 **Screenshots sempre funcionam!**'
          }
        });
      }
          
          return res.status(500).json({ 
            error: 'Erro na API Gemini',
            details: errorText.substring(0, 500) // Limitar tamanho do erro
          });
        }

        // Se chegou até aqui, a requisição foi bem-sucedida
        responseData = await response.json() as any;
        console.log('[OCR] Resposta Gemini recebida com sucesso na tentativa', retryCount + 1);

        if (!responseData.candidates || responseData.candidates.length === 0) {
          console.error('[OCR] Nenhum candidato na resposta - usando fallback');
          // Ao invés de retornar erro 500, criar estrutura válida
          ocrResult = {
            documentType: "documento_não_identificado",
            confidence: 0.3,
            summary: {
              totalAmount: 0,
              totalIncome: 0,
              totalExpense: 0,
              establishment: "Documento não processado",
              period: "Não identificado",
              itemCount: 0
            },
            transactions: []
          };
          processingComplete = true;
          break;
        }

        const candidate = responseData.candidates[0];
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
          console.error('[OCR] Estrutura de resposta inválida - usando fallback');
          // Ao invés de retornar erro 500, criar estrutura válida
          ocrResult = {
            documentType: "documento_não_identificado",
            confidence: 0.3,
            summary: {
              totalAmount: 0,
              totalIncome: 0,
              totalExpense: 0,
              establishment: "Documento não processado",
              period: "Não identificado",
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
          // Regex para capturar o maior JSON possível
          const jsonRegex = /\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/g;
          const jsonMatches = responseText.match(jsonRegex);
          if (jsonMatches && jsonMatches.length > 0) {
            // Tentar o match mais longo primeiro (provavelmente o JSON completo)
            const sortedMatches = jsonMatches.sort((a: string, b: string) => b.length - a.length);
            ocrResult = JSON.parse(sortedMatches[0]);
            console.log('[OCR] JSON extraído com regex avançado');
          } else {
            // Limpar possíveis marcadores de código (fallback)
            const cleanText = responseText
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .replace(/^[^{]*/, '')
              .replace(/[^}]*$/, '')
              .trim();
            ocrResult = JSON.parse(cleanText);
            console.log('[OCR] JSON extraído com fallback cleanText');
          }

          // Validar estrutura básica
          if (!ocrResult.transactions || !Array.isArray(ocrResult.transactions)) {
            console.warn('[OCR] Estrutura inválida: transactions não é array - criando estrutura padrão');
            ocrResult = {
              documentType: "extrato_bancario",
              confidence: 0.7,
              summary: {
                totalAmount: 0,
                totalIncome: 0,
                totalExpense: 0,
                establishment: "Não identificado",
                period: "Não identificado",
                itemCount: 0
              },
              transactions: []
            };
          }

          // Validar e corrigir campos obrigatórios
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
          console.log('[OCR] Transações encontradas:', ocrResult.transactions.length);
          console.log('[OCR] Total receitas:', totalIncome);
          console.log('[OCR] Total despesas:', totalExpense);

          // VALIDAÇÃO ULTRA TOLERANTE - SEMPRE PROCESSAR SE HOUVER ALGUM DADO
          const hasNoTransactions = ocrResult.transactions.length === 0;
          const totalValue = totalIncome + totalExpense;
          
          // Log para debugging
          console.log('[OCR] 🔍 Validação de qualidade:');
          console.log('[OCR] - Transações encontradas:', ocrResult.transactions.length);
          console.log('[OCR] - Total value:', totalValue);
          console.log('[OCR] - Has no transactions:', hasNoTransactions);
          
          // SOMENTE rejeitar se literalmente NÃO houver nenhuma transação
          if (hasNoTransactions) {
            console.log('[OCR] ⚠️ Nenhuma transação encontrada - mas ainda assim retornando estrutura válida');
            // NÃO retornar erro 400, retornar estrutura vazia mas válida
            ocrResult = {
              documentType: "documento_processado",
              confidence: 0.5,
              summary: {
                totalAmount: 0,
                totalIncome: 0,
                totalExpense: 0,
                establishment: "Documento analisado",
                period: "Não identificado",
                itemCount: 0
              },
              transactions: []
            };
          }

          // Se chegou até aqui, o processamento foi bem-sucedido
          processingComplete = true;
          break;

        } catch (parseError: any) {
          console.error('[OCR] Erro ao parsear JSON:', parseError.message);
          console.error('[OCR] Texto problemático:', responseText.substring(0, 300));

          // Fallback alternativo: tentar extrair valores monetários do texto
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
                description: `Transação ${idx + 1}`,
                amount: amount,
                type: "expense",
                category: "Outros",
                date: new Date().toISOString().substring(0, 10),
                confidence: 0.5
              }))
            };
            console.log('[OCR] ✅ Recuperadas', amounts.length, 'transações via método alternativo');
            processingComplete = true;
            break;
          }

          // Ao invés de falhar completamente, criar resultado vazio mas válido
          console.log('[OCR] Criando estrutura de fallback devido a erro de parsing');
          ocrResult = {
            documentType: "documento_não_processado",
            confidence: 0.5,
            summary: {
              totalAmount: 0,
              totalIncome: 0,
              totalExpense: 0,
              establishment: "Erro de processamento",
              period: "Não identificado",
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
        
        // Verificar se é erro de timeout (AbortController)
        if (requestError.name === 'AbortError') {
          console.log(`[OCR] ⏱️ Timeout de 50s atingido na tentativa ${retryCount + 1}`);
          lastError = new Error(`Timeout: Requisição demorou mais que 50 segundos`);
        }
        
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`[OCR] Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retryCount++;
          continue;
        } else {
          // Último retry falhado
          throw new Error(`Falha após ${maxRetries + 1} tentativas: ${requestError.message}`);
        }
      }
    }

    // VALIDAÇÃO CRÍTICA: Verificar se o processamento foi realmente bem-sucedido
    if (!processingComplete) {
      console.error('[OCR] ❌ Processamento falhou - não foi concluído');
      // Garantir que ocrResult exista mesmo em caso de falha
      ocrResult = {
        documentType: "documento_não_identificado",
        confidence: 0.3,
        summary: {
          totalAmount: 0,
          totalIncome: 0,
          totalExpense: 0,
          establishment: "Erro de processamento",
          period: "Não identificado",
          itemCount: 0
        },
        transactions: []
      };
      processingComplete = true; // Marcar como processado para continuar
    }

    // Garantir que ocrResult sempre exista
    if (!ocrResult) {
      console.error('[OCR] ❌ ocrResult ainda é null - criando estrutura de emergência');
      ocrResult = {
        documentType: "documento_não_processado",
        confidence: 0.1,
        summary: {
          totalAmount: 0,
          totalIncome: 0,
          totalExpense: 0,
          establishment: "Sistema não conseguiu processar",
          period: "Não identificado",
          itemCount: 0
        },
        transactions: []
      };
    }

    // Se saiu do loop, o processamento foi concluído (com ou sem dados)
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    console.log('[OCR] ✅ Processamento concluído!');
    console.log('[OCR] ⏱️ Tempo total:', processingTime, 'ms');
    console.log('[OCR] 📊 Transações encontradas:', ocrResult?.transactions?.length || 0);

    // SELEÇÃO AUTOMÁTICA DE CATEGORIA
    let selectedCategory = 'Não Categorizado';
    if (ocrResult && ocrResult.transactions && ocrResult.transactions.length > 0) {
      selectedCategory = selectAutomaticCategory(ocrResult.transactions);
      console.log('[OCR] 🎯 Categoria selecionada automaticamente:', selectedCategory);
    }

    // Sempre retornar sucesso, mesmo que com dados vazios
    return res.status(200).json({
      success: true,
      data: ocrResult,
      selectedCategory: selectedCategory, // ← NOVA PROPRIEDADE PARA A CATEGORIA SELECIONADA
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
    
    // Ao invés de retornar erro 500, sempre retornar dados válidos
    const fallbackResult = {
      documentType: "documento_com_erro",
      confidence: 0.1,
      summary: {
        totalAmount: 0,
        totalIncome: 0,
        totalExpense: 0,
        establishment: "Erro no processamento",
        period: "Não identificado",
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
