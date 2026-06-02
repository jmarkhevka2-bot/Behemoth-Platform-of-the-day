import { createClient } from '@supabase/supabase-js';

// Fallback to empty strings so createClient doesn't throw during Next.js
// static pre-render at build time. Real values must be set in env vars.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL    ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
);
