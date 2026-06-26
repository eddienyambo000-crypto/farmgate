"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  createGuide,
  updateGuide,
  deleteGuide,
} from "@/lib/data/admin-repo";

export interface ContentResult {
  ok: boolean;
  error?: string;
}

async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}
function str(fd: FormData, k: string) {
  return String(fd.get(k) ?? "").trim();
}

// ---------------- Testimonials ----------------
function parseTestimonial(fd: FormData) {
  return {
    name: str(fd, "name"),
    location: str(fd, "location"),
    role: str(fd, "role") || "Buyer",
    quote: str(fd, "quote"),
    quoteRw: str(fd, "quoteRw") || null,
    rating: Math.min(5, Math.max(1, Number(str(fd, "rating")) || 5)),
    published: fd.get("published") === "on",
    sort: Number(str(fd, "sort")) || 0,
  };
}

export async function createTestimonialAction(fd: FormData): Promise<void> {
  await guard();
  if (str(fd, "name").length < 2 || str(fd, "quote").length < 5) return;
  await createTestimonial(parseTestimonial(fd));
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}

export async function updateTestimonialAction(fd: FormData): Promise<void> {
  await guard();
  const id = str(fd, "id");
  await updateTestimonial(id, parseTestimonial(fd));
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function deleteTestimonialAction(fd: FormData): Promise<void> {
  await guard();
  await deleteTestimonial(str(fd, "id"));
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

// ---------------- Guides ----------------
function parseGuide(fd: FormData) {
  return {
    title: str(fd, "title"),
    excerpt: str(fd, "excerpt"),
    body: String(fd.get("body") ?? ""),
    coverImage: str(fd, "coverImage") || null,
    author: str(fd, "author") || "Farmgate",
    tags: str(fd, "tags")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    readMins: Number(str(fd, "readMins")) || 4,
    published: fd.get("published") === "on",
  };
}

function revalidateGuides() {
  revalidatePath("/guides");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/guides");
}

export async function createGuideAction(
  _prev: ContentResult | undefined,
  fd: FormData,
): Promise<ContentResult> {
  await guard();
  if (str(fd, "title").length < 4) return { ok: false, error: "Title is too short." };
  const ok = await createGuide(parseGuide(fd));
  if (!ok) return { ok: false, error: "Could not save the guide." };
  revalidateGuides();
  redirect("/admin/guides");
}

export async function updateGuideAction(
  id: string,
  _prev: ContentResult | undefined,
  fd: FormData,
): Promise<ContentResult> {
  await guard();
  if (str(fd, "title").length < 4) return { ok: false, error: "Title is too short." };
  const ok = await updateGuide(id, parseGuide(fd));
  if (!ok) return { ok: false, error: "Could not save the guide." };
  revalidateGuides();
  redirect("/admin/guides");
}

export async function deleteGuideAction(fd: FormData): Promise<void> {
  await guard();
  await deleteGuide(str(fd, "id"));
  revalidateGuides();
}
