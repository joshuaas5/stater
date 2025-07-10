// Serverless utilitário para acessar o Supabase Admin API (Node)
import { createClient } from '@supabase/supabase-js';

// Usar as mesmas variáveis que funcionam no webhook
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
