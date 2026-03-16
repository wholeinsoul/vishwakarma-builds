import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase admin client that uses the service-role key.
 *
 * This bypasses Row Level Security and should ONLY be used in
 * server-side API routes / server actions where elevated privileges
 * are required (e.g. cron jobs, webhook handlers).
 *
 * Lazily initialized to avoid build-time errors when env vars
 * are not available.
 */
let _supabaseAdmin: SupabaseClient | null = null;

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );
    }
    return (_supabaseAdmin as any)[prop];
  },
});
