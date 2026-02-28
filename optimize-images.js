const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = [
  'modo-simples.png',
  'stater-ia.png',
  'dashboard.png',
  'recorrentes.png',
  'metas.png',
  'insights.png',
  'saude-financeira.png',
  'importar-docs.png'
];

async function optimizeImage(filename) {
  const inputPath = path.join('public', 'screenshots', filename);
  const outputPath = path.join('public', 'screenshots', filename.replace('.png', '.webp'));
  
  try {
    await sharp(inputPath)
      .resize(800, null, { // max width 800px, mantém proporção
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    const originalSize = fs.statSync(inputPath).size / 1024;
    const newSize = fs.statSync(outputPath).size / 1024;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ ${filename}: ${originalSize.toFixed(0)} KB → ${newSize.toFixed(0)} KB (${reduction}% menor)`);
  } catch (error) {
    console.error(`❌ Erro em ${filename}:`, error.message);
  }
}

(async () => {
  console.log('🖼️  Otimizando imagens...\n');
  for (const img of images) {
    await optimizeImage(img);
  }
  console.log('\n✅ Otimização concluída!');
})();
