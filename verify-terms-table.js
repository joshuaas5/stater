const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qnxgshyoagzwvokprwlt.supabase.co';
const supabaseKey = 'YOUR_JWT_TOKEN';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTermsTable() {
  console.log('🔧 Criando tabela user_terms_acceptance via SQL...');
  
  try {
    // Primeiro, vamos testar a conexão
    const { data: testData, error: testError } = await supabase.from('profiles').select('id').limit(1);
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError);
      return;
    }
    
    console.log('✅ Conexão com Supabase OK');
    
    // Agora vamos inserir um registro de teste na tabela que já existe
    const { data, error } = await supabase
      .from('user_terms_acceptance')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('❌ Tabela não existe, precisa ser criada via SQL Dashboard do Supabase');
      console.log('📝 SQL para executar no Dashboard:');
      console.log(`
-- Tabela para armazenar o aceite dos termos de uso pelos usuários
CREATE TABLE IF NOT EXISTS user_terms_acceptance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  version VARCHAR(10) NOT NULL DEFAULT '1.0',
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que cada usuário só pode ter um registro de aceite
  UNIQUE(user_id)
);

-- RLS (Row Level Security) para garantir que usuários só vejam seus próprios dados
ALTER TABLE user_terms_acceptance ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios dados
CREATE POLICY "Users can view their own terms acceptance" ON user_terms_acceptance
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram/atualizem apenas seus próprios dados
CREATE POLICY "Users can insert/update their own terms acceptance" ON user_terms_acceptance
  FOR ALL USING (auth.uid() = user_id);

-- Índice para melhorar performance de consultas por user_id
CREATE INDEX IF NOT EXISTS idx_user_terms_acceptance_user_id ON user_terms_acceptance(user_id);
      `);
    } else if (error) {
      console.error('❌ Erro ao verificar tabela:', error);
    } else {
      console.log('✅ Tabela user_terms_acceptance já existe!');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createTermsTable().catch(console.error);
