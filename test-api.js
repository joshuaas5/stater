const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';

// Teste com service role se disponível
const supabase = createClient(
  supabaseUrl, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey,
  {
    auth: { 
      autoRefreshToken: false, 
      persistSession: false 
    }
  }
);

async function testCodeGeneration() {
  console.log('Testing code generation...');
  
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const userId = '550e8400-e29b-41d4-a716-446655440000'; // UUID válido de teste
  const userEmail = 'test@example.com';
  const userName = 'Test User';
  
  console.log('Generated code:', code);
  console.log('Using service role:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    const { error: insertError } = await supabase
      .from('telegram_link_codes')
      .insert([{
        code,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutos
        created_at: new Date().toISOString()
      }]);

    if (insertError) {
      console.error('Insert error:', insertError);
      return;
    }

    console.log('Code successfully inserted!');
    
    // Teste de busca
    const { data: codeData, error: selectError } = await supabase
      .from('telegram_link_codes')
      .select('*')
      .eq('code', code)
      .single();
      
    if (selectError) {
      console.error('Select error:', selectError);
      return;
    }
    
    console.log('Code found:', codeData);
    
  } catch (error) {
    console.error('General error:', error);
  }
}

testCodeGeneration();
