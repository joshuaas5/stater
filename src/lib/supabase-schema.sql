
-- Esquema SQL para as tabelas do Supabase

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL
);

-- Trigger para atualizar o timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  userId UUID REFERENCES auth.users(id) NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_day INTEGER,
  due_date TIMESTAMP WITH TIME ZONE,
  is_paid BOOLEAN DEFAULT FALSE,
  total_installments INTEGER,
  current_installment INTEGER,
  is_card_bill BOOLEAN DEFAULT FALSE,
  card_items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL
);

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Tabela de contas a pagar
CREATE TABLE IF NOT EXISTS bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_day INTEGER,
  category TEXT NOT NULL,
  userId UUID REFERENCES auth.users(id) NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  total_installments INTEGER,
  current_installment INTEGER,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  notification_days INTEGER[],
  is_card_bill BOOLEAN DEFAULT FALSE,
  card_items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL
);

CREATE TRIGGER update_bills_updated_at
BEFORE UPDATE ON bills
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  billId UUID REFERENCES bills(id),
  userId UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL
);

-- Tabela de preferências do usuário
CREATE TABLE IF NOT EXISTS preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  userId UUID REFERENCES auth.users(id) NOT NULL,
  preferences JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL
);

CREATE TRIGGER update_preferences_updated_at
BEFORE UPDATE ON preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver apenas seu próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para transactions
CREATE POLICY "Usuários podem ver apenas suas próprias transações" ON transactions
  FOR SELECT USING (auth.uid() = userId);
  
CREATE POLICY "Usuários podem inserir suas próprias transações" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = userId);
  
CREATE POLICY "Usuários podem atualizar apenas suas próprias transações" ON transactions
  FOR UPDATE USING (auth.uid() = userId);
  
CREATE POLICY "Usuários podem excluir apenas suas próprias transações" ON transactions
  FOR DELETE USING (auth.uid() = userId);

-- Políticas para bills
CREATE POLICY "Usuários podem ver apenas suas próprias contas" ON bills
  FOR SELECT USING (auth.uid() = userId);
  
CREATE POLICY "Usuários podem inserir suas próprias contas" ON bills
  FOR INSERT WITH CHECK (auth.uid() = userId);
  
CREATE POLICY "Usuários podem atualizar apenas suas próprias contas" ON bills
  FOR UPDATE USING (auth.uid() = userId);
  
CREATE POLICY "Usuários podem excluir apenas suas próprias contas" ON bills
  FOR DELETE USING (auth.uid() = userId);

-- Políticas para notifications
CREATE POLICY "Usuários podem ver apenas suas próprias notificações" ON notifications
  FOR SELECT USING (auth.uid() = userId);
  
CREATE POLICY "Usuários podem inserir suas próprias notificações" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = userId);
  
CREATE POLICY "Usuários podem atualizar apenas suas próprias notificações" ON notifications
  FOR UPDATE USING (auth.uid() = userId);
  
CREATE POLICY "Usuários podem excluir apenas suas próprias notificações" ON notifications
  FOR DELETE USING (auth.uid() = userId);

-- Políticas para preferences
CREATE POLICY "Usuários podem ver apenas suas próprias preferências" ON preferences
  FOR SELECT USING (auth.uid() = userId);
  
CREATE POLICY "Usuários podem inserir suas próprias preferências" ON preferences
  FOR INSERT WITH CHECK (auth.uid() = userId);
  
CREATE POLICY "Usuários podem atualizar apenas suas próprias preferências" ON preferences
  FOR UPDATE USING (auth.uid() = userId);
