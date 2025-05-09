// Vercel Serverless Function para proxy seguro Gemini 1.5 Pro
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }
  try {
    const { history } = req.body;
    if (!history || !Array.isArray(history)) {
      res.status(400).json({ error: 'Histórico de mensagens ausente.' });
      return;
    }
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

    const context = `Você é um consultor financeiro pessoal. Sempre responda em português, de forma clara e objetiva. Se o usuário pedir para registrar uma entrada, saída ou conta, peça confirmação antes de registrar. Apenas registre após o usuário confirmar explicitamente. Se não entender, peça mais detalhes.`;
    const chatHistory = history.map((msg) => `${msg.sender === "user" ? "Usuário" : "Consultor"}: ${msg.text}`).join("\n");
    const prompt = `${context}\n\nHistórico:\n${chatHistory}\n\nResposta:`;

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await geminiRes.json();
    const resposta = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta da IA.';
    res.status(200).json({ resposta });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao consultar Gemini.' });
  }
}
