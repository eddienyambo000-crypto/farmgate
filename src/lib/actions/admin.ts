"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import {
  createListing,
  updateListing,
  deleteListing,
  setListingStatus,
  setListingFeatured,
  getListingById,
  createSeller,
  setSellerVerified,
  deleteSeller,
  setInquiryStatus,
  deleteInquiry,
  deleteApplication,
  type ListingInput,
} from "@/lib/data/admin-repo";
import { ANIMAL_TYPES } from "@/lib/types";
import type {
  AnimalType,
  Gender,
  Purpose,
  ListingStatus,
  InquiryStatus,
} from "@/lib/types";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function guard(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

function revalidateAll(slug?: string) {
  revalidatePath("/");
  revalidatePath("/animals");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/animals/${slug}`);
}

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

function parseListing(fd: FormData): ListingInput | { error: string } {
  const title = str(fd, "title");
  const animalType = str(fd, "animalType") as AnimalType;
  const sellerId = str(fd, "sellerId");
  const priceRwf = Number(str(fd, "priceRwf"));

  if (title.length < 2) return { error: "Title is required." };
  if (!ANIMAL_TYPES.includes(animalType))
    return { error: "Pick a valid animal type." };
  if (!sellerId) return { error: "Choose the keeper this animal belongs to." };
  if (!Number.isFinite(priceRwf) || priceRwf < 0)
    return { error: "Enter a valid price." };

  const weightRaw = str(fd, "weightKg");
  const images = str(fd, "images")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    title,
    animalType,
    breed: str(fd, "breed") || "—",
    ageLabel: str(fd, "ageLabel") || "—",
    weightKg: weightRaw ? Number(weightRaw) : null,
    gender: (str(fd, "gender") || "mixed") as Gender,
    purpose: (str(fd, "purpose") || "general") as Purpose,
    priceRwf,
    negotiable: fd.get("negotiable") === "on",
    description: str(fd, "description"),
    vaccinated: fd.get("vaccinated") === "on",
    healthNotes: str(fd, "healthNotes") || null,
    images: images.length ? images : ["/animals/cattle-1.jpg"],
    district: str(fd, "district") || "Bugesera",
    sector: str(fd, "sector") || "—",
    sellerId,
    status: (str(fd, "status") || "active") as ListingStatus,
    featured: fd.get("featured") === "on",
  };
}

// ---------------- Listings ----------------
// Signatures match useActionState: (prevState, formData) => newState. Using a
// native form action (not a programmatic call) keeps the admin auth cookie.
export async function createListingAction(
  _prev: ActionResult | undefined,
  fd: FormData,
): Promise<ActionResult> {
  await guard();
  const parsed = parseListing(fd);
  if ("error" in parsed) return { ok: false, error: parsed.error };
  const created = await createListing(parsed);
  revalidateAll(created?.slug);
  redirect("/admin/listings");
}

export async function updateListingAction(
  id: string,
  _prev: ActionResult | undefined,
  fd: FormData,
): Promise<ActionResult> {
  await guard();
  const parsed = parseListing(fd);
  if ("error" in parsed) return { ok: false, error: parsed.error };
  const updated = await updateListing(id, parsed);
  revalidateAll(updated?.slug);
  redirect("/admin/listings");
}

export async function deleteListingAction(fd: FormData): Promise<void> {
  await guard();
  const id = str(fd, "id");
  const listing = await getListingById(id);
  await deleteListing(id);
  revalidateAll(listing?.slug);
}

export async function toggleFeaturedAction(fd: FormData): Promise<void> {
  await guard();
  const id = str(fd, "id");
  const listing = await getListingById(id);
  if (listing) await setListingFeatured(id, !listing.featured);
  revalidateAll(listing?.slug);
}

export async function setStatusAction(fd: FormData): Promise<void> {
  await guard();
  const id = str(fd, "id");
  const status = str(fd, "status") as ListingStatus;
  const listing = await getListingById(id);
  await setListingStatus(id, status);
  revalidateAll(listing?.slug);
}

// ---------------- Sellers ----------------
export async function createSellerAction(fd: FormData): Promise<void> {
  await guard();
  const displayName = str(fd, "displayName");
  const fullName = str(fd, "fullName");
  const phone = str(fd, "phone");
  // Required attributes guard the form; bail quietly if somehow invalid.
  if (displayName.length < 2 || fullName.length < 2 || phone.length < 9) return;

  await createSeller({
    displayName,
    fullName,
    phone,
    whatsapp: str(fd, "whatsapp") || phone,
    email: str(fd, "email") || null,
    district: str(fd, "district") || "Bugesera",
    sector: str(fd, "sector") || "—",
    bio: str(fd, "bio"),
    verified: fd.get("verified") === "on",
  });
  // If created from an application, remove that application.
  const appId = str(fd, "applicationId");
  if (appId) await deleteApplication(appId);
  revalidateAll();
  redirect("/admin/keepers");
}

export async function verifySellerAction(fd: FormData): Promise<void> {
  await guard();
  const id = str(fd, "id");
  const verified = str(fd, "verified") === "true";
  await setSellerVerified(id, verified);
  revalidateAll();
}

export async function deleteSellerAction(fd: FormData): Promise<void> {
  await guard();
  await deleteSeller(str(fd, "id"));
  revalidateAll();
}

export async function deleteApplicationAction(fd: FormData): Promise<void> {
  await guard();
  await deleteApplication(str(fd, "id"));
  revalidatePath("/admin");
  revalidatePath("/admin/keepers");
}

// ---------------- Inquiries (leads) ----------------
export async function setInquiryStatusAction(fd: FormData): Promise<void> {
  await guard();
  await setInquiryStatus(str(fd, "id"), str(fd, "status") as InquiryStatus);
  revalidatePath("/admin");
  revalidatePath("/admin/leads");
}

export async function deleteInquiryAction(fd: FormData): Promise<void> {
  await guard();
  await deleteInquiry(str(fd, "id"));
  revalidatePath("/admin");
  revalidatePath("/admin/leads");
}
