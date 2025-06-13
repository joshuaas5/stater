// Verificar modelos disponíveis do Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDTTPO0otruHVzh7bXsi7MCyG674P03758";

export default async function handler(req: any, res: any) {
  console.log('[MODELS] Listando modelos disponíveis...');
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ 
        error: 'Erro ao listar modelos',
        details: errorText 
      });
    }

    const data = await response.json() as any;
    
    // Filtrar apenas modelos que suportam generateContent
    const visionModels = data.models?.filter((model: any) => 
      model.supportedGenerationMethods?.includes('generateContent') &&
      model.name.toLowerCase().includes('gemini')
    ) || [];

    return res.status(200).json({
      success: true,
      totalModels: data.models?.length || 0,
      visionModels: visionModels.map((model: any) => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        supportedMethods: model.supportedGenerationMethods
      })),
      recommendation: visionModels.length > 0 ? visionModels[0].name : null
    });

  } catch (error: any) {
    console.error('[MODELS] Erro:', error);
    return res.status(500).json({ 
      error: 'Erro interno',
      message: error.message
    });
  }
}
