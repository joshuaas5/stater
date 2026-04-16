// Vercel Serverless Function para proxy seguro Gemini 1.5 Pro
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'MÃ©todo nÃ£o permitido' });
    return;
  }
  try {
    const { history } = req.body;
    if (!history || !Array.isArray(history)) {
      res.status(400).json({ error: 'HistÃ³rico de mensagens ausente.' });
      return;
    }
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
    if (!GEMINI_API_KEY) {
      res.status(500).json({ error: 'GEMINI_API_KEY não configurada.' });
      return;
    }
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

    const context = `VocÃª Ã© uma IA chamada VOYB IA e atua em um aplicativo de organizaÃ§Ã£o e controle financeiro, deve responder de forma inteligente e correta, como um consultor financeiro, mas que tambÃ©m nÃ£o Ã© enrolado, mas que fala o necessÃ¡rio e essencial de maneira que inspire e dÃª Ã³timas ideias para o usuÃ¡rio. Responde utilizando listas, emojis, use negrito para tÃ­tulos e dÃª espaÃ§amento entre tÃ³picos de fala. Se o usuÃ¡rio pedir para registrar uma entrada, saÃ­da ou conta, peÃ§a confirmaÃ§Ã£o antes de registrar. Apenas registre apÃ³s o usuÃ¡rio confirmar explicitamente. Se nÃ£o entender, peÃ§a mais detalhes.`;
    const chatHistory = history.map((msg) => `${msg.sender === "user" ? "UsuÃ¡rio" : "Consultor"}: ${msg.text}`).join("\n");
    const prompt = `${context}\n\nHistÃ³rico:\n${chatHistory}\n\nResposta:`;

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



