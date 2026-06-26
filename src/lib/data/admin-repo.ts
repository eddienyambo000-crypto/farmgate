import "server-only";
import {
  db,
  join,
  newId,
  slugify,
  type RawListing,
  type SellerApplication,
} from "./store";
import { isSupabaseConfigured } from "../supabase/config";
import { createSupabaseAdminClient } from "../supabase/admin";
import type {
  PublicListing,
  PublicSeller,
  SellerContact,
  Inquiry,
  InquiryStatus,
  ListingStatus,
  AnimalType,
  Gender,
  Purpose,
} from "../types";

/**
 * Admin data access (reads + writes). Used only by admin server actions / pages
 * that have already verified the caller is an admin. When Supabase is configured
 * it uses the service-role client against the fg_ tables; otherwise the in-memory
 * store (local dev). Never import this from a public component.
 */

const sb = () => isSupabaseConfigured();
const admin = () => createSupabaseAdminClient();

// ---------------- inputs ----------------
export interface ListingInput {
  title: string;
  animalType: AnimalType;
  breed: string;
  ageLabel: string;
  weightKg: number | null;
  gender: Gender;
  purpose: Purpose;
  priceRwf: number;
  negotiable: boolean;
  description: string;
  vaccinated: boolean;
  healthNotes: string | null;
  images: string[];
  district: string;
  sector: string;
  sellerId: string;
  status: ListingStatus;
  featured: boolean;
}

export interface SellerInput {
  displayName: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  district: string;
  sector: string;
  bio: string;
  verified: boolean;
}

// ---------------- mappers (base fg_ rows) ----------------
type Row = Record<string, unknown>;

function mapSeller(r: Row): PublicSeller {
  return {
    id: String(r.id),
    displayName: String(r.display_name ?? "Keeper"),
    district: String(r.district ?? ""),
    sector: String(r.sector ?? ""),
    verified: Boolean(r.verified),
    memberSince: typeof r.member_since === "string" ? r.member_since.slice(0, 7) : "",
    bio: String(r.bio ?? ""),
    photoUrl: (r.photo_url as string) ?? null,
    totalListings: 0,
  };
}

function mapListingRow(r: Row): PublicListing {
  const s = (r.seller ?? {}) as Row;
  return {
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title),
    animalType: r.animal_type as AnimalType,
    breed: String(r.breed ?? ""),
    ageLabel: String(r.age_label ?? ""),
    weightKg: r.weight_kg == null ? null : Number(r.weight_kg),
    gender: (r.gender as Gender) ?? "mixed",
    purpose: (r.purpose as Purpose) ?? "general",
    priceRwf: Number(r.price_rwf ?? 0),
    negotiable: Boolean(r.negotiable),
    description: String(r.description ?? ""),
    vaccinated: Boolean(r.vaccinated),
    healthNotes: (r.health_notes as string) ?? null,
    images: Array.isArray(r.images) ? (r.images as string[]) : [],
    district: String(r.district ?? ""),
    sector: String(r.sector ?? ""),
    status: (r.status as ListingStatus) ?? "pending",
    featured: Boolean(r.featured),
    views: Number(r.views ?? 0),
    createdAt: String(r.created_at ?? new Date().toISOString()),
    seller: {
      id: String(r.seller_id),
      displayName: String(s.display_name ?? "Keeper"),
      district: String(s.district ?? r.district ?? ""),
      sector: String(s.sector ?? ""),
      verified: Boolean(s.verified),
      memberSince:
        typeof s.member_since === "string" ? s.member_since.slice(0, 7) : "",
      bio: String(s.bio ?? ""),
      photoUrl: (s.photo_url as string) ?? null,
      totalListings: 0,
    },
  };
}

function mapInquiry(r: Row): Inquiry {
  return {
    id: String(r.id),
    listingId: String(r.listing_id ?? ""),
    listingTitle: String(r.listing_title ?? "—"),
    buyerName: String(r.buyer_name),
    buyerPhone: String(r.buyer_phone),
    buyerDistrict: String(r.buyer_district ?? ""),
    message: String(r.message ?? ""),
    status: (r.status as InquiryStatus) ?? "new",
    createdAt: String(r.created_at ?? new Date().toISOString()),
  };
}

