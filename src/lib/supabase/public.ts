import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Anonymous Supabase client for PUBLIC reads (marketplace data). No cookies or
 * session needed — it reads only the RLS-protected `fg_public_*` views, which
 * expose safe columns only. Safe to use at build time (generateStaticParams)
 * and at request time. Uses the public anon key.
 */
export function createSupabasePublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
