// API para gerenciar códigos de conexão Telegram - Stater
import { supabaseAdmin } from './supabase-admin';

// Função para gerar código aleatório de 6 dígitos
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req: any, res: any) {
  try {
    // GET - Verificar código
    if (req.method === 'GET') {
      const { code } = req.query;
      
      if (!code) {
        return res.status(400).json({ error: 'Código é obrigatório' });
      }
      
      console.log('🔍 Verificando código:', code);
      
      // Buscar código no banco
      const { data, error } = await supabaseAdmin
        .from('telegram_codes')
        .select('*')
        .eq('code', code)
        .eq('is_used', false)
        .gte('expires_at', new Date().toISOString())
        .single();
      
      if (error || !data) {
        console.log('❌ Código inválido ou expirado');
        return res.status(404).json({ 
          valid: false, 
          error: 'Código inválido ou expirado' 
        });
      }
      
      console.log('✅ Código válido:', data);
      return res.status(200).json({
        valid: true,
        userId: data.user_id,
        userEmail: data.user_email,
        userName: data.user_name
      });
    }
    
    // POST - Gerar novo código
    if (req.method === 'POST') {
      const { action } = req.query;
      const { code, chatId } = req.body;
      
      // Marcar código como usado
      if (action !== 'generate' && code && chatId) {
        const { error } = await supabaseAdmin
          .from('telegram_codes')
          .update({ 
            is_used: true, 
            used_at: new Date().toISOString(),
            chat_id: chatId
          })
          .eq('code', code);
        
        if (error) {
          return res.status(500).json({ error: 'Erro ao marcar código como usado' });
        }
        
        return res.status(200).json({ success: true });
      }
      
      // Gerar novo código
      if (action === 'generate') {
        const { userId, userEmail, userName } = req.body;
        
        if (!userId) {
          return res.status(400).json({ error: 'userId é obrigatório' });
        }
        
        // Invalidar códigos antigos do usuário
        await supabaseAdmin
          .from('telegram_codes')
          .update({ is_used: true })
          .eq('user_id', userId)
          .eq('is_used', false);
        
        // Gerar novo código
        const newCode = generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
        
        const { data, error } = await supabaseAdmin
          .from('telegram_codes')
          .insert([{
            code: newCode,
            user_id: userId,
            user_email: userEmail,
            user_name: userName,
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (error) {
          console.error('❌ Erro ao gerar código:', error);
          return res.status(500).json({ error: 'Erro ao gerar código' });
        }
        
        console.log('✅ Código gerado:', newCode);
        return res.status(200).json({
          success: true,
          code: newCode,
          expiresAt: expiresAt.toISOString()
        });
      }
      
      return res.status(400).json({ error: 'Ação inválida' });
    }
    
    return res.status(405).json({ error: 'Método não permitido' });
    
  } catch (error) {
    console.error('❌ Erro crítico na API codes:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
