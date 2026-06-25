"use server";

import { randomUUID } from "crypto";
import { getListingBySlug } from "@/lib/data/listings";
import { addInquiry } from "@/lib/data/admin-repo";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";
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

  if (isSupabaseConfigured()) {
    // Insert via the anon client — RLS allows INSERT only (never SELECT), so a
    // buyer can submit a lead but can never read others' leads or seller data.
    const supabase = createSupabasePublicClient();
    const { error } = await supabase.from("fg_inquiries").insert({
      listing_id: listing.id,
      listing_title: listing.title,
      buyer_name: name,
      buyer_phone: phone,
      buyer_district: district,
      message,
    });
    if (error) return { ok: false, error: "Could not send your request. Please try again." };
  } else {
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
  }

  return { ok: true };
}
