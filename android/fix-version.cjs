const fs = require('fs');
let content = fs.readFileSync('app/build.gradle', 'utf8');

// Atualizar vers?o
content = content.replace(/versionCode \d+/, 'versionCode 14');
content = content.replace(/versionName "[^"]+"/, 'versionName "1.3.0"');

// Remover BOM se existir
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}

fs.writeFileSync('app/build.gradle', content, 'utf8');
console.log('Vers?o atualizada para 1.3.0');
