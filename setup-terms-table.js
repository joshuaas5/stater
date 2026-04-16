const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qnxgshyoagzwvokprwlt.supabase.co';
const supabaseKey = 'YOUR_JWT_TOKEN';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTermsTable() {
  console.log('ðŸ”§ Criando tabela user_terms_acceptance...');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Tabela para armazenar o aceite dos termos de uso pelos usuÃ¡rios
      CREATE TABLE IF NOT EXISTS user_terms_acceptance (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        version VARCHAR(10) NOT NULL DEFAULT '1.0',
        user_agent TEXT,
        ip_address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Garantir que cada usuÃ¡rio sÃ³ pode ter um registro de aceite
        UNIQUE(user_id)
      );

      -- RLS (Row Level Security) para garantir que usuÃ¡rios sÃ³ vejam seus prÃ³prios dados
      ALTER TABLE user_terms_acceptance ENABLE ROW LEVEL SECURITY;

      -- Ãndice para melhorar performance de consultas por user_id
      CREATE INDEX IF NOT EXISTS idx_user_terms_acceptance_user_id ON user_terms_acceptance(user_id);
    `
  });

  if (error) {
    console.error('âŒ Erro ao criar tabela:', error);
    return;
  }

  console.log('âœ… Tabela user_terms_acceptance criada com sucesso!');
  
  // Criar polÃ­ticas RLS
  console.log('ðŸ”§ Criando polÃ­ticas RLS...');
  
  const { error: policyError } = await supabase.rpc('exec_sql', {
    sql: `
      -- PolÃ­tica para permitir que usuÃ¡rios vejam apenas seus prÃ³prios dados
      CREATE POLICY IF NOT EXISTS "Users can view their own terms acceptance" ON user_terms_acceptance
        FOR SELECT USING (auth.uid() = user_id);

      -- PolÃ­tica para permitir que usuÃ¡rios insiram/atualizem apenas seus prÃ³prios dados
      CREATE POLICY IF NOT EXISTS "Users can insert/update their own terms acceptance" ON user_terms_acceptance
        FOR ALL USING (auth.uid() = user_id);
    `
  });
  
  if (policyError) {
    console.error('âŒ Erro ao criar polÃ­ticas RLS:', policyError);
    return;
  }
  
  console.log('âœ… PolÃ­ticas RLS criadas com sucesso!');
  console.log('ðŸŽ‰ Setup da tabela de aceite dos termos concluÃ­do!');
}

createTermsTable().catch(console.error);
