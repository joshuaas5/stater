module.exports = async function handler(req, res) {
  // Lista apenas variáveis relevantes (sem expor keys completas por segurança)
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT_SET',
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT_SET',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET (length: ' + (process.env.SUPABASE_ANON_KEY?.length || 0) + ')' : 'NOT_SET',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'SET (length: ' + (process.env.VITE_SUPABASE_ANON_KEY?.length || 0) + ')' : 'NOT_SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (length: ' + (process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0) + ')' : 'NOT_SET',
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT_SET'
  };

  res.status(200).json(envInfo);
};
