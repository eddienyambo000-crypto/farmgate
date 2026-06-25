import "server-only";
import type { PublicListing, AnimalType, Gender, Purpose, ListingStatus } from "../types";
import type { Testimonial } from "./testimonials";
import type { Guide } from "./guides";

/* Row shapes returned by the fg_public_* views (snake_case). */
type ListingRow = Record<string, unknown>;

function ym(date: unknown): string {
  // date column comes back as 'YYYY-MM-DD' → keep 'YYYY-MM'
  return typeof date === "string" ? date.slice(0, 7) : "";
}

export function mapListing(r: ListingRow): PublicListing {
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
    status: (r.status as ListingStatus) ?? "active",
    featured: Boolean(r.featured),
    views: Number(r.views ?? 0),
    createdAt: String(r.created_at ?? new Date().toISOString()),
    seller: {
      id: String(r.seller_id),
      displayName: String(r.seller_display_name ?? "Keeper"),
      district: String(r.seller_district ?? r.district ?? ""),
      sector: String(r.sector ?? ""),
      verified: Boolean(r.seller_verified),
      memberSince: ym(r.seller_member_since),
      bio: String(r.seller_bio ?? ""),
      photoUrl: (r.seller_photo_url as string) ?? null,
      totalListings: 0,
    },
  };
}

export function mapTestimonial(r: Record<string, unknown>): Testimonial {
  return {
    id: String(r.id),
    name: String(r.name),
    location: String(r.location ?? ""),
    role: String(r.role ?? "Buyer"),
    quote: String(r.quote ?? ""),
    quoteRw: (r.quote_rw as string) ?? null,
    rating: Number(r.rating ?? 5),
  };
}

export function mapGuide(r: Record<string, unknown>): Guide {
  return {
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title),
    titleRw: (r.title_rw as string) ?? null,
    excerpt: String(r.excerpt ?? ""),
    excerptRw: (r.excerpt_rw as string) ?? null,
    body: String(r.body ?? ""),
    bodyRw: (r.body_rw as string) ?? null,
    coverImage: (r.cover_image as string) ?? null,
    author: String(r.author ?? "Farmgate"),
    publishedAt: String(r.published_at ?? new Date().toISOString()),
    published: true,
    readMins: Number(r.read_mins ?? 4),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
  };
}
