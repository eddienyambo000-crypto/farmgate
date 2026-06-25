import "server-only";
import { createSupabaseServerClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";

/**
 * Admin authentication via Supabase Auth. A request is an admin iff it carries a
 * valid Supabase session AND that user is registered in `fg_admins` (enforced by
 * RLS — the row is only selectable when fg_is_admin(auth.uid()) is true).
 */
export interface AdminUser {
  id: string;
  email: string;
}

export async function getAdmin(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("fg_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return null;
  return { id: user.id, email: user.email ?? "" };
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdmin()) !== null;
}
