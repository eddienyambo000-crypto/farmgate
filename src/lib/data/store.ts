import "server-only";
import { randomUUID } from "crypto";
import {
  LISTINGS as SEED_LISTINGS,
  SELLERS as SEED_SELLERS,
  SELLER_CONTACTS as SEED_CONTACTS,
} from "./seed";
import type {
  PublicListing,
  PublicSeller,
  SellerContact,
  Inquiry,
} from "../types";

/**
 * In-memory backend used when Supabase is not configured. It is seeded from
 * `seed.ts` and supports full CRUD so the admin panel is genuinely interactive
 * in local development. It does NOT persist across serverless cold starts —
 * real persistence comes from Supabase. The shape mirrors the database exactly,
 * so swapping backends is a one-line change in `repo.ts`.
 */

export type RawListing = Omit<PublicListing, "seller"> & { sellerId: string };

export interface SellerApplication {
  id: string;
  fullName: string;
  phone: string;
  district: string;
  animalType: string;
  animalCount: string;
  details: string;
  createdAt: string;
}

interface DB {
  sellers: Map<string, PublicSeller>;
  contacts: Map<string, SellerContact>;
  listings: RawListing[];
  inquiries: Inquiry[];
  applications: SellerApplication[];
}

// A module-level singleton, guarded so hot-reload in dev doesn't wipe it.
const g = globalThis as unknown as { __fgDB?: DB };

function seed(): DB {
  const sellers = new Map(Object.entries(SEED_SELLERS));
  const contacts = new Map(Object.entries(SEED_CONTACTS));
  const listings: RawListing[] = SEED_LISTINGS.map(({ seller, ...rest }) => ({
    ...rest,
    sellerId: seller.id,
  }));
  return { sellers, contacts, listings, inquiries: [], applications: [] };
}

export function db(): DB {
  if (!g.__fgDB) g.__fgDB = seed();
  return g.__fgDB;
}

export function join(raw: RawListing): PublicListing | null {
  const seller = db().sellers.get(raw.sellerId);
  if (!seller) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sellerId, ...rest } = raw;
  return { ...rest, seller };
}

export function newId(): string {
  return randomUUID();
}

export function slugify(title: string, district: string): string {
  const base = `${title}-${district}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const existing = new Set(db().listings.map((l) => l.slug));
  if (!existing.has(base)) return base;
  let i = 2;
  while (existing.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
