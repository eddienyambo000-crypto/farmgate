"use server";

import { randomUUID } from "crypto";
import { isAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface UploadResult {
  ok: boolean;
  url?: string;
  error?: string;
}

const BUCKET = "fg-listings";

/**
 * Uploads an animal photo. With Supabase configured it stores the file in the
 * public `listings` Storage bucket (via the service role) and returns its public
 * URL. Without Supabase there is nowhere durable to put a file on serverless, so
 * we ask the admin to paste an image URL/path instead.
 */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  if (!(await isAdmin())) return { ok: false, error: "Not authorized." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: "Choose an image file." };
  if (!file.type.startsWith("image/"))
    return { ok: false, error: "That file isn't an image." };
  if (file.size > 5 * 1024 * 1024)
    return { ok: false, error: "Image must be under 5 MB." };

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error:
        "Connect Supabase to upload photos. For now, paste an image URL or a bundled path like /animals/cattle-1.jpg.",
    };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;
  const supabase = createSupabaseAdminClient();
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
