"use server";

import { redirect } from "next/navigation";
import { tokenFor, setAdminCookie, clearAdminCookie } from "@/lib/auth";

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  const token = tokenFor(password);
  if (!token) return { error: "Incorrect password." };
  await setAdminCookie(token);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearAdminCookie();
  redirect("/admin/login");
}
