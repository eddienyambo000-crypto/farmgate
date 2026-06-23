/**
 * Whether Supabase is wired up. When false, the app runs entirely on seed data
 * and in-memory stores, so it works with zero backend configuration.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
