import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getAllSlugs } from "@/lib/data/listings";
import { getGuideSlugs } from "@/lib/data/guides";
import { getCategories } from "@/lib/data/categories";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, guideSlugs, cats] = await Promise.all([
    getAllSlugs(),
    getGuideSlugs(),
    getCategories(),
  ]);
  const now = new Date();

  const staticPages = [
    "",
    "/animals",
    "/find",
    "/guides",
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

  // SEO landing pages (real URLs that rank).
  const categoryPages = cats.map((c) => ({
    url: `${SITE.url}/livestock/${c.type}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const listingPages = slugs.map((slug) => ({
    url: `${SITE.url}/animals/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const guidePages = guideSlugs.map((slug) => ({
    url: `${SITE.url}/guides/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...listingPages, ...guidePages];
}
