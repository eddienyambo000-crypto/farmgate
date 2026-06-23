/**
 * Domain types.
 *
 * The split between `PublicSeller` and `SellerContact` is deliberate and is the
 * core of FarmGate's business model. Public-facing code (everything a buyer can
 * reach) may only ever touch `PublicSeller` / `PublicListing` — these types do
 * not even contain a phone or email field, so seller contacts cannot leak by
 * accident. Contact details live in `SellerContact` and are only readable by
 * server-side admin code (and, in production, by an RLS-protected table that the
 * anon Supabase key cannot select).
 */

export const ANIMAL_TYPES = [
  "cattle",
  "goat",
  "sheep",
  "pig",
  "chicken",
  "rabbit",
] as const;
export type AnimalType = (typeof ANIMAL_TYPES)[number];

export type Gender = "male" | "female" | "mixed";
export type Purpose =
  | "dairy"
  | "meat"
  | "breeding"
  | "layers"
  | "broilers"
  | "pets"
  | "general";

export type ListingStatus = "pending" | "active" | "sold" | "rejected";
export type InquiryStatus =
  | "new"
  | "contacted"
  | "viewing_scheduled"
  | "closed_won"
  | "closed_lost";

/** Safe seller info — no contact fields exist on this type by design. */
export interface PublicSeller {
  id: string;
  displayName: string;
  district: string;
  sector: string;
  verified: boolean;
  memberSince: string; // ISO year-month
  bio: string;
  photoUrl: string | null;
  totalListings: number;
}

/** Private — server/admin only. Never imported by client components. */
export interface SellerContact {
  sellerId: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string | null;
}

export interface PublicListing {
  id: string;
  slug: string;
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
  status: ListingStatus;
  featured: boolean;
  views: number;
  createdAt: string; // ISO
  seller: PublicSeller;
}

export interface Inquiry {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerName: string;
  buyerPhone: string;
  buyerDistrict: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

/** Payload accepted from the public inquiry form (validated server-side). */
export interface InquiryInput {
  listingId: string;
  buyerName: string;
  buyerPhone: string;
  buyerDistrict: string;
  message: string;
}
