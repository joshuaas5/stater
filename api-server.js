// Servidor Express simples para API
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente do .env.local
dotenv.config({ path: '.env.local' });

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log das variáveis de ambiente
console.log('[API-SERVER] GEMINI_API_KEY configurada:', !!process.env.GEMINI_API_KEY);

// Importar handler da API Gemini
const geminiHandler = require('./api/gemini.js');

// Rota para a API Gemini
app.post('/api/gemini', async (req, res) => {
  console.log('[API-SERVER] Recebida requisição para /api/gemini');
  try {
    // Simular formato req/res do Vercel
    await geminiHandler(req, res);
  } catch (error) {
    console.error('[API-SERVER] Erro ao processar requisição:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`[API-SERVER] 🚀 Servidor rodando na porta ${port}`);
});
