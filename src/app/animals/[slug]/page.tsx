import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getListingBySlug,
  getAllSlugs,
  getRelatedListings,
} from "@/lib/data/listings";
import { CATEGORIES } from "@/lib/categories";
import { formatRwf, formatDate, formatMemberSince } from "@/lib/format";
import { SITE } from "@/lib/site";
import { InquiryForm } from "@/components/InquiryForm";
import { ListingCard } from "@/components/ListingCard";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import {
  MapPinIcon,
  ScaleIcon,
  CalendarIcon,
  TagIcon,
  SyringeIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@/components/icons";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Animal not found" };

  const title = `${listing.title} — ${formatRwf(listing.priceRwf)}`;
  const description = `${listing.breed}, ${listing.ageLabel}, in ${listing.district}. ${listing.description}`;
  return {
    title,
    description,
    alternates: { canonical: `/animals/${listing.slug}` },
    openGraph: {
      title,
      description,
      images: [{ url: listing.images[0] }],
      type: "website",
    },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const cat = CATEGORIES[listing.animalType];
  const related = await getRelatedListings(listing, 3);

  const specs = [
    { icon: TagIcon, label: "Breed", value: listing.breed },
    { icon: CalendarIcon, label: "Age", value: listing.ageLabel },
    {
      icon: ScaleIcon,
      label: "Weight",
      value: listing.weightKg ? `${listing.weightKg} kg` : "—",
    },
    {
      icon: CheckIcon,
      label: "Gender",
      value: listing.gender[0].toUpperCase() + listing.gender.slice(1),
    },
    { icon: CheckIcon, label: "Purpose", value: capitalize(listing.purpose) },
    {
      icon: SyringeIcon,
      label: "Vaccinated",
      value: listing.vaccinated ? "Yes" : "Not yet",
    },
  ];

  // Product structured data — improves search visibility. Note it intentionally
  // contains no seller contact details.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: `${SITE.url}${listing.images[0]}`,
    category: cat.label,
    offers: {
      "@type": "Offer",
      price: listing.priceRwf,
      priceCurrency: "RWF",
      availability:
        listing.status === "sold"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      areaServed: "RW",
    },
  };

  return (
    <article className="bg-grain">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="container-page flex flex-wrap items-center gap-1.5 pt-6 text-sm text-ink-muted"
      >
        <Link href="/animals" className="hover:text-forest-deep">
          Animals
        </Link>
        <span>/</span>
        <Link
          href={`/animals?type=${listing.animalType}`}
          className="hover:text-forest-deep"
        >
          {cat.plural}
        </Link>
        <span>/</span>
        <span className="text-ink-soft">{listing.title}</span>
      </nav>

      <div className="container-page grid gap-10 py-8 lg:grid-cols-[1.3fr_0.7fr] lg:py-10">
        {/* Left — gallery + details */}
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-line shadow-[var(--shadow-md)]">
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
            <div className="absolute left-4 top-4 flex gap-2">
              <span className="rounded-full bg-forest-dark/85 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                {cat.label}
              </span>
              {listing.featured && (
                <span className="rounded-full bg-gold px-3 py-1 text-sm font-bold text-forest-dark">
                  Featured
                </span>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {listing.title}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-ink-soft">
              <MapPinIcon className="h-4 w-4 text-forest-soft" />
              {listing.sector}, {listing.district} · Listed{" "}
              {formatDate(listing.createdAt)}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specs.map((s) => (
                <div
                  key={s.label}
                  className="rounded-[var(--radius)] border border-line bg-surface p-4"
                >
                  <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">
                    <s.icon className="h-4 w-4 text-forest-soft" />
                    {s.label}
                  </span>
                  <p className="mt-1 font-display text-lg font-bold text-ink">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-ink">
                About this animal
              </h2>
              <p className="mt-3 leading-relaxed text-ink-soft">
                {listing.description}
              </p>
              {listing.healthNotes && (
                <p className="mt-3 flex items-start gap-2 rounded-[var(--radius)] border border-line bg-leaf-tint/30 p-3 text-sm text-forest-deep">
                  <SyringeIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <strong>Health:</strong> {listing.healthNotes}
                  </span>
                </p>
              )}
            </div>

            {/* Seller — public info only, NO contact details */}
            <div className="mt-8 rounded-[var(--radius-lg)] border border-line bg-surface p-5">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-forest text-lg font-bold text-white">
                  {listing.seller.displayName.charAt(0)}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold text-ink">
                      {listing.seller.displayName}
                    </p>
                    {listing.seller.verified && <VerifiedBadge />}
                  </div>
                  <p className="text-sm text-ink-muted">
                    {listing.seller.district} ·{" "}
                    {formatMemberSince(listing.seller.memberSince)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink-soft">{listing.seller.bio}</p>
            </div>
          </div>
        </div>

        {/* Right — sticky price + inquiry (the only way to reach the seller) */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-[var(--shadow-lg)]">
            <p className="text-sm text-ink-muted">Price</p>
            <p className="font-display text-3xl font-extrabold text-forest-deep">
              {formatRwf(listing.priceRwf)}
            </p>
            {listing.negotiable && (
              <p className="text-sm text-ink-muted">Price negotiable</p>
            )}

            <hr className="my-5 border-line" />

            <h2 className="font-display text-lg font-bold text-ink">
              Interested in this animal?
            </h2>
            <p className="mb-4 mt-1 text-sm text-ink-soft">
              Send a request and FarmGate will get back to you.
            </p>

            <InquiryForm
              listingSlug={listing.slug}
              listingTitle={listing.title}
            />
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="container-page border-t border-line py-14">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-extrabold text-ink">
              More {cat.plural.toLowerCase()} you may like
            </h2>
            <Link
              href={`/animals?type=${listing.animalType}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-forest-deep hover:text-forest"
            >
              View all
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
