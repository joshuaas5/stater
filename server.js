const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  let filePath;
  
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'dist', 'index.html');
  } else if (req.url === '/teste-telegram.html') {
    filePath = path.join(__dirname, 'teste-telegram.html');
  } else {
    filePath = path.join(__dirname, 'dist', req.url);
  }
  
  console.log(`Trying to serve: ${filePath}`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end(`
      <h1>404 - Arquivo não encontrado</h1>
      <p>Arquivo procurado: ${filePath}</p>
      <p>URL solicitada: ${req.url}</p>
      <p><a href="/">Voltar ao início</a></p>
      <p><a href="/teste-telegram.html">Teste Telegram</a></p>
    `);
    return;
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
  };
  
  const contentType = contentTypes[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      res.writeHead(500, {'Content-Type': 'text/html'});
      res.end(`<h1>500 - Erro do servidor</h1><p>${err.message}</p>`);
      return;
    }
    
    res.writeHead(200, {'Content-Type': contentType});
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 SERVIDOR ICTUS INICIADO COM SUCESSO!');
  console.log('='.repeat(50));
  console.log(`📱 App principal: http://localhost:${PORT}`);
  console.log(`🔥 Teste Telegram: http://localhost:${PORT}/teste-telegram.html`);
  console.log('='.repeat(50));
  console.log('Arquivos disponíveis:');
  
  // List files in dist
  try {
    const distFiles = fs.readdirSync(path.join(__dirname, 'dist'));
    distFiles.forEach(file => {
      console.log(`  📄 /${file}`);
    });
  } catch (e) {
    console.log('  ❌ Pasta dist não encontrada');
  }
  
  console.log('='.repeat(50));
});

server.on('error', (err) => {
  console.error('Erro no servidor:', err);
});