function mapApplication(r: Row): SellerApplication {
  return {
    id: String(r.id),
    fullName: String(r.full_name),
    phone: String(r.phone),
    district: String(r.district ?? ""),
    animalType: String(r.animal_type ?? ""),
    animalCount: String(r.animal_count ?? ""),
    details: String(r.details ?? ""),
    createdAt: String(r.created_at ?? new Date().toISOString()),
  };
}

const SELLER_SELECT =
  "*, seller:fg_sellers(display_name, district, sector, verified, member_since, bio, photo_url)";

const listingInsert = (input: ListingInput, slug: string) => ({
  seller_id: input.sellerId,
  slug,
  title: input.title,
  animal_type: input.animalType,
  breed: input.breed,
  age_label: input.ageLabel,
  weight_kg: input.weightKg,
  gender: input.gender,
  purpose: input.purpose,
  price_rwf: input.priceRwf,
  negotiable: input.negotiable,
  description: input.description,
  vaccinated: input.vaccinated,
  health_notes: input.healthNotes,
  images: input.images,
  district: input.district,
  sector: input.sector,
  status: input.status,
  featured: input.featured,
});

// ============================ Listings ============================
export async function listAllListings(): Promise<PublicListing[]> {
  if (sb()) {
    const { data } = await admin()
      .from("fg_listings")
      .select(SELLER_SELECT)
      .order("created_at", { ascending: false });
    return (data ?? []).map(mapListingRow);
  }
  return db()
    .listings.map(join)
    .filter((l): l is PublicListing => l !== null)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function getListingById(id: string): Promise<PublicListing | null> {
  if (sb()) {
    const { data } = await admin().from("fg_listings").select(SELLER_SELECT).eq("id", id).maybeSingle();
    return data ? mapListingRow(data) : null;
  }
  const raw = db().listings.find((l) => l.id === id);
  return raw ? join(raw) : null;
}

async function uniqueSlug(title: string, district: string): Promise<string> {
  const base = `${title}-${district}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const { data } = await admin().from("fg_listings").select("slug").ilike("slug", `${base}%`);
  const taken = new Set((data ?? []).map((r) => String(r.slug)));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export async function createListing(input: ListingInput): Promise<PublicListing | null> {
  if (sb()) {
    const slug = await uniqueSlug(input.title, input.district);
    const { data } = await admin().from("fg_listings").insert(listingInsert(input, slug)).select(SELLER_SELECT).single();
    return data ? mapListingRow(data) : null;
  }
  const raw: RawListing = {
    id: newId(),
    slug: slugify(input.title, input.district),
    ...input,
    views: 0,
    createdAt: new Date().toISOString(),
  };
  db().listings.unshift(raw);
  return join(raw);
}

export async function updateListing(id: string, input: ListingInput): Promise<PublicListing | null> {
  if (sb()) {
    const { seller_id, slug: _omit, ...rest } = listingInsert(input, "");
    void _omit;
    const { data } = await admin().from("fg_listings").update({ ...rest, seller_id }).eq("id", id).select(SELLER_SELECT).single();
    return data ? mapListingRow(data) : null;
  }
  const raw = db().listings.find((l) => l.id === id);
  if (!raw) return null;
  Object.assign(raw, input);
  return join(raw);
}

export async function deleteListing(id: string): Promise<boolean> {
  if (sb()) {
    const { error } = await admin().from("fg_listings").delete().eq("id", id);
    return !error;
  }
  const arr = db().listings;
  const i = arr.findIndex((l) => l.id === id);
  if (i === -1) return false;
  arr.splice(i, 1);
  return true;
}

export async function setListingStatus(id: string, status: ListingStatus): Promise<boolean> {
  if (sb()) {
    const { error } = await admin().from("fg_listings").update({ status }).eq("id", id);
    return !error;
  }
  const raw = db().listings.find((l) => l.id === id);
  if (!raw) return false;
  raw.status = status;
  return true;
}

export async function setListingFeatured(id: string, featured: boolean): Promise<boolean> {
  if (sb()) {
    const { error } = await admin().from("fg_listings").update({ featured }).eq("id", id);
    return !error;
  }
  const raw = db().listings.find((l) => l.id === id);
  if (!raw) return false;
  raw.featured = featured;
  return true;
}

// ============================ Sellers ============================
export async function listSellers(): Promise<PublicSeller[]> {
  if (sb()) {
    const { data } = await admin().from("fg_sellers").select("*").order("created_at", { ascending: false });
    return (data ?? []).map(mapSeller);
  }
  return Array.from(db().sellers.values());
}

export async function getSellerContact(id: string): Promise<SellerContact | null> {
  if (sb()) {
    const { data } = await admin().from("fg_sellers").select("id, full_name, phone, whatsapp, email").eq("id", id).maybeSingle();
    if (!data) return null;
    return {
      sellerId: String(data.id),
      fullName: String(data.full_name),
      phone: String(data.phone),
      whatsapp: String(data.whatsapp ?? data.phone),
      email: (data.email as string) ?? null,
    };
  }
  return db().contacts.get(id) ?? null;
}

export async function createSeller(input: SellerInput): Promise<PublicSeller | null> {
  if (sb()) {
    const { data } = await admin()
      .from("fg_sellers")
      .insert({
        display_name: input.displayName,
        full_name: input.fullName,
        phone: input.phone,
        whatsapp: input.whatsapp || input.phone,
        email: input.email,
        district: input.district,
        sector: input.sector,
        bio: input.bio,
        verified: input.verified,
      })
      .select("*")
      .single();
    return data ? mapSeller(data) : null;
  }
  const id = newId();
  const seller: PublicSeller = {
    id,
    displayName: input.displayName,
    district: input.district,
    sector: input.sector,
    verified: input.verified,
    memberSince: new Date().toISOString().slice(0, 7),
    bio: input.bio,
    photoUrl: null,
    totalListings: 0,
  };
  db().sellers.set(id, seller);
  db().contacts.set(id, {
    sellerId: id,
    fullName: input.fullName,
    phone: input.phone,
    whatsapp: input.whatsapp || input.phone,
    email: input.email,
  });
  return seller;
}

export async function setSellerVerified(id: string, verified: boolean): Promise<boolean> {
  if (sb()) {
    const { error } = await admin().from("fg_sellers").update({ verified }).eq("id", id);
    return !error;
  }
  const s = db().sellers.get(id);
  if (!s) return false;
  s.verified = verified;
  return true;
}

export async function deleteSeller(id: string): Promise<boolean> {
  if (sb()) {
    const { error } = await admin().from("fg_sellers").delete().eq("id", id);
    return !error;
  }
  const database = db();
  if (!database.sellers.has(id)) return false;
  database.listings = database.listings.filter((l) => l.sellerId !== id);
  database.sellers.delete(id);
  database.contacts.delete(id);
  return true;
}

// ============================ Inquiries ============================
export async function addInquiry(inquiry: Inquiry): Promise<void> {
  // Public path inserts via the anon client (RLS) — see actions/inquiry.ts.
  db().inquiries.unshift(inquiry);
}

export async function listInquiries(): Promise<Inquiry[]> {
  if (sb()) {
    const { data } = await admin().from("fg_inquiries").select("*").order("created_at", { ascending: false });
    return (data ?? []).map(mapInquiry);
  }
  return [...db().inquiries];
}

export async function setInquiryStatus(id: string, status: InquiryStatus): Promise<boolean> {
  if (sb()) {
    const { error } = await admin().from("fg_inquiries").update({ status }).eq("id", id);
    return !error;
  }
  const inq = db().inquiries.find((i) => i.id === id);
  if (!inq) return false;
  inq.status = status;
  return true;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  if (sb()) {
    const { error } = await admin().from("fg_inquiries").delete().eq("id", id);
    return !error;
  }
  const arr = db().inquiries;
  const i = arr.findIndex((x) => x.id === id);
  if (i === -1) return false;
  arr.splice(i, 1);
  return true;
}

// ============================ Applications ============================
export async function addApplication(app: SellerApplication): Promise<void> {
  db().applications.unshift(app);
}

export async function listApplications(): Promise<SellerApplication[]> {
  if (sb()) {
    const { data } = await admin().from("fg_seller_applications").select("*").order("created_at", { ascending: false });
    return (data ?? []).map(mapApplication);
  }
  return [...db().applications];
}

export async function deleteApplication(id: string): Promise<boolean> {
  if (sb()) {
    const { error } = await admin().from("fg_seller_applications").delete().eq("id", id);
    return !error;
  }
  const arr = db().applications;
  const i = arr.findIndex((x) => x.id === id);
  if (i === -1) return false;
  arr.splice(i, 1);
  return true;
}

// ============================ Testimonials ============================
export interface TestimonialRow {
  id: string;
  name: string;
  location: string;
  role: string;
  quote: string;
  quoteRw: string | null;
  rating: number;
  published: boolean;
  sort: number;
}
export interface TestimonialInput {
  name: string;
  location: string;
  role: string;
  quote: string;
  quoteRw: string | null;
  rating: number;
  published: boolean;
  sort: number;
}

export async function listTestimonialsAdmin(): Promise<TestimonialRow[]> {
  if (!sb()) return [];
  const { data } = await admin().from("fg_testimonials").select("*").order("sort", { ascending: true });
  return (data ?? []).map((r) => ({
    id: String(r.id),
    name: String(r.name),
    location: String(r.location ?? ""),
    role: String(r.role ?? "Buyer"),
    quote: String(r.quote ?? ""),
    quoteRw: (r.quote_rw as string) ?? null,
    rating: Number(r.rating ?? 5),
    published: Boolean(r.published),
    sort: Number(r.sort ?? 0),
  }));
}

function testimonialRow(i: TestimonialInput) {
  return {
    name: i.name,
    location: i.location,
    role: i.role,
    quote: i.quote,
    quote_rw: i.quoteRw,
    rating: i.rating,
    published: i.published,
    sort: i.sort,
  };
}

export async function createTestimonial(i: TestimonialInput): Promise<boolean> {
  if (!sb()) return false;
  const { error } = await admin().from("fg_testimonials").insert(testimonialRow(i));
  return !error;
}
export async function updateTestimonial(id: string, i: TestimonialInput): Promise<boolean> {
  if (!sb()) return false;
  const { error } = await admin().from("fg_testimonials").update(testimonialRow(i)).eq("id", id);
  return !error;
}
export async function deleteTestimonial(id: string): Promise<boolean> {
  if (!sb()) return false;
  const { error } = await admin().from("fg_testimonials").delete().eq("id", id);
  return !error;
}

// ============================ Guides (blog) ============================
export interface GuideRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  author: string;
  tags: string[];
  readMins: number;
  published: boolean;
  publishedAt: string;
}
export interface GuideInput {
  title: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  author: string;
  tags: string[];
  readMins: number;
  published: boolean;
}

function mapGuideRow(r: Row): GuideRow {
  return {
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title),
    excerpt: String(r.excerpt ?? ""),
    body: String(r.body ?? ""),
    coverImage: (r.cover_image as string) ?? null,
    author: String(r.author ?? "Farmgate"),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    readMins: Number(r.read_mins ?? 4),
    published: Boolean(r.published),
    publishedAt: String(r.published_at ?? new Date().toISOString()),
  };
}

export async function listGuidesAdmin(): Promise<GuideRow[]> {
  if (!sb()) return [];
  const { data } = await admin().from("fg_guides").select("*").order("published_at", { ascending: false });
  return (data ?? []).map(mapGuideRow);
}
export async function getGuideByIdAdmin(id: string): Promise<GuideRow | null> {
  if (!sb()) return null;
  const { data } = await admin().from("fg_guides").select("*").eq("id", id).maybeSingle();
  return data ? mapGuideRow(data) : null;
}

async function uniqueGuideSlug(title: string): Promise<string> {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "guide";
  const { data } = await admin().from("fg_guides").select("slug").ilike("slug", `${base}%`);
  const taken = new Set((data ?? []).map((r) => String(r.slug)));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

function guideRow(i: GuideInput) {
  return {
    title: i.title,
    excerpt: i.excerpt,
    body: i.body,
    cover_image: i.coverImage,
    author: i.author || "Farmgate",
    tags: i.tags,
    read_mins: i.readMins,
    published: i.published,
  };
}

export async function createGuide(i: GuideInput): Promise<boolean> {
  if (!sb()) return false;
  const slug = await uniqueGuideSlug(i.title);
  const { error } = await admin().from("fg_guides").insert({ ...guideRow(i), slug });
  return !error;
}
export async function updateGuide(id: string, i: GuideInput): Promise<boolean> {
  if (!sb()) return false;
  const { error } = await admin().from("fg_guides").update(guideRow(i)).eq("id", id);
  return !error;
}
export async function deleteGuide(id: string): Promise<boolean> {
  if (!sb()) return false;
  const { error } = await admin().from("fg_guides").delete().eq("id", id);
  return !error;
}
