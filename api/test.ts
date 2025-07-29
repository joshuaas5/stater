// Test endpoint for debugging API issues
export default async function handler(req: any, res: any) {
  try {
    console.log('🧪 API Test endpoint called');
    
    return res.status(200).json({
      success: true,
      message: 'API is working',
      timestamp: new Date().toISOString(),
      method: req.method,
      environment: {
        hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nodeVersion: process.version
      }
    });
  } catch (error) {
    console.error('❌ Test API error:', error);
    return res.status(500).json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
