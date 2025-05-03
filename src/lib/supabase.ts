
import { createClient } from '@supabase/supabase-js';

// Set your Supabase URL and ANON key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';

// Check if environment variables are set
console.log('Supabase URL:', supabaseUrl);
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.log('Using default Supabase configuration values');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
