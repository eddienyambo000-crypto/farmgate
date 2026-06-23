import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Anon Supabase client for server components / route handlers. Uses the public
 * anon key, which is safe to expose because Row-Level Security governs what it
 * can read. Public data is reached through the RLS-protected `public_listings`
 * view, which never exposes seller contact columns.
 */
export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const jar = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) =>
            jar.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — safe to ignore; middleware refreshes.
        }
      },
    },
  });
}
