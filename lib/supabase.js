import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars.\n' +
    'Create a .env file at the project root with:\n' +
    '  EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co\n' +
    '  EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
