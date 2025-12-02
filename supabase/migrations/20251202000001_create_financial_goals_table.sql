-- Migration: Create financial_goals table
-- Description: Table for storing user financial goals with full CRUD support

-- Create financial_goals table
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(15, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(15, 2) DEFAULT 0 CHECK (current_amount >= 0),
  deadline DATE NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'other',
  icon VARCHAR(10) NOT NULL DEFAULT '🎯',
  color VARCHAR(100) NOT NULL DEFAULT 'from-blue-400 to-blue-600',
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint to ensure current_amount doesn't exceed target
  CONSTRAINT valid_amounts CHECK (current_amount <= target_amount * 1.5)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON public.financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_is_completed ON public.financial_goals(is_completed);
CREATE INDEX IF NOT EXISTS idx_financial_goals_deadline ON public.financial_goals(deadline);
CREATE INDEX IF NOT EXISTS idx_financial_goals_category ON public.financial_goals(category);

-- Enable RLS (Row Level Security)
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own goals
CREATE POLICY "Users can view own goals" 
  ON public.financial_goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can create their own goals
CREATE POLICY "Users can create own goals" 
  ON public.financial_goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own goals
CREATE POLICY "Users can update own goals" 
  ON public.financial_goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own goals
CREATE POLICY "Users can delete own goals" 
  ON public.financial_goals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_financial_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Auto-set completed_at when goal is marked as completed
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    NEW.completed_at = NOW();
  END IF;
  
  -- Auto-mark as completed when current_amount reaches target_amount
  IF NEW.current_amount >= NEW.target_amount AND OLD.is_completed = FALSE THEN
    NEW.is_completed = TRUE;
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_financial_goals_updated_at ON public.financial_goals;
CREATE TRIGGER trigger_update_financial_goals_updated_at
  BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_goals_updated_at();

-- Grant permissions
GRANT ALL ON public.financial_goals TO authenticated;
GRANT ALL ON public.financial_goals TO service_role;

-- Insert sample goals for testing (optional - comment out in production)
-- INSERT INTO public.financial_goals (user_id, title, description, target_amount, current_amount, deadline, category, icon, color)
-- VALUES 
--   (auth.uid(), 'Reserva de Emergência', '6 meses de despesas', 15000, 4500, '2024-12-31', 'emergency', '🚨', 'from-red-400 to-red-600'),
--   (auth.uid(), 'Viagem para Europa', 'Férias em família', 25000, 8000, '2025-07-01', 'vacation', '✈️', 'from-purple-400 to-purple-600');

COMMENT ON TABLE public.financial_goals IS 'Tabela para armazenar metas financeiras dos usuários';
COMMENT ON COLUMN public.financial_goals.target_amount IS 'Valor alvo da meta em reais';
COMMENT ON COLUMN public.financial_goals.current_amount IS 'Valor atual economizado para a meta';
COMMENT ON COLUMN public.financial_goals.category IS 'Categoria: emergency, investment, purchase, vacation, debt, education, retirement, other';
