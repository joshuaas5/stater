// Teste simples de upload de PDF
console.log('📄 Testando validação de arquivo PDF...\n');

// Simular um arquivo PDF
const mockPDFFile = {
  type: 'application/pdf',
  name: 'documento.pdf',
  size: 1024 * 1024 // 1MB
};

// Simular um arquivo sem tipo MIME (alguns sistemas)
const mockPDFFileNoMime = {
  type: '',
  name: 'documento.pdf',
  size: 1024 * 1024
};

// Simular uma imagem
const mockImageFile = {
  type: 'image/jpeg',
  name: 'foto.jpg',
  size: 2 * 1024 * 1024 // 2MB
};

// Simular arquivo inválido
const mockInvalidFile = {
  type: 'text/plain',
  name: 'documento.txt',
  size: 1024
};

function testFileValidation(file) {
  console.log(`\n🔍 Testando: ${file.name} (${file.type || 'sem MIME type'})`);
  
  const isValidImage = file.type.startsWith('image/') || 
                      file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp)$/);
  const isValidPDF = file.type === 'application/pdf' || 
                    file.name.toLowerCase().endsWith('.pdf');
  
  if (!isValidImage && !isValidPDF) {
    console.log('❌ REJEITADO: Tipo de arquivo inválido');
    return false;
  }
  
  if (file.size > 10 * 1024 * 1024) {
    console.log('❌ REJEITADO: Arquivo muito grande');
    return false;
  }
  
  console.log('✅ ACEITO:', isValidImage ? 'Imagem' : 'PDF');
  return true;
}

// Testar todos os casos
testFileValidation(mockPDFFile);
testFileValidation(mockPDFFileNoMime);
testFileValidation(mockImageFile);
testFileValidation(mockInvalidFile);

console.log('\n📱 Testando detecção mobile...');
const userAgents = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' // Desktop
];

userAgents.forEach((ua, i) => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  console.log(`${i+1}. ${isMobile ? '📱 Mobile' : '💻 Desktop'}: ${ua.substring(0, 50)}...`);
});
