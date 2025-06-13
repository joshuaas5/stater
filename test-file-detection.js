// Teste da detecção de tipos de arquivo
const testBase64Detection = () => {
  console.log('🧪 Testando detecção de tipos de arquivo...\n');
  
  // Exemplos de cabeçalhos base64
  const examples = {
    'JPEG': '/9j/4AAQSkZJRgABAQEAYABgAAD...',
    'PNG': 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...',
    'PDF': 'JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PAo...',
    'GIF': 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAA...'
  };
  
  for (const [type, base64] of Object.entries(examples)) {
    let mimeType = "image/jpeg"; // padrão
    let modelToUse = "gemini-2.0-flash-exp"; // padrão para imagens
    
    if (base64.startsWith('/9j/') || base64.startsWith('iVBORw') || base64.startsWith('R0lGOD')) {
      // É uma imagem (JPEG, PNG, GIF)
      mimeType = base64.startsWith('/9j/') ? "image/jpeg" : 
                 base64.startsWith('iVBORw') ? "image/png" : "image/gif";
      modelToUse = "gemini-2.0-flash-exp"; // Melhor para imagens
    } else if (base64.startsWith('JVBERi0')) {
      // É um PDF
      mimeType = "application/pdf";
      modelToUse = "gemini-2.5-flash"; // Testar se 2.5 Flash lê PDFs
    }
    
    console.log(`${type}:`);
    console.log(`  MIME: ${mimeType}`);
    console.log(`  Modelo: ${modelToUse}`);
    console.log('');
  }
};

testBase64Detection();
