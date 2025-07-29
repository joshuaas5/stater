// Serverless utilitário para acessar o Supabase Admin API (Node)
import { createClient } from '@supabase/supabase-js';

// Configuração básica e funcional
const supabaseUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';

// Usar cliente simples com a chave anon (que funcionava antes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);
