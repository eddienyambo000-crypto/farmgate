import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS, so it MUST only ever be used in
 * trusted server-side code (admin dashboard, inquiry routing) and the key MUST
 * never be sent to the browser. It is read from a server-only env var that is
 * not prefixed with NEXT_PUBLIC_, so Next.js will never bundle it client-side.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
