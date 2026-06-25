import type { Metadata } from "next";
import { AnimalFinder } from "@/components/AnimalFinder";
import { getDistricts } from "@/lib/data/listings";

export const metadata: Metadata = {
  title: "Find Your Animal",
  description:
    "Answer a few quick questions and Farmgate matches you with healthy animals from verified keepers near you — cattle, goats, pigs, chickens, sheep and rabbits across Rwanda.",
  alternates: { canonical: "/find" },
};

export default async function FindPage() {
  const districts = await getDistricts();
  return (
    <div className="bg-grain">
      <header className="border-b border-line bg-cream/50">
        <div className="container-page py-12 text-center lg:py-16">
          <span className="text-sm font-semibold uppercase tracking-wider text-gold-deep">
            Guided finder
          </span>
          <h1 className="mx-auto mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight text-ink text-balance sm:text-5xl">
            Let&apos;s find your perfect animal
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">
            Three quick questions and we&apos;ll show you exactly what&apos;s
            available.
          </p>
        </div>
      </header>
      <div className="container-page py-12 lg:py-16">
        <AnimalFinder districts={districts} />
      </div>
    </div>
  );
}
