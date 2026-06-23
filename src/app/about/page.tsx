import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/icons";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About FarmGate",
  description:
    "FarmGate is Rwanda's livestock marketplace, connecting animal keepers directly with buyers — cutting out the middlemen who inflate prices on both sides.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="bg-grain">
      <header className="border-b border-line bg-cream/50">
        <div className="container-page py-14 lg:py-20">
          <div className="max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-wider text-gold-deep">
              Our story
            </span>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink text-balance sm:text-5xl">
              Built by a keeper, for keepers and buyers.
            </h1>
            <p className="mt-5 text-lg text-ink-soft">
              FarmGate started on a farm in Bugesera. After years of watching
              brokers inflate prices 20–40% on both sides, we built the direct
              marketplace Rwanda&apos;s livestock trade was missing.
            </p>
          </div>
        </div>
      </header>

      <section className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:py-20">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-line shadow-[var(--shadow-md)]">
          <Image
            src="/animals/cattle-3.jpg"
            alt="Cattle raised on a Rwandan farm"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="font-display text-3xl font-extrabold text-ink">
            The problem we solve
          </h2>
          <p className="mt-4 text-ink-soft">
            For generations, buying or selling an animal in Rwanda meant going
            through middlemen. Keepers got squeezed on price. Buyers overpaid and
            had no way to know if an animal was healthy or even real until they
            arrived with cash in hand.
          </p>
          <p className="mt-4 text-ink-soft">
            FarmGate changes that. Every animal is listed by a verified keeper
            with real photos, an honest price and health records. Buyers request
            through the platform, and our team makes sure every deal is safe and
            fair — for both sides.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              [SITE.stats.animalsSold, "Animals sold"],
              [SITE.stats.commission, "Buyer commission"],
              [SITE.stats.animalTypes, "Animal categories"],
              ["100%", "Verified keepers"],
            ].map(([v, l]) => (
              <div
                key={l}
                className="rounded-[var(--radius)] border border-line bg-surface p-4"
              >
                <p className="font-display text-2xl font-extrabold text-forest-deep">
                  {v}
                </p>
                <p className="text-sm text-ink-muted">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream-deep/40 py-16">
        <div className="container-page">
          <h2 className="font-display text-3xl font-extrabold text-ink">
            What we stand for
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["Fairness", "Keepers keep their margin. Buyers pay a fair price. No broker tax in the middle."],
              ["Trust", "Verified keepers, real photos, honest health records. What you see is what you get."],
              ["Rwanda first", "Built here, for Rwandan farmers and families — in English and Kinyarwanda."],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-[var(--radius-lg)] border border-line bg-surface p-7 shadow-[var(--shadow-sm)]"
              >
                <h3 className="font-display text-xl font-bold text-forest-deep">
                  {title}
                </h3>
                <p className="mt-2 text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest py-16 text-center text-white lg:py-20">
        <div className="container-page">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold sm:text-4xl">
            Join Rwanda&apos;s livestock marketplace
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/animals" variant="gold" size="lg">
              Browse animals
              <ArrowRightIcon className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink href="/sell" variant="outline" size="lg" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              Sell your animals
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
