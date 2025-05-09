// Gemini 2.0 Flash Lite API integration for Finan Freedom
// Uses the Google Gemini API (generative language API)
// Expects GEMINI_API_KEY to be set in environment variables (e.g. Vercel)

// Chama a serverless function protegida /api/gemini
export async function fetchGeminiFlashLite(
  prompt: string,
  options?: { systemInstruction?: string }
): Promise<string> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstruction: options?.systemInstruction })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Erro ao acessar Gemini');
  }
  const data = await response.json();
  return (data.resposta || '').trim();
}
