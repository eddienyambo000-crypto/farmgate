import "server-only";
import { isSupabaseConfigured } from "../supabase/config";
import { DEFAULT_SETTINGS, type SiteSettings } from "../settings-types";

/**
 * Site settings — owner-editable branding/contact, stored in the singleton
 * `fg_site_settings` row. Public reads use the anon client (settings are
 * public); admin writes use the service role. Everything falls back to the
 * defaults so the site always renders.
 */
export type { SiteSettings };
export { DEFAULT_SETTINGS };

function mapSettings(r: Record<string, unknown> | null): SiteSettings {
  if (!r) return DEFAULT_SETTINGS;
  const socials = (r.socials as Record<string, string>) ?? {};
  return {
    logoUrl: (r.logo_url as string) || null,
    heroTitle: (r.hero_title as string) || null,
    heroSubtitle: (r.hero_subtitle as string) || null,
    contactPhone: (r.contact_phone as string) || DEFAULT_SETTINGS.contactPhone,
    contactEmail: (r.contact_email as string) || DEFAULT_SETTINGS.contactEmail,
    contactWhatsapp:
      (r.contact_whatsapp as string) || DEFAULT_SETTINGS.contactWhatsapp,
    instagram: socials.instagram ?? "",
    facebook: socials.facebook ?? "",
    announcement: (r.announcement as string) || null,
  };
}

export async function getSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return DEFAULT_SETTINGS;
  const { createSupabasePublicClient } = await import("../supabase/public");
  const c = createSupabasePublicClient();
  const { data } = await c.from("fg_site_settings").select("*").eq("id", 1).maybeSingle();
  return mapSettings(data);
}

export interface SettingsInput {
  logoUrl: string | null;
  heroTitle: string;
  heroSubtitle: string;
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp: string;
  instagram: string;
  facebook: string;
  announcement: string;
}

export async function updateSettings(input: SettingsInput): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { createSupabaseAdminClient } = await import("../supabase/admin");
  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("fg_site_settings")
    .update({
      logo_url: input.logoUrl,
      hero_title: input.heroTitle || null,
      hero_subtitle: input.heroSubtitle || null,
      contact_phone: input.contactPhone,
      contact_email: input.contactEmail,
      contact_whatsapp: input.contactWhatsapp.replace(/[^\d]/g, ""),
      socials: { instagram: input.instagram, facebook: input.facebook },
      announcement: input.announcement || null,
    })
    .eq("id", 1);
  return !error;
}
