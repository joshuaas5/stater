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
