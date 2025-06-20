// Serverless utilitário para acessar o Supabase Admin API (Node)
import { createClient } from '@supabase/supabase-js';

// Usar as mesmas variáveis que funcionam no webhook
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hlemutzuubhrkuhevsxo.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZW11dHp1dWJocmt1aGV2c3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzMzQ3MTcsImV4cCI6MjA0NjkxMDcxN30.pUaQVR-YwLo6r7_N8n4rZGDCqYeGfgFEhYpyB5YkbzI';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
