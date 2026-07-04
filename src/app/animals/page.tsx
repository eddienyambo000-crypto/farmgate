import type { Metadata } from "next";
import { Suspense } from "react";
import { AnimalsBrowser } from "@/components/AnimalsBrowser";
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

export default async function AnimalsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const type = ANIMAL_TYPES.includes(sp.type as AnimalType)
    ? (sp.type as AnimalType)
    : undefined;

  // Send ALL active listings to the browser; filtering happens client-side so
  // the controls and results can never disagree.
  const [listings, districts] = await Promise.all([
    getListings({}),
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
          <AnimalsBrowser listings={listings} districts={districts} />
        </Suspense>
      </div>
    </div>
  );
}
