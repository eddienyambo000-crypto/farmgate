import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getListings } from "@/lib/data/listings";
import { CATEGORIES } from "@/lib/categories";
import { ANIMAL_TYPES, type AnimalType } from "@/lib/types";
import { ListingCard } from "@/components/ListingCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Primitives";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  ItemListJsonLd,
} from "@/components/seo/JsonLd";
import { ArrowRightIcon, ShieldCheckIcon } from "@/components/icons";
import { SITE } from "@/lib/site";

export const revalidate = 60;

export function generateStaticParams() {
  return ANIMAL_TYPES.map((type) => ({ type }));
}

function isType(t: string): t is AnimalType {
  return ANIMAL_TYPES.includes(t as AnimalType);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  if (!isType(type)) return { title: "Not found" };
  const c = CATEGORIES[type];
  const title = `${c.plural} for Sale in Rwanda — Buy ${c.plural} Online`;
  return {
    title,
    description: `Buy healthy ${c.plural.toLowerCase()} (${c.labelRw}) from verified keepers across Rwanda on Farmgate. Real photos, fair prices, vaccination records, nationwide delivery. ${c.blurb}.`,
    alternates: { canonical: `/livestock/${type}` },
    openGraph: { title, type: "website" },
  };
}

function faqFor(plural: string) {
  const a = plural.toLowerCase();
  return [
    {
      q: `How much do ${a} cost in Rwanda?`,
      a: `Prices vary by breed, age and condition. Every ${a.replace(/s$/, "")} on Farmgate shows a clear, fair price set by the keeper — with no middleman markup. Browse the listings to compare.`,
    },
    {
      q: `Are the ${a} healthy and vaccinated?`,
      a: `Listings show vaccination and health details, and every keeper is verified before they can post. Farmgate confirms the animal's condition before any deal is completed.`,
    },
    {
      q: `Can Farmgate deliver ${a} to my district?`,
      a: `Yes — Farmgate helps arrange safe, affordable transport anywhere in Rwanda. Just mention your location when you request an animal.`,
    },
    {
      q: `How do I buy a ${a.replace(/s$/, "")} on Farmgate?`,
      a: `Find one you like, send a request through the platform, and the Farmgate team contacts you to confirm and arrange viewing or delivery. You never deal with a stranger directly.`,
    },
  ];
}

export default async function LivestockCategory({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!isType(type)) notFound();
  const c = CATEGORIES[type];
  const listings = await getListings({ type });
  const faq = faqFor(c.plural);

  return (
    <div className="bg-grain">
      <BreadcrumbJsonLd
        items={[
          { name: "Animals", url: "/animals" },
          { name: c.plural, url: `/livestock/${type}` },
        ]}
      />
      <FaqJsonLd items={faq.map((f) => ({ q: f.q, a: f.a }))} />
      <ItemListJsonLd urls={listings.map((l) => `/animals/${l.slug}`)} />

      <header className="border-b border-line bg-cream/50">
        <div className="container-page py-12 lg:py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold-deep">
            {c.plural} · {c.labelRw}
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink text-balance sm:text-5xl">
            {c.plural} for sale in Rwanda
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            Buy {c.plural.toLowerCase()} direct from verified Rwandan keepers on
            Farmgate — {c.blurb.toLowerCase()}. Fair prices, real photos,
            vaccination records, and no middlemen taking a cut.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/find" size="md">
              Find your {c.label.toLowerCase().replace(/s$/, "")}
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
              <ShieldCheckIcon className="h-4 w-4 text-forest" /> Verified keepers
              only
            </span>
          </div>
        </div>
      </header>

      <section className="container-page py-12">
        <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">
          Available {c.plural.toLowerCase()} ({listings.length})
        </h2>
        {listings.length > 0 ? (
          <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((l) => (
              <StaggerItem key={l.id}>
                <ListingCard listing={l} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-line bg-surface p-10 text-center">
            <p className="font-display text-lg font-bold text-ink">
              No {c.plural.toLowerCase()} listed right now
            </p>
            <p className="mt-2 text-ink-soft">
              New animals are added every week — or tell us what you&apos;re
              after.
            </p>
            <div className="mt-5">
              <ButtonLink href="/find" size="sm">
                Request a {c.label.toLowerCase().replace(/s$/, "")}
              </ButtonLink>
            </div>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="border-t border-line bg-cream/40 py-14">
        <div className="container-page max-w-3xl">
          <Reveal>
            <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Buying {c.plural.toLowerCase()} in Rwanda — FAQ
            </h2>
          </Reveal>
          <div className="mt-8 space-y-4">
            {faq.map((f) => (
              <Reveal key={f.q}>
                <details className="group rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
                  <summary className="cursor-pointer font-display text-lg font-bold text-ink">
                    {f.q}
                  </summary>
                  <p className="mt-3 text-ink-soft">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest py-14 text-center text-white">
        <div className="container-page">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
            Ready to buy {c.plural.toLowerCase()} the safe way?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-cream/85">
            {SITE.legalName} connects you with verified keepers across Rwanda.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/animals" variant="gold" size="lg">
              Browse all animals
            </ButtonLink>
            <Link
              href="/sell"
              className="inline-flex h-13 items-center rounded-[var(--radius)] border border-white/30 px-7 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Sell your {c.label.toLowerCase()}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
