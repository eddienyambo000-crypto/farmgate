"use server";

import { randomUUID } from "crypto";
import { getListingBySlug } from "@/lib/data/listings";
import { addInquiry } from "@/lib/data/inquiries-store";
import type { InquiryInput } from "@/lib/types";

export interface InquiryResult {
  ok: boolean;
  error?: string;
}

/** Rwandan mobile: 07XXXXXXXX or +2507XXXXXXXX / 2507XXXXXXXX. */
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (/^07\d{8}$/.test(digits)) return `25${digits}`;
  if (/^2507\d{8}$/.test(digits)) return digits;
  if (/^7\d{8}$/.test(digits)) return `250${digits}`;
  return null;
}

export async function submitInquiry(
  input: InquiryInput,
): Promise<InquiryResult> {
  // Server-side validation — never trust the client.
  const name = input.buyerName?.trim() ?? "";
  const district = input.buyerDistrict?.trim() ?? "";
  const message = input.message?.trim() ?? "";

  if (name.length < 2) return { ok: false, error: "Please enter your name." };

  const phone = normalizePhone(input.buyerPhone ?? "");
  if (!phone)
    return {
      ok: false,
      error: "Please enter a valid Rwandan phone number (e.g. 0788123456).",
    };

  if (!district)
    return { ok: false, error: "Please tell us your district." };

  // The listing must exist and be live. We resolve it server-side; this is also
  // where the seller's private contact would be looked up for routing — it is
  // never returned to the buyer.
  const listing = await getListingBySlug(input.listingId);
  if (!listing)
    return { ok: false, error: "That animal is no longer available." };

  addInquiry({
    id: randomUUID(),
    listingId: listing.id,
    listingTitle: listing.title,
    buyerName: name,
    buyerPhone: phone,
    buyerDistrict: district,
    message,
    status: "new",
    createdAt: new Date().toISOString(),
  });

  // TODO (Supabase): insert into `inquiries` and notify the FarmGate team
  // (WhatsApp/email) so a human routes the deal between buyer and keeper.

  return { ok: true };
}
