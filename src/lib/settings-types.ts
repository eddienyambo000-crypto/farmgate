import { SITE } from "./site";

/** Client-safe site settings type + defaults (no server-only deps). */
export interface SiteSettings {
  logoUrl: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp: string;
  instagram: string;
  facebook: string;
  announcement: string | null;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  logoUrl: null,
  heroTitle: null,
  heroSubtitle: null,
  contactPhone: SITE.platform.whatsappDisplay,
  contactEmail: SITE.platform.email,
  contactWhatsapp: SITE.platform.whatsapp,
  instagram: "",
  facebook: "",
  announcement: null,
};
