-- Tabela para controle de uso da Gemini
create table if not exists gemini_usage (
  id serial primary key,
  period_type text not null, -- 'month', 'week', 'day', 'hour'
  period_value text not null, -- ex: '2025-05', '2025-05-09', '2025-05-09-17'
  tokens integer not null default 0,
  requests integer not null default 0,
  updated_at timestamp with time zone default now(),
  unique(period_type, period_value)
);

-- Tabela para controle de onboarding dos usuários (persistência global)
create table if not exists user_onboarding (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  onboarding_completed boolean not null default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

-- Habilitar Row Level Security
alter table user_onboarding enable row level security;

-- Política para permitir que usuários vejam apenas seus próprios dados
create policy "Users can view own onboarding data" on user_onboarding
  for select using (auth.uid() = user_id);

-- Política para permitir que usuários insiram seus próprios dados
create policy "Users can insert own onboarding data" on user_onboarding
  for insert with check (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seus próprios dados
create policy "Users can update own onboarding data" on user_onboarding
  for update using (auth.uid() = user_id);
