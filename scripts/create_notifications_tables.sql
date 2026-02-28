-- Criar tabela de notificau00e7u00f5es
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('fiveDaysBefore', 'oneDayBefore', 'dueDay', 'overdue', 'almostFinished', 'paid')),
  message TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de preferu00eancias de notificau00e7u00e3o do usuu00e1rio
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  in_app_notifications BOOLEAN DEFAULT true,
  bills_due_soon BOOLEAN DEFAULT true,
  bills_overdue BOOLEAN DEFAULT true,
  weekly_summary BOOLEAN DEFAULT true,
  notification_days INTEGER[] DEFAULT '{7, 1, 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT user_notification_preferences_user_id_key UNIQUE (user_id)
);

-- Adicionar u00edndices para melhorar a performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_bill_id_idx ON public.notifications(bill_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS notifications_date_idx ON public.notifications(date);

-- Configurar RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Criar polu00edticas de seguranu00e7a para notificau00e7u00f5es
CREATE POLICY "Usuu00e1rios podem ver apenas suas pru00f3prias notificau00e7u00f5es" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuu00e1rios podem inserir apenas suas pru00f3prias notificau00e7u00f5es" 
  ON public.notifications FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuu00e1rios podem atualizar apenas suas pru00f3prias notificau00e7u00f5es" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuu00e1rios podem deletar apenas suas pru00f3prias notificau00e7u00f5es" 
  ON public.notifications FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar polu00edticas de seguranu00e7a para preferu00eancias de notificau00e7u00e3o
CREATE POLICY "Usuu00e1rios podem ver apenas suas pru00f3prias preferu00eancias" 
  ON public.user_notification_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuu00e1rios podem inserir apenas suas pru00f3prias preferu00eancias" 
  ON public.user_notification_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuu00e1rios podem atualizar apenas suas pru00f3prias preferu00eancias" 
  ON public.user_notification_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuu00e1rios podem deletar apenas suas pru00f3prias preferu00eancias" 
  ON public.user_notification_preferences FOR DELETE 
  USING (auth.uid() = user_id);

-- Conceder permissu00f5es ao papel 'authenticated'
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.user_notification_preferences TO authenticated;
