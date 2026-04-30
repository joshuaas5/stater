import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('[supabase-admin] Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY env vars.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
