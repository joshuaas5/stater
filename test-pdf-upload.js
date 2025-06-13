// Teste simples para verificar upload de PDF
console.log('🧪 Testando validação de upload de PDF...');

// Simular validação do frontend
function validateFile(file) {
  const isValidImage = file.type.startsWith('image/') || 
                      file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp)$/);
  const isValidPDF = file.type === 'application/pdf' || 
                    file.name.toLowerCase().endsWith('.pdf');
  
  return { isValidImage, isValidPDF, isValid: isValidImage || isValidPDF };
}

// Casos de teste
const testFiles = [
  { name: 'documento.pdf', type: 'application/pdf' },
  { name: 'extrato.PDF', type: 'application/pdf' },
  { name: 'comprovante.jpg', type: 'image/jpeg' },
  { name: 'documento.pdf', type: '' }, // Navegadores antigos podem não enviar MIME
  { name: 'invalid.txt', type: 'text/plain' }
];

testFiles.forEach(file => {
  const result = validateFile(file);
  console.log(`Arquivo: ${file.name} (${file.type || 'sem MIME'})`);
  console.log(`  Imagem válida: ${result.isValidImage}`);
  console.log(`  PDF válido: ${result.isValidPDF}`);
  console.log(`  Resultado: ${result.isValid ? '✅ ACEITO' : '❌ REJEITADO'}`);
  console.log('');
});

console.log('✅ Teste concluído!');
