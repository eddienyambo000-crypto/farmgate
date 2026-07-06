"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Fire-and-forget view counter for a listing. Public (no auth) — it increments
 * via the service role (which bypasses RLS) so an anonymous visitor's view is
 * counted without granting anon any write access to the table.
 */
export async function pingView(listingId: string): Promise<void> {
  if (!isSupabaseConfigured() || !listingId) return;
  try {
    const db = createSupabaseAdminClient();
    await db.rpc("fg_increment_listing_views", { p_id: listingId });
  } catch {
    /* analytics only — never break the page */
  }
}
