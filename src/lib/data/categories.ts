import "server-only";
import { CATEGORY_LIST, type CategoryMeta } from "../categories";
import { isSupabaseConfigured } from "../supabase/config";

/** Live categories from `fg_public_categories`, falling back to the defaults. */
export async function getCategories(): Promise<CategoryMeta[]> {
  if (!isSupabaseConfigured()) return CATEGORY_LIST;
  const { createSupabasePublicClient } = await import("../supabase/public");
  const c = createSupabasePublicClient();
  const { data } = await c
    .from("fg_public_categories")
    .select("*")
    .order("sort", { ascending: true });
  if (!data || data.length === 0) return CATEGORY_LIST;
  return data.map((r) => ({
    type: String(r.slug),
    label: String(r.label),
    labelRw: String(r.label_rw ?? ""),
    plural: String(r.plural ?? r.label),
    blurb: String(r.blurb ?? ""),
    synonyms: String(r.synonyms ?? ""),
  }));
}

/** Slug → CategoryMeta lookup (with default fallback for unknown slugs). */
export async function getCategoryMap(): Promise<Record<string, CategoryMeta>> {
  const list = await getCategories();
  return Object.fromEntries(list.map((c) => [c.type, c]));
}
