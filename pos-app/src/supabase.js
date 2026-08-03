import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ayougweoubvftcsfqwwm.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2gLrbQEWyAOK0-9p2ByHgA_9QzZfP9g';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
