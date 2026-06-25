import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getGuides } from "@/lib/data/guides";
import { formatDate } from "@/lib/format";
import { StaggerGroup, StaggerItem } from "@/components/motion/Primitives";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Livestock Guides for Rwandan Farmers",
  description:
    "Free guides on buying and raising livestock in Rwanda — dairy cows, goats, pigs, chickens and more. Practical advice from Farmgate.",
  alternates: { canonical: "/guides" },
};

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <div className="bg-grain">
      <header className="border-b border-line bg-cream/50">
        <div className="container-page py-12 lg:py-16">
          <span className="text-sm font-semibold uppercase tracking-wider text-gold-deep">
            Guides
          </span>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight text-ink text-balance sm:text-5xl">
            Learn to buy and raise livestock in Rwanda
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            Practical, no-nonsense guides for Rwandan farmers and buyers — from
            choosing a dairy cow to raising broilers for profit.
          </p>
        </div>
      </header>

      <div className="container-page py-12 lg:py-16">
        {guides.length === 0 ? (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-line bg-surface p-12 text-center text-ink-muted">
            New guides are coming soon.
          </p>
        ) : (
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => (
              <StaggerItem key={g.id}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="group block overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
                >
                  {g.coverImage && (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={g.coverImage}
                        alt={g.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-gold-deep">
                      {g.readMins} min read · {formatDate(g.publishedAt)}
                    </p>
                    <h2 className="mt-2 font-display text-lg font-bold leading-snug text-ink group-hover:text-forest-deep">
                      {g.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
                      {g.excerpt}
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </div>
  );
}
