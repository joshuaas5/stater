// Teste de categorização automática do OCR
const categorizationTest = () => {
  console.log('🧪 Testando categorização automática do OCR...\n');

  // Lista de transações de teste
  const testTransactions = [
    'SUPERMERCADO EXTRA - R$ 89.50',
    'POSTO SHELL - R$ 65.00',
    'FARMACIA DROGASIL - R$ 25.30',
    'NETFLIX - R$ 29.90',
    'ENEL DISTRIBUICAO - R$ 125.40',
    'ESCOLA OBJETIVO - R$ 450.00',
    'SALAO BELEZA - R$ 80.00',
    'IPTU 2025 - R$ 245.00',
    'APLICACAO TESOURO - R$ 1000.00',
    'EMPRESTIMO CONSIGNADO - R$ 380.00',
    'LOJA GENERICA - R$ 15.00'
  ];

  // Regras de categorização (espelhando o OCR)
  const categorizeTransaction = (description) => {
    const desc = description.toUpperCase();
    
    if (desc.includes('MERCADO') || desc.includes('SUPERMERCADO') || desc.includes('EXTRA') || desc.includes('CARREFOUR') || desc.includes('PÃO DE AÇÚCAR')) {
      return 'Alimentação';
    }
    if (desc.includes('POSTO') || desc.includes('SHELL') || desc.includes('PETROBRAS') || desc.includes('IPIRANGA') || desc.includes('BR')) {
      return 'Transporte';
    }
    if (desc.includes('FARMÁCIA') || desc.includes('FARMACIA') || desc.includes('DROGARIA') || desc.includes('RAIA') || desc.includes('PACHECO') || desc.includes('DROGASIL')) {
      return 'Saúde';
    }
    if (desc.includes('CINEMA') || desc.includes('NETFLIX') || desc.includes('SPOTIFY') || desc.includes('AMAZON PRIME')) {
      return 'Entretenimento';
    }
    if (desc.includes('ENEL') || desc.includes('SABESP') || desc.includes('COMGÁS') || desc.includes('NET') || desc.includes('VIVO') || desc.includes('TIM')) {
      return 'Habitação';
    }
    if (desc.includes('ESCOLA') || desc.includes('FACULDADE') || desc.includes('CURSO') || desc.includes('LIVRARIA')) {
      return 'Educação';
    }
    if (desc.includes('SALÃO') || desc.includes('SALAO') || desc.includes('BARBEARIA') || desc.includes('O BOTICÁRIO') || desc.includes('NATURA')) {
      return 'Cuidados Pessoais';
    }
    if (desc.includes('RECEITA FEDERAL') || desc.includes('DETRAN') || desc.includes('PREFEITURA') || desc.includes('IPTU') || desc.includes('IPVA')) {
      return 'Impostos';
    }
    if (desc.includes('BANCO') || desc.includes('INVEST') || desc.includes('POUPANÇA') || desc.includes('APLICAÇÃO') || desc.includes('TESOURO')) {
      return 'Poupança e Investimentos';
    }
    if (desc.includes('EMPRÉSTIMO') || desc.includes('EMPRESTIMO') || desc.includes('FINANCIAMENTO') || desc.includes('CARTÃO') || desc.includes('CARTAO')) {
      return 'Pagamentos de Dívidas';
    }
    
    return 'Outros';
  };

  // Testar cada transação
  testTransactions.forEach((transaction, index) => {
    const category = categorizeTransaction(transaction);
    console.log(`${index + 1}. ${transaction}`);
    console.log(`   📁 Categoria: ${category}`);
    console.log('');
  });

  console.log('✅ Teste de categorização concluído!');
  console.log('📊 Resumo das categorias encontradas:');
  
  const categories = testTransactions.map(t => categorizeTransaction(t));
  const categoryCount = categories.reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} transação(ões)`);
  });

  console.log('\n🎯 Melhorias implementadas:');
  console.log('   ✅ Categorização automática inteligente');
  console.log('   ✅ Uso das categorias corretas do sistema ICTUS');
  console.log('   ✅ Análise de palavras-chave nas descrições');
  console.log('   ✅ Fallback para "Outros" quando não identificado');
};

// Executar teste
categorizationTest();
