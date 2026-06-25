"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Resolve a username or email to the admin login email. */
function toEmail(input: string): string {
  const v = input.trim();
  if (v.includes("@")) return v.toLowerCase();
  const domain = process.env.ADMIN_EMAIL_DOMAIN ?? "farmgaterwanda.com";
  return `${v.toLowerCase()}@${domain}`;
}

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "Enter your username and password." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: toEmail(username),
    password,
  });
  if (error) return { error: "Incorrect username or password." };

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
