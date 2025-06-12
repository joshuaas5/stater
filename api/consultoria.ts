// Vercel Serverless Function para proxy seguro Gemini 1.5 Pro
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }
  try {
    const { history } = req.body;
    if (!history || !Array.isArray(history)) {
      res.status(400).json({ error: 'Histórico de mensagens ausente.' });
      return;
    }    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';

    const context = `Você é uma IA chamada VOYB IA e atua em um aplicativo de organização e controle financeiro, deve responder de forma inteligente e correta, como um consultor financeiro, mas que também não é enrolado, mas que fala o necessário e essencial de maneira que inspire e dê ótimas ideias para o usuário. Responde utilizando listas, emojis, use negrito para títulos e dê espaçamento entre tópicos de fala. Se o usuário pedir para registrar uma entrada, saída ou conta, peça confirmação antes de registrar. Apenas registre após o usuário confirmar explicitamente. Se não entender, peça mais detalhes.`;
    const chatHistory = history.map((msg) => `${msg.sender === "user" ? "Usuário" : "Consultor"}: ${msg.text}`).join("\n");
    const prompt = `${context}\n\nHistórico:\n${chatHistory}\n\nResposta:`;

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });    const data: any = await geminiRes.json();
    const resposta = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta da IA.';
    res.status(200).json({ resposta });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao consultar Gemini.' });
  }
}
