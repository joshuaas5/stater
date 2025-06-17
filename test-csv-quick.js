// Script de teste rápido para CSV
const fs = require('fs');

async function testCSV() {
  console.log('🧪 Testando processamento de CSV...');
  
  const csvContent = fs.readFileSync('./test-csv-simple.csv', 'utf8');
  console.log('📄 Conteúdo do CSV:');
  console.log(csvContent);
  
  // Simular o processamento
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  console.log('📊 Headers encontrados:', headers);
  
  console.log('✅ Teste de leitura de CSV concluído');
}

testCSV();
