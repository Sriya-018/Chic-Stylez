import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL loaded:", supabaseUrl);
console.log("Supabase Key loaded:", supabaseAnonKey ? "Key is present (Starts with " + supabaseAnonKey.substring(0, 10) + ")" : "KEY IS UNDEFINED!");

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key');
