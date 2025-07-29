// API para gerenciar códigos de conexão Telegram - Stater
import { supabaseAdmin } from './supabase-admin';

// Função para gerar código aleatório de 6 dígitos
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req: any, res: any) {
  console.log('🚀 API telegram-codes-simple chamada:', {
    method: req.method,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString()
  });

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
        .from('telegram_link_codes')
        .select('*')
        .eq('code', code)
        .is('used_at', null)
        .gte('expires_at', new Date().toISOString());
      
      if (error || !data || data.length === 0) {
        console.log('❌ Código inválido ou expirado');
        return res.status(404).json({ 
          valid: false, 
          error: 'Código inválido ou expirado' 
        });
      }
      
      const codeData = data[0];
      console.log('✅ Código válido:', codeData);
      return res.status(200).json({
        valid: true,
        userId: codeData.user_id,
        userEmail: codeData.user_email,
        userName: codeData.user_name
      });
    }
    
    // POST - Gerar novo código
    if (req.method === 'POST') {
      const { action } = req.query;
      const { code, chatId } = req.body;
      
      // Marcar código como usado
      if (action === 'mark-used' && code) {
        console.log('📝 Marcando código como usado:', code);
        const { error } = await supabaseAdmin
          .from('telegram_link_codes')
          .update({ 
            used_at: new Date().toISOString()
          })
          .eq('code', code);
        
        if (error) {
          console.error('❌ Erro ao marcar código como usado:', error);
          return res.status(500).json({ error: 'Erro ao marcar código como usado' });
        }
        
        console.log('✅ Código marcado como usado com sucesso');
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
          .from('telegram_link_codes')
          .update({ used_at: new Date().toISOString() })
          .eq('user_id', userId)
          .is('used_at', null);
        
        // Gerar novo código (6 dígitos simples)
        const newCode = generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
        
        console.log('📝 Tentando inserir código no banco (action=generate):', {
          code: newCode,
          userId,
          userEmail,
          userName,
          expiresAt: expiresAt.toISOString()
        });
        
        const { data, error } = await supabaseAdmin
          .from('telegram_link_codes')
          .insert([{
            code: newCode,
            user_id: userId,
            user_email: userEmail,
            user_name: userName,
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString()
          }])
          .select();
        
        if (error) {
          console.error('❌ Erro detalhado ao gerar código (action=generate):', {
            error: error,
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          return res.status(500).json({ 
            error: 'Erro ao gerar código',
            details: error.message,
            hint: error.hint 
          });
        }
        
        const insertedCode = data && data[0] ? data[0] : { code: newCode };
        
        console.log('✅ Código gerado:', newCode);
        return res.status(200).json({
          success: true,
          code: newCode,
          expiresAt: expiresAt.toISOString()
        });
      }
      
      // Default POST behavior without action - try to generate code
      if (!action) {
        const { user_id, userId, userEmail, userName } = req.body;
        const finalUserId = user_id || userId; // Support both formats
        
        if (!finalUserId) {
          return res.status(400).json({ 
            error: 'user_id é obrigatório. Use ?action=generate ou forneça user_id no body' 
          });
        }
        
        console.log('🔑 Gerando código (ação padrão) para usuário:', finalUserId);
        
        // Invalidar códigos antigos do usuário
        await supabaseAdmin
          .from('telegram_link_codes')
          .update({ used_at: new Date().toISOString() })
          .eq('user_id', finalUserId)
          .is('used_at', null);
        
        // Gerar novo código (6 dígitos simples)
        const newCode = generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
        
        console.log('📝 Tentando inserir código no banco:', {
          code: newCode,
          userId: finalUserId,
          userEmail,
          userName,
          expiresAt: expiresAt.toISOString()
        });
        
        const { data, error } = await supabaseAdmin
          .from('telegram_link_codes')
          .insert([{
            code: newCode,
            user_id: finalUserId,
            user_email: userEmail,
            user_name: userName,
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString()
          }])
          .select();
        
        if (error) {
          console.error('❌ Erro detalhado ao gerar código:', {
            error: error,
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          return res.status(500).json({ 
            error: 'Erro ao gerar código',
            details: error.message,
            hint: error.hint 
          });
        }
        
        const insertedCode = data && data[0] ? data[0] : { code: newCode };
        
        console.log('✅ Código gerado (ação padrão):', newCode);
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
    console.error('❌ Erro crítico na API telegram-codes-simple:', {
      error: error,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      method: req.method,
      query: req.query,
      body: req.body,
      timestamp: new Date().toISOString()
    });
    
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    });
  }
}
