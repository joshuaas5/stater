// API de debug para testar sistema de conexão Telegram
import { supabaseAdmin } from './supabase-admin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, code, chatId } = req.body;
    
    console.log('🔧 [DEBUG API] Ação:', action, { code, chatId });
    
    if (action === 'create_test_code') {
      // Criar código de teste
      const testCode = code || 'TEST';
      const codeData = {
        code: testCode,
        user_id: 'debug-user-123',
        user_email: 'debug@teste.com',
        user_name: 'Debug User',
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        used_at: null
      };
      
      const { error } = await supabaseAdmin
        .from('telegram_link_codes')
        .insert(codeData);
      
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      
      return res.status(200).json({ 
        success: true, 
        code: testCode,
        message: 'Código de teste criado'
      });
    }
    
    if (action === 'check_code') {
      // Verificar código
      const { data, error } = await supabaseAdmin
        .from('telegram_link_codes')
        .select('*')
        .eq('code', code)
        .single();
      
      return res.status(200).json({ 
        found: !error && !!data,
        data: data,
        error: error?.message
      });
    }
    
    if (action === 'list_codes') {
      // Listar todos os códigos
      const { data, error } = await supabaseAdmin
        .from('telegram_link_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      return res.status(200).json({ 
        codes: data,
        error: error?.message
      });
    }
    
    if (action === 'list_users') {
      // Listar usuários vinculados
      const { data, error } = await supabaseAdmin
        .from('telegram_users')
        .select('*')
        .order('linked_at', { ascending: false })
        .limit(10);
      
      return res.status(200).json({ 
        users: data,
        error: error?.message
      });
    }
    
    if (action === 'cleanup') {
      // Limpar dados de teste
      await supabaseAdmin.from('telegram_link_codes').delete().like('code', '%TEST%');
      await supabaseAdmin.from('telegram_users').delete().eq('user_id', 'debug-user-123');
      
      return res.status(200).json({ 
        success: true,
        message: 'Dados de teste limpos'
      });
    }
    
    return res.status(400).json({ error: 'Ação não reconhecida' });
      } catch (error: any) {
    console.error('❌ [DEBUG API] Erro:', error);
    return res.status(500).json({ error: error.message });
  }
}
