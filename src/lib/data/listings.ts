import "server-only";
import { LISTINGS } from "./seed";
import { CATEGORY_LIST } from "../categories";
import type { AnimalType, PublicListing } from "../types";

/**
 * Data-access layer. Today it is backed by the seed data; when Supabase env vars
 * are configured this is the single place to swap in queries against the
 * RLS-protected `public_listings` view. Every function is async so callers don't
 * change when the backend lands.
 *
 * Marked `server-only`: this module reaches the database and must never end up in
 * a client bundle.
 */

export interface ListingFilters {
  type?: AnimalType;
  district?: string;
  search?: string;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc";
}

function activeListings(): PublicListing[] {
  return LISTINGS.filter((l) => l.status === "active" || l.status === "sold");
}

export async function getListings(
  filters: ListingFilters = {},
): Promise<PublicListing[]> {
  let rows = activeListings();

  if (filters.type) rows = rows.filter((l) => l.animalType === filters.type);
  if (filters.district)
    rows = rows.filter(
      (l) => l.district.toLowerCase() === filters.district!.toLowerCase(),
    );
  if (typeof filters.maxPrice === "number")
    rows = rows.filter((l) => l.priceRwf <= filters.maxPrice!);
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    rows = rows.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.breed.toLowerCase().includes(q) ||
        l.animalType.includes(q) ||
        l.district.toLowerCase().includes(q),
    );
  }

  switch (filters.sort) {
    case "price-asc":
      rows = [...rows].sort((a, b) => a.priceRwf - b.priceRwf);
      break;
    case "price-desc":
      rows = [...rows].sort((a, b) => b.priceRwf - a.priceRwf);
      break;
    default:
      rows = [...rows].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      );
  }

  // Featured first within the chosen sort.
  return [...rows].sort((a, b) => Number(b.featured) - Number(a.featured));
}

export async function getFeaturedListings(
  limit = 4,
): Promise<PublicListing[]> {
  const featured = activeListings().filter((l) => l.featured);
  const rest = activeListings().filter((l) => !l.featured);
  return [...featured, ...rest].slice(0, limit);
}

export async function getListingBySlug(
  slug: string,
): Promise<PublicListing | null> {
  return activeListings().find((l) => l.slug === slug) ?? null;
}

export async function getRelatedListings(
  listing: PublicListing,
  limit = 3,
): Promise<PublicListing[]> {
  return activeListings()
    .filter((l) => l.animalType === listing.animalType && l.id !== listing.id)
    .slice(0, limit);
}

export async function getAllSlugs(): Promise<string[]> {
  return activeListings().map((l) => l.slug);
}

export async function getCategoryCounts(): Promise<
  { type: AnimalType; count: number }[]
> {
  const rows = activeListings();
  return CATEGORY_LIST.map((c) => ({
    type: c.type,
    count: rows.filter((l) => l.animalType === c.type).length,
  }));
}

export async function getDistricts(): Promise<string[]> {
  return Array.from(new Set(activeListings().map((l) => l.district))).sort();
}
