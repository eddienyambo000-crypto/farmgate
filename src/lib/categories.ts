import type { AnimalType } from "./types";

export interface CategoryMeta {
  type: AnimalType; // slug
  label: string;
  labelRw: string; // Kinyarwanda
  plural: string;
  blurb: string;
  synonyms: string; // everyday search words (EN + RW)
}

/** Default categories — the fallback when Supabase isn't reachable. */
export const CATEGORIES: Record<string, CategoryMeta> = {
  cattle: { type: "cattle", label: "Cattle", labelRw: "Inka", plural: "Cattle", blurb: "Dairy cows, calves & breeding stock", synonyms: "cow cows bull bulls calf heifer dairy beef inka" },
  goat: { type: "goat", label: "Goats", labelRw: "Ihene", plural: "Goats", blurb: "Meat, breeding & dairy goats", synonyms: "goats kid buck doe ihene" },
  sheep: { type: "sheep", label: "Sheep", labelRw: "Intama", plural: "Sheep", blurb: "Healthy sheep for meat & breeding", synonyms: "lamb lambs mutton ram ewe intama" },
  pig: { type: "pig", label: "Pigs", labelRw: "Ingurube", plural: "Pigs", blurb: "Piglets, sows & fattened pigs", synonyms: "pigs swine pork piglet sow boar ingurube" },
  chicken: { type: "chicken", label: "Chickens", labelRw: "Inkoko", plural: "Chickens", blurb: "Broilers, layers & chicks", synonyms: "chickens hen hens broiler broilers layer layers poultry chick inkoko" },
  rabbit: { type: "rabbit", label: "Rabbits", labelRw: "Urukwavu", plural: "Rabbits", blurb: "Breeding & meat rabbit breeds", synonyms: "rabbits bunny kit urukwavu" },
};

export const CATEGORY_LIST: CategoryMeta[] = Object.values(CATEGORIES);

/** Slugify a typed category name, e.g. "Turkey Birds" → "turkey-birds". */
export function categorySlug(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
