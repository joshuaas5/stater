// Servidor Express simples para as APIs
const express = require('express');
const cors = require('cors');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

console.log('[DEV-SERVER] Variáveis de ambiente carregadas');
console.log('[DEV-SERVER] GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Definida' : 'Não definida');

// Importar a função do Gemini
let geminiHandler;
try {
  // Usar require com extensão .js para compatibilidade
  delete require.cache[require.resolve('./api/gemini.js')];
  geminiHandler = require('./api/gemini.js');
} catch (error) {
  console.error('[DEV-SERVER] Erro ao importar gemini.js:', error.message);
  
  // Fallback: Importar como módulo ES
  import('./api/gemini.js').then(module => {
    geminiHandler = module;
  }).catch(err => {
    console.error('[DEV-SERVER] Erro ao importar gemini.js como ES module:', err);
  });
}

// Rota para a API do Gemini
app.post('/api/gemini', async (req, res) => {
  try {
    console.log('[DEV-SERVER] Recebida requisição para /api/gemini');
    
    if (!geminiHandler) {
      console.error('[DEV-SERVER] geminiHandler não carregado');
      return res.status(500).json({ error: 'Handler da API não carregado' });
    }
    
    // Simular o formato de req/res do Vercel
    const mockReq = {
      method: req.method,
      body: req.body,
      headers: req.headers
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          res.status(code).json(data);
        }
      }),
      json: (data) => {
        res.json(data);
      }
    };
    
    await (geminiHandler.default || geminiHandler)(mockReq, mockRes);
  } catch (error) {
    console.error('[DEV-SERVER] Erro na API do Gemini:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor de API rodando em http://localhost:${port}`);
  console.log(`📡 Endpoint disponível: POST http://localhost:${port}/api/gemini`);
});
