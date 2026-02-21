// =============================================================================
// MaxiMile Admin Dashboard — Supabase Client
// =============================================================================
// Uses the service_role key for full admin access to all tables.
// In production, this app should be protected by Cloudflare Access or
// similar authentication layer to prevent unauthorized access.
// =============================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
