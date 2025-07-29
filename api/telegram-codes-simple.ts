import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';

const supabase = createClient(supabaseUrl, supabaseKey);

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('API telegram codes:', { 
    method: req.method, 
    query: req.query,
    body: req.body 
  });

  try {
    // POST - Gerar novo código
    if (req.method === 'POST') {
      const { user_id, userEmail, userName } = req.body;
      
      if (!user_id) {
        return res.status(400).json({ error: 'user_id é obrigatório' });
      }

      // Invalidar códigos antigos do usuário
      await supabase
        .from('telegram_link_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('user_id', user_id)
        .is('used_at', null);

      // Gerar novo código
      const code = generateCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      const { error } = await supabase
        .from('telegram_link_codes')
        .insert([{
          code,
          user_id,
          user_email: userEmail,
          user_name: userName,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Erro ao gerar código:', error);
        return res.status(500).json({ error: 'Erro ao gerar código', details: error.message });
      }

      console.log('Código gerado:', code);
      return res.status(200).json({ success: true, code, expiresAt: expiresAt.toISOString() });
    }

    // GET - Verificar código
    if (req.method === 'GET') {
      const { code } = req.query;
      
      if (!code) {
        return res.status(400).json({ error: 'Código obrigatório' });
      }

      console.log('Verificando código:', code);

      const { data, error } = await supabase
        .from('telegram_link_codes')
        .select('*')
        .eq('code', code)
        .is('used_at', null)
        .gte('expires_at', new Date().toISOString());

      if (error || !data || data.length === 0) {
        console.log('Código inválido ou expirado');
        return res.status(404).json({ valid: false, error: 'Código inválido ou expirado' });
      }

      const codeData = data[0];
      console.log('Código válido para usuário:', codeData.user_id);
      
      return res.status(200).json({
        valid: true,
        userId: codeData.user_id,
        userEmail: codeData.user_email,
        userName: codeData.user_name
      });
    }

    // PUT - Marcar código como usado
    if (req.method === 'PUT') {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: 'Código obrigatório' });
      }

      console.log('Marcando código como usado:', code);

      const { error } = await supabase
        .from('telegram_link_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('code', code);

      if (error) {
        console.error('Erro ao marcar código como usado:', error);
        return res.status(500).json({ error: 'Erro ao marcar código como usado' });
      }

      console.log('Código marcado como usado com sucesso');
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error: any) {
    console.error('Erro na API:', error);
    return res.status(500).json({ 
      error: 'Erro interno', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
