import Image from "next/image";
import Link from "next/link";
import type { PublicListing } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import { formatRwf } from "@/lib/format";
import { MapPinIcon, SyringeIcon } from "./icons";
import { VerifiedBadge } from "./VerifiedBadge";

export function ListingCard({ listing }: { listing: PublicListing }) {
  const cat = CATEGORIES[listing.animalType];
  const sold = listing.status === "sold";

  return (
    <Link
      href={`/animals/${listing.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)] transition-[transform,box-shadow] duration-300 ease-[var(--ease-out)] hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] focus-visible:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
        <Image
          src={listing.images[0]}
          alt={listing.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-forest-dark/85 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {cat.label}
          </span>
          {listing.featured && !sold && (
            <span className="rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-forest-dark shadow-[var(--shadow-gold)]">
              Featured
            </span>
          )}
        </div>

        {listing.vaccinated && !sold && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-forest-deep backdrop-blur-sm">
            <SyringeIcon className="h-3.5 w-3.5" />
            Vaccinated
          </span>
        )}

        {sold && (
          <div className="absolute inset-0 grid place-items-center bg-forest-dark/55 backdrop-blur-[1px]">
            <span className="rotate-[-8deg] rounded-md border-2 border-white px-5 py-1.5 font-display text-2xl font-extrabold uppercase tracking-wide text-white">
              Sold
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold leading-tight text-ink">
            {listing.title}
          </h3>
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          {listing.breed} · {listing.ageLabel}
        </p>

        <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-soft">
          <MapPinIcon className="h-4 w-4 text-forest-soft" />
          {listing.sector}, {listing.district}
        </p>

        <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
          <div>
            <p className="font-display text-xl font-extrabold text-forest-deep">
              {formatRwf(listing.priceRwf)}
            </p>
            {listing.negotiable && (
              <p className="text-xs text-ink-muted">Negotiable</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-right">
            <span className="text-xs text-ink-muted">
              {listing.seller.displayName}
            </span>
            {listing.seller.verified && <VerifiedBadge label={false} />}
          </div>
        </div>
      </div>
    </Link>
  );
}
