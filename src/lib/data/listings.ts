import "server-only";
import { db, join } from "./store";
import { CATEGORY_LIST } from "../categories";
import { isSupabaseConfigured } from "../supabase/config";
import { createSupabasePublicClient } from "../supabase/public";
import { mapListing } from "./map";
import type { AnimalType, PublicListing } from "../types";

/**
 * Public read layer. Reads from the RLS-protected `fg_public_listings` view when
 * Supabase is configured, otherwise from the in-memory seed store (local dev).
 * Only `active`/`sold` listings are ever returned (enforced by the view + store).
 */

export interface ListingFilters {
  type?: AnimalType;
  district?: string;
  search?: string;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc";
}

const sb = () => isSupabaseConfigured();

// ---------------- seed-store helpers ----------------
function storeListings(): PublicListing[] {
  return db()
    .listings.filter((l) => l.status === "active" || l.status === "sold")
    .map(join)
    .filter((l): l is PublicListing => l !== null);
}

function sortRows(rows: PublicListing[], sort?: ListingFilters["sort"]) {
  const s =
    sort === "price-asc"
      ? [...rows].sort((a, b) => a.priceRwf - b.priceRwf)
      : sort === "price-desc"
        ? [...rows].sort((a, b) => b.priceRwf - a.priceRwf)
        : [...rows].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return [...s].sort((a, b) => Number(b.featured) - Number(a.featured));
}

// ---------------- public API ----------------
export async function getListings(
  filters: ListingFilters = {},
): Promise<PublicListing[]> {
  if (sb()) {
    const c = createSupabasePublicClient();
    let q = c.from("fg_public_listings").select("*");
    if (filters.type) q = q.eq("animal_type", filters.type);
    if (filters.district) q = q.ilike("district", filters.district);
    if (typeof filters.maxPrice === "number") q = q.lte("price_rwf", filters.maxPrice);
    if (filters.search) {
      const t = filters.search.replace(/[%,]/g, "");
      q = q.or(`title.ilike.%${t}%,breed.ilike.%${t}%,district.ilike.%${t}%`);
    }
    const { data } = await q;
    return sortRows((data ?? []).map(mapListing), filters.sort);
  }

  let rows = storeListings();
  if (filters.type) rows = rows.filter((l) => l.animalType === filters.type);
  if (filters.district)
    rows = rows.filter((l) => l.district.toLowerCase() === filters.district!.toLowerCase());
  if (typeof filters.maxPrice === "number")
    rows = rows.filter((l) => l.priceRwf <= filters.maxPrice!);
  if (filters.search) {
    const ql = filters.search.toLowerCase().trim();
    rows = rows.filter(
      (l) =>
        l.title.toLowerCase().includes(ql) ||
        l.breed.toLowerCase().includes(ql) ||
        l.animalType.includes(ql) ||
        l.district.toLowerCase().includes(ql),
    );
  }
  return sortRows(rows, filters.sort);
}

export async function getFeaturedListings(limit = 4): Promise<PublicListing[]> {
  if (sb()) {
    const c = createSupabasePublicClient();
    const { data } = await c
      .from("fg_public_listings")
      .select("*")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []).map(mapListing);
  }
  const all = storeListings();
  return [...all.filter((l) => l.featured), ...all.filter((l) => !l.featured)].slice(0, limit);
}

export async function getListingBySlug(slug: string): Promise<PublicListing | null> {
  if (sb()) {
    const c = createSupabasePublicClient();
    const { data } = await c.from("fg_public_listings").select("*").eq("slug", slug).maybeSingle();
    return data ? mapListing(data) : null;
  }
  return storeListings().find((l) => l.slug === slug) ?? null;
}

export async function getRelatedListings(
  listing: PublicListing,
  limit = 3,
): Promise<PublicListing[]> {
  if (sb()) {
    const c = createSupabasePublicClient();
    const { data } = await c
      .from("fg_public_listings")
      .select("*")
      .eq("animal_type", listing.animalType)
      .neq("id", listing.id)
      .limit(limit);
    return (data ?? []).map(mapListing);
  }
  return storeListings()
    .filter((l) => l.animalType === listing.animalType && l.id !== listing.id)
    .slice(0, limit);
}

export async function getAllSlugs(): Promise<string[]> {
  if (sb()) {
    const c = createSupabasePublicClient();
    const { data } = await c.from("fg_public_listings").select("slug");
    return (data ?? []).map((r) => String(r.slug));
  }
  return storeListings().map((l) => l.slug);
}

export async function getCategoryCounts(): Promise<{ type: AnimalType; count: number }[]> {
  let rows: { animalType: AnimalType }[];
  if (sb()) {
    const c = createSupabasePublicClient();
    const { data } = await c.from("fg_public_listings").select("animal_type");
    rows = (data ?? []).map((r) => ({ animalType: r.animal_type as AnimalType }));
  } else {
    rows = storeListings();
  }
  return CATEGORY_LIST.map((cat) => ({
    type: cat.type,
    count: rows.filter((l) => l.animalType === cat.type).length,
  }));
}

export async function getDistricts(): Promise<string[]> {
  if (sb()) {
    const c = createSupabasePublicClient();
    const { data } = await c.from("fg_public_listings").select("district");
    return Array.from(new Set((data ?? []).map((r) => String(r.district)))).sort();
  }
  return Array.from(new Set(storeListings().map((l) => l.district))).sort();
}
