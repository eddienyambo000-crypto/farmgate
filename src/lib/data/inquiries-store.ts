import "server-only";
import type { Inquiry } from "../types";

/**
 * In-memory inquiry store for seed/demo mode (no Supabase configured).
 *
 * Inquiries are the platform's leverage: every buyer who wants an animal is
 * captured here and routed by the FarmGate team. Buyers never receive a
 * seller's contact details. In production this is replaced by the Supabase
 * `inquiries` table, which the anon key can INSERT into but cannot SELECT
 * (see supabase/schema.sql) — admins read it through the service role.
 *
 * Note: a module-level array does not persist across serverless cold starts;
 * it exists purely so the demo admin view can show submissions during a
 * session. Real persistence comes with Supabase.
 */
const store: Inquiry[] = [];

export function addInquiry(inquiry: Inquiry): void {
  store.unshift(inquiry);
}

export function listInquiries(): Inquiry[] {
  return [...store];
}
