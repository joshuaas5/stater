// Simple Express server for API testing
const express = require('express');
const cors = require('cors');
const geminiHandler = require('./gemini-simple.js');

const app = express();
const port = 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

console.log('[API-SERVER] Starting with hard-coded API key');

// API route handler
app.post('/api/gemini', async (req, res) => {
  console.log('[API-SERVER] Received request to /api/gemini');
  console.log('[API-SERVER] Request body:', JSON.stringify(req.body));
  
  try {
    await geminiHandler(req, res);
  } catch (error) {
    console.error('[API-SERVER] Error processing request:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(port, () => {
  console.log(`[API-SERVER] 🚀 Server running on http://localhost:${port}`);
});
