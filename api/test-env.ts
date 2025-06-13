// Verificar variáveis de ambiente
export default async function handler(req: any, res: any) {
  console.log('[ENV_TEST] Verificando variáveis de ambiente');
  
  const envCheck = {
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: process.env.NODE_ENV
  };
  
  console.log('[ENV_TEST] Env check:', envCheck);
  
  return res.status(200).json({
    success: true,
    environment: envCheck,
    timestamp: new Date().toISOString()
  });
}
