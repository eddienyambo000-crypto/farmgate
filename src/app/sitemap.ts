import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getAllSlugs } from "@/lib/data/listings";
import { ANIMAL_TYPES } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllSlugs();
  const now = new Date();

  const staticPages = [
    "",
    "/animals",
    "/how-it-works",
    "/sell",
    "/about",
    "/trust-safety",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const categoryPages = ANIMAL_TYPES.map((type) => ({
    url: `${SITE.url}/animals?type=${type}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const listingPages = slugs.map((slug) => ({
    url: `${SITE.url}/animals/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...listingPages];
}
