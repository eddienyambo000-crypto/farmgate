"use server";

import { randomUUID } from "crypto";
import { addApplication } from "@/lib/data/admin-repo";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { ANIMAL_TYPES } from "@/lib/types";

export interface SellerInput {
  fullName: string;
  phone: string;
  district: string;
  animalType: string;
  animalCount: string;
  details: string;
}

export interface SellerResult {
  ok: boolean;
  error?: string;
}

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (/^07\d{8}$/.test(digits)) return `25${digits}`;
  if (/^2507\d{8}$/.test(digits)) return digits;
  if (/^7\d{8}$/.test(digits)) return `250${digits}`;
  return null;
}

export async function submitSellerApplication(
  input: SellerInput,
): Promise<SellerResult> {
  const fullName = input.fullName?.trim() ?? "";
  const district = input.district?.trim() ?? "";
  const details = input.details?.trim() ?? "";
  const animalCount = input.animalCount?.trim() ?? "";

  if (fullName.length < 2) return { ok: false, error: "Please enter your name." };

  const phone = normalizePhone(input.phone ?? "");
  if (!phone)
    return { ok: false, error: "Please enter a valid Rwandan phone number." };

  if (!district) return { ok: false, error: "Please select your district." };
  if (!ANIMAL_TYPES.includes(input.animalType as (typeof ANIMAL_TYPES)[number]))
    return { ok: false, error: "Please choose what animals you keep." };

  if (isSupabaseConfigured()) {
    const supabase = createSupabasePublicClient();
    const { error } = await supabase.from("fg_seller_applications").insert({
      full_name: fullName,
      phone,
      district,
      animal_type: input.animalType,
      animal_count: animalCount,
      details,
    });
    if (error) return { ok: false, error: "Could not submit. Please try again." };
  } else {
    addApplication({
      id: randomUUID(),
      fullName,
      phone,
      district,
      animalType: input.animalType,
      animalCount,
      details,
      createdAt: new Date().toISOString(),
    });
  }

  return { ok: true };
}
