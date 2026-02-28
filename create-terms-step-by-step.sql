-- EXECUTE LINHA POR LINHA NO SUPABASE SQL EDITOR:

-- 1. Primeiro, crie a tabela básica:
CREATE TABLE user_terms_acceptance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  version VARCHAR(10) NOT NULL DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Em seguida, habilite RLS:
ALTER TABLE user_terms_acceptance ENABLE ROW LEVEL SECURITY;

-- 3. Depois, crie a política de segurança:
CREATE POLICY "Users can manage their own terms acceptance" 
ON user_terms_acceptance 
FOR ALL 
USING (auth.uid() = user_id);

-- 4. Por último, crie o índice:
CREATE INDEX idx_user_terms_acceptance_user_id ON user_terms_acceptance(user_id);
