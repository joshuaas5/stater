
import { createClient } from '@supabase/supabase-js';

// Set default values for development - these will be replaced by environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// In a real production environment, we would check if the env vars exist and show an error if they don't
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Supabase URL or Anon Key is missing in environment variables. Using defaults for development only.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
