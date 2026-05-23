import { createClient } from '@supabase/supabase-js'

// Vite requires 'import.meta.env' instead of the standard 'process.env'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);