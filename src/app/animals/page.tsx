import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingCard } from "@/components/ListingCard";
import { FilterBar } from "@/components/FilterBar";
import { getListings, getDistricts } from "@/lib/data/listings";
import { CATEGORIES } from "@/lib/categories";
import type { AnimalType } from "@/lib/types";
import { ANIMAL_TYPES } from "@/lib/types";

export const metadata: Metadata = {
  title: "Browse Animals for Sale in Rwanda",
  description:
    "Browse cattle, goats, pigs, chickens, sheep and rabbits for sale from verified keepers across Rwanda. Filter by animal type, district and price.",
  alternates: { canonical: "/animals" },
};

type SearchParams = {
  type?: string;
  district?: string;
  search?: string;
  sort?: string;
};

export default async function AnimalsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const type = ANIMAL_TYPES.includes(sp.type as AnimalType)
    ? (sp.type as AnimalType)
    : undefined;

  const [listings, districts] = await Promise.all([
    getListings({
      type,
      district: sp.district,
      search: sp.search,
      sort: sp.sort as "newest" | "price-asc" | "price-desc" | undefined,
    }),
    getDistricts(),
  ]);

  const heading = type
    ? `${CATEGORIES[type].plural} for sale in Rwanda`
    : sp.search
      ? `Results for “${sp.search}”`
      : "All animals for sale in Rwanda";

  return (
    <div className="bg-grain">
      <header className="border-b border-line bg-cream/50">
        <div className="container-page py-10 lg:py-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold-deep">
            Marketplace
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {heading}
          </h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Every animal below is listed by a verified keeper. Found one you
            like? Request it through Farmgate — we handle the rest.
          </p>
        </div>
      </header>

      <div className="container-page py-8 lg:py-10">
        <Suspense fallback={<div className="h-12" />}>
          <FilterBar districts={districts} />
        </Suspense>

        <p className="mt-6 text-sm text-ink-muted">
          {listings.length} {listings.length === 1 ? "animal" : "animals"}{" "}
          available
        </p>

        {listings.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-[var(--radius-lg)] border border-dashed border-line bg-surface p-12 text-center">
            <p className="font-display text-xl font-bold text-ink">
              No animals match your search
            </p>
            <p className="mt-2 text-ink-soft">
              Try a different animal type or district — new animals are listed
              every week.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
