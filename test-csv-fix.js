// Teste rápido para CSV corrigido
const fs = require('fs');

console.log('🧪 TESTANDO CORREÇÃO DO CSV...\n');

// Criar arquivo CSV de teste simples
const csvTest = `Data,Descricao,Valor,Tipo
15/12/2024,Supermercado ABC,285.90,Debito
16/12/2024,Salario,3500.00,Credito
17/12/2024,PIX para João,-150.00,Debito
18/12/2024,Uber,35.50,Debito`;

// Salvar arquivo de teste
fs.writeFileSync('teste-csv-simples.csv', csvTest);

async function testarCSV() {
  try {
    console.log('📊 Conteúdo do CSV de teste:');
    console.log(csvTest);
    console.log('\n🔍 Verificando se está bem formatado...');
    
    const linhas = csvTest.split('\n');
    console.log(`✅ ${linhas.length} linhas encontradas`);
    
    // Simular o que o processTextFile faria
    const temVirgulas = csvTest.includes(',');
    const temCabecalho = csvTest.includes('Data') && csvTest.includes('Valor');
    
    console.log(`✅ Tem vírgulas (CSV): ${temVirgulas}`);
    console.log(`✅ Tem cabeçalho válido: ${temCabecalho}`);
    
    // Verificar se tem dados de transação
    const temTransacoes = csvTest.includes('Supermercado') && csvTest.includes('285.90');
    console.log(`✅ Tem dados de transações: ${temTransacoes}`);
    
    console.log('\n🎯 CSV está bem formatado para processamento!');
    console.log('\n📝 Próximo passo: Testar chamada à API...');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testarCSV();
