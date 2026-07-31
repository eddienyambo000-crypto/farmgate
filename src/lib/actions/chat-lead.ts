"use server";

import { randomUUID } from "crypto";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { addInquiry } from "@/lib/data/admin-repo";
import { notifyOwner } from "@/lib/notify";
import { SITE } from "@/lib/site";

export interface ChatLeadResult {
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

/**
 * Captures a general lead from the on-site chat assistant (no specific listing).
 * Lands as a row in fg_inquiries so it shows up in /admin/leads exactly like a
 * listing inquiry. Anon INSERT only (RLS) — same trust model as the inquiry form.
 */
export async function submitChatLead(input: {
  name: string;
  phone: string;
  district?: string;
  want?: string;
}): Promise<ChatLeadResult> {
  const name = (input.name ?? "").trim();
  if (name.length < 2) return { ok: false, error: "Please enter your name." };

  const phone = normalizePhone(input.phone ?? "");
  if (!phone)
    return {
      ok: false,
      error: "Please enter a valid Rwandan phone number (e.g. 0788123456).",
    };

  const district = (input.district ?? "").trim() || "Not specified";
  const want = (input.want ?? "").trim() || "General enquiry";
  const listingTitle = `Website chat — ${want}`;
  const message = `Lead from the website chat assistant. Interested in: ${want}.`;

  if (isSupabaseConfigured()) {
    const supabase = createSupabasePublicClient();
    const { error } = await supabase.from("fg_inquiries").insert({
      listing_id: null,
      listing_title: listingTitle,
      buyer_name: name,
      buyer_phone: phone,
      buyer_district: district,
      message,
    });
    if (error)
      return { ok: false, error: "Could not send your details. Please try again." };
  } else {
    addInquiry({
      id: randomUUID(),
      listingId: "",
      listingTitle,
      buyerName: name,
      buyerPhone: phone,
      buyerDistrict: district,
      message,
      status: "new",
      createdAt: new Date().toISOString(),
    });
  }

  await notifyOwner({
    type: "lead",
    buyerName: name,
    buyerPhone: phone,
    buyerDistrict: district,
    message,
    animal: want,
    animalUrl: `${SITE.url}/animals`,
  });

  return { ok: true };
}
