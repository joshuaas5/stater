// Serverless utilitário para acessar o Supabase Admin API (Node)
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase Admin com fallbacks seguros
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://tmucbwlhkffrhtexmjze.supabase.co';

// Usar SERVICE_ROLE_KEY que tem privilégios admin, com fallback para ANON
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';

console.log('🔧 Configurando Supabase Admin...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key type:', supabaseServiceRoleKey.includes('service_role') ? 'SERVICE_ROLE' : 'ANON');

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
