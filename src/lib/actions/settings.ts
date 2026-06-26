"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { updateSettings } from "@/lib/data/settings";

export interface SettingsResult {
  ok: boolean;
  error?: string;
  saved?: boolean;
}

function str(fd: FormData, k: string): string {
  return String(fd.get(k) ?? "").trim();
}

export async function updateSettingsAction(
  _prev: SettingsResult | undefined,
  fd: FormData,
): Promise<SettingsResult> {
  if (!(await isAdmin())) return { ok: false, error: "Not authorized." };

  const ok = await updateSettings({
    logoUrl: str(fd, "logoUrl") || null,
    heroTitle: str(fd, "heroTitle"),
    heroSubtitle: str(fd, "heroSubtitle"),
    contactPhone: str(fd, "contactPhone"),
    contactEmail: str(fd, "contactEmail"),
    contactWhatsapp: str(fd, "contactWhatsapp"),
    instagram: str(fd, "instagram"),
    facebook: str(fd, "facebook"),
    announcement: str(fd, "announcement"),
  });
  if (!ok) return { ok: false, error: "Could not save. Try again." };

  // Settings affect the whole site chrome.
  revalidatePath("/", "layout");
  return { ok: true, saved: true };
}
