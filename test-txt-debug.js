// Teste específico para arquivo TXT
const fs = require('fs');

// Simular dados que seriam enviados pelo frontend
const testData = {
  fileName: 'extrato-exemplo.txt',
  fileType: 'text/plain',
  textData: `BANCO DO BRASIL S.A.
EXTRATO DE CONTA CORRENTE
Período: 01/12/2024 a 31/12/2024

DATA       HISTÓRICO                           VALOR        SALDO
02/12/2024 PIX RECEBIDO - MARIA SANTOS         +800,00      3.300,00
03/12/2024 COMPRA DÉBITO - SUPERMERCADO XYZ    -156,80      3.143,20
07/12/2024 SALÁRIO - EMPRESA ABC LTDA          +3.500,00    6.393,20
10/12/2024 PAGAMENTO CONTA LUZ - CELESC        -125,45      6.267,75`
};

console.log('🧪 TESTE DE ARQUIVO TXT');
console.log('========================');
console.log('Nome:', testData.fileName);
console.log('Tipo:', testData.fileType);
console.log('Conteúdo:');
console.log(testData.textData);

console.log('\n📊 RESULTADO ESPERADO:');
console.log('• 4 transações identificadas');
console.log('• 1 receita (PIX + Salário): R$ 4.300,00');
console.log('• 2 despesas (Compra + Conta): R$ 282,25');
console.log('• Total movimentado: R$ 4.582,25');

console.log('\n🎯 VALIDAÇÕES:');
console.log('• Deve processar sem erro 500');
console.log('• Não deve retornar transações de R$ 0,01');
console.log('• Deve calcular totais corretamente');
console.log('• Deve categorizar automaticamente');

console.log('\n🔧 Para testar:');
console.log('1. Inicie o servidor: npm run dev');
console.log('2. Faça upload do arquivo public/extrato-exemplo.txt');
console.log('3. Verifique se processa corretamente');
console.log('4. Confirme se totais batem');

console.log('\n📋 ARQUIVO CSV TESTE:');
const csvData = `Data,Descrição,Valor,Tipo
2024-12-02,PIX Recebido - Maria Santos,800.00,income
2024-12-03,Supermercado XYZ,-156.80,expense
2024-12-07,Salário - Empresa ABC,3500.00,income
2024-12-10,Conta de Luz - CELESC,-125.45,expense`;

console.log(csvData);
console.log('\n💡 Este CSV deve processar:');
console.log('• Receitas: R$ 4.300,00 (800 + 3500)');
console.log('• Despesas: R$ 282,25 (156.80 + 125.45)');
console.log('• Total: R$ 4.582,25');

console.log('\n✅ MELHORIAS IMPLEMENTADAS:');
console.log('• Prompt melhorado para arquivos BR');
console.log('• Cálculo correto de totais');
console.log('• Validação sem falsos positivos');
console.log('• Sugestões específicas para erros');
console.log('• Remoção de transações de R$ 0,01');
console.log('• Link para merge de imagens');
console.log('• Logging detalhado para debug');
