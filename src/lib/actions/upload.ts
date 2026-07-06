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

const BUCKETS = new Set(["fg-listings", "fg-brand"]);

export interface SignedUpload {
  ok: boolean;
  path?: string;
  signedUrl?: string;
  publicUrl?: string;
  error?: string;
}

/**
 * Returns a short-lived signed URL so the browser uploads the (already
 * compressed) photo DIRECTLY to Supabase Storage — bypassing the Next Server
 * Action 1 MB body limit and the extra network hop. Admin-guarded; the signed
 * URL itself is pre-authorized so no storage RLS is needed on the client.
 */
export async function createUploadUrl(
  bucketReq: string,
  ext: string,
): Promise<SignedUpload> {
  if (!(await isAdmin())) return { ok: false, error: "Not authorized." };
  if (!isSupabaseConfigured())
    return { ok: false, error: "Storage not configured." };

  const bucket = BUCKETS.has(bucketReq) ? bucketReq : "fg-listings";
  const safeExt = /^[a-z0-9]{2,5}$/i.test(ext) ? ext.toLowerCase() : "jpg";
  const path = `${new Date().getFullYear()}/${randomUUID()}.${safeExt}`;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: error?.message ?? "Upload failed." };

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  return { ok: true, path, signedUrl: data.signedUrl, publicUrl: pub.publicUrl };
}

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

  const requested = String(formData.get("bucket") ?? "fg-listings");
  const bucket = BUCKETS.has(requested) ? requested : "fg-listings";
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;
  const supabase = createSupabaseAdminClient();
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
