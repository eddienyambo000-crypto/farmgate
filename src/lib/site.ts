/**
 * Central site configuration.
 *
 * IMPORTANT — the marketplace leverage rule:
 * Buyers and the public NEVER see an individual seller's contact details.
 * The ONLY contact exposed publicly is the Farmgate platform contact below.
 * Every buyer interest is captured as an inquiry and routed through the
 * platform, so Farmgate owns the relationship. See src/lib/types.ts.
 */
export const SITE = {
  name: "Farmgate Rwanda",
  legalName: "Farmgate Rwanda",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://farmgaterwanda.com",
  description:
    "Farmgate Rwanda is the country's livestock marketplace — buy and sell cattle, goats, pigs, chickens, sheep and rabbits direct from verified keepers. Fair prices, no middlemen, animals you can trust.",
  tagline: "Rwanda's Livestock Marketplace",

  // Platform contact only — this is the single channel buyers use.
  platform: {
    whatsapp: "250783358497",
    whatsappDisplay: "+250 783 358 497",
    email: "hello@farmgaterwanda.com",
    location: "Bugesera District, Eastern Province, Rwanda",
  },

  social: {
    instagram: "",
    facebook: "",
  },

  stats: {
    yearsExperience: "10+",
    animalsSold: "500+",
    animalTypes: "6",
    commission: "0%",
  },
} as const;
