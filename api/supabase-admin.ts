// Serverless utilitário para acessar o Supabase Admin API (Node)
import { createClient } from '@supabase/supabase-js';

// Configuração básica e funcional
const supabaseUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseAnonKey = 'YOUR_JWT_TOKEN';

// Usar cliente simples com a chave anon (que funcionava antes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);
