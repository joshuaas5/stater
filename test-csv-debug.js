// Teste específico para CSV - Debug completo
console.log('🔥 TESTE ESPECÍFICO CSV - DEBUG COMPLETO');

const fs = require('fs');

async function testCsvDebug() {
  console.log('\n📊 TESTANDO CSV ESPECÍFICO...');
    // Verificar se arquivo existe
  const csvFile = './public/extrato-exemplo.csv';
  if (!fs.existsSync(csvFile)) {
    console.log('❌ Arquivo CSV não encontrado:', csvFile);
    return;
  }
  
  // Ler conteúdo do CSV
  const csvContent = fs.readFileSync(csvFile, 'utf8');
  console.log('\n📄 CONTEÚDO DO CSV:');
  console.log(csvContent);
  console.log('\n🔍 TAMANHO:', csvContent.length, 'caracteres');
  
  // Preparar dados para API
  const payload = {
    fileType: 'text/csv',
    fileName: 'extrato-exemplo.csv',
    csvData: csvContent,
    textData: csvContent // também como textData
  };
  
  console.log('\n📤 ENVIANDO PARA API...');
  console.log('Payload keys:', Object.keys(payload));
  console.log('FileType:', payload.fileType);
  console.log('CsvData presente:', !!payload.csvData);
  
  try {
    const response = await fetch('http://localhost:3001/api/gemini-ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    console.log('\n📥 RESPOSTA DA API:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const responseText = await response.text();
    console.log('\n📋 CONTEÚDO DA RESPOSTA:');
    console.log(responseText);
    
    // Tentar parsear JSON se possível
    try {
      const responseJson = JSON.parse(responseText);
      console.log('\n✅ JSON PARSEADO:');
      console.log(JSON.stringify(responseJson, null, 2));
      
      if (responseJson.success && responseJson.data) {
        console.log('\n🎯 TRANSAÇÕES EXTRAÍDAS:');
        responseJson.data.transactions.forEach((t, i) => {
          console.log(`${i+1}. ${t.description} - R$ ${t.amount} (${t.type})`);
        });
      }
      
      if (responseJson.error) {
        console.log('\n❌ ERRO REPORTADO:');
        console.log('Error:', responseJson.error);
        console.log('Details:', responseJson.details);
        if (responseJson.suggestions) {
          console.log('Suggestions:');
          responseJson.suggestions.forEach(s => console.log('  -', s));
        }
      }
      
    } catch (parseError) {
      console.log('\n⚠️ RESPOSTA NÃO É JSON VÁLIDO');
    }
    
  } catch (error) {
    console.error('\n💥 ERRO NA REQUISIÇÃO:', error.message);
  }
}

testCsvDebug();
