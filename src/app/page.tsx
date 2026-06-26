import Image from "next/image";
import Link from "next/link";
import { HeroSearch } from "@/components/HeroSearch";
import { HeroBackdrop } from "@/components/home/HeroBackdrop";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ListingCard } from "@/components/ListingCard";
import { ButtonLink } from "@/components/ui/Button";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
  Counter,
  Marquee,
  TiltCard,
} from "@/components/motion/Primitives";
import {
  ShieldCheckIcon,
  LockIcon,
  HandshakeIcon,
  TruckIcon,
  ArrowRightIcon,
  CheckIcon,
  MapPinIcon,
} from "@/components/icons";
import { getFeaturedListings, getDistricts } from "@/lib/data/listings";
import { getTestimonials } from "@/lib/data/testimonials";
import { getSettings } from "@/lib/data/settings";
import { CATEGORY_LIST } from "@/lib/categories";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, testimonials, districts, settings] = await Promise.all([
    getFeaturedListings(4),
    getTestimonials(),
    getDistricts(),
    getSettings(),
  ]);

  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative overflow-hidden">
        <HeroBackdrop />
        <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/70 px-3.5 py-1.5 text-sm font-medium text-forest-deep backdrop-blur-sm">
                <ShieldCheckIcon className="h-4 w-4 text-gold-deep" />
                Rwanda&apos;s first online livestock marketplace
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink text-balance sm:text-5xl lg:text-6xl">
                {settings.heroTitle ? (
                  settings.heroTitle
                ) : (
                  <>
                    Healthy animals,
                    <br />
                    <span className="text-forest">direct from the farm.</span>
                  </>
                )}
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft text-pretty">
                {settings.heroSubtitle ??
                  "Buy cattle, goats, pigs, chickens and rabbits from verified Rwandan keepers. Fair prices, real photos, vaccination records — and no middlemen taking a cut on either side."}
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8">
                <HeroSearch />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-forest" /> Verified keepers
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-forest" /> 0% buyer commission
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-forest" /> Nationwide delivery
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="relative">
            <TiltCard className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)] border border-line shadow-[var(--shadow-lg)] sm:aspect-[5/5]">
              <Image
                src="/animals/cattle-1.jpg"
                alt="Friesian dairy cattle on a Rwandan farm"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-dark/70 to-transparent p-5">
                <p className="text-sm font-medium text-white/90">
                  Listed by a verified keeper · Bugesera
                </p>
              </div>
            </TiltCard>
            <div className="absolute -left-4 top-6 hidden rounded-[var(--radius)] border border-line bg-surface px-4 py-3 shadow-[var(--shadow-lg)] sm:block">
              <p className="text-xs text-ink-muted">Verified keepers</p>
              <p className="font-display text-2xl font-extrabold text-forest-deep">
                100%
              </p>
            </div>
          </Reveal>
        </div>

        {/* Category marquee */}
        <div className="border-y border-line bg-white/55 py-3 backdrop-blur-sm">
          <Marquee speed={32}>
            {CATEGORY_LIST.concat(CATEGORY_LIST).map((c, idx) => (
              <Link
                key={`${c.type}-${idx}`}
                href={`/animals?type=${c.type}`}
                className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-forest/40 hover:text-forest-deep"
              >
                <span className="font-display font-bold text-forest">{c.label}</span>
                <span className="text-ink-muted">·</span>
                <span className="text-ink-muted">{c.labelRw}</span>
              </Link>
            ))}
          </Marquee>
        </div>

        {/* Stats */}
        <div className="border-b border-line bg-white/60 backdrop-blur-sm">
          <div className="container-page grid grid-cols-2 gap-6 py-7 sm:grid-cols-4">
            {[
              { v: 10, s: "+", l: "Years keeping animals" },
              { v: 500, s: "+", l: "Animals sold" },
              { v: 6, s: "", l: "Animal categories" },
              { v: 0, s: "%", l: "Buyer commission" },
            ].map((stat) => (
              <div key={stat.l} className="text-center">
                <Counter
                  to={stat.v}
                  suffix={stat.s}
                  className="font-display text-3xl font-extrabold text-forest-deep sm:text-4xl"
                />
                <p className="mt-1 text-xs text-ink-muted sm:text-sm">{stat.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── Categories ─────────────────────── */}
      <section className="container-page py-16 lg:py-20">
        <Reveal>
          <SectionHead
            eyebrow="Browse by animal"
            title="What are you looking for?"
            desc="Pick a category to see every animal currently available from keepers across Rwanda."
          />
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <CategoryGrid />
        </Reveal>
      </section>

      {/* ─────────────────────── Featured ─────────────────────── */}
      <section className="bg-cream-deep/40 py-16 lg:py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead
              eyebrow="Featured listings"
              title="Animals ready for a new home"
              desc="Hand-picked, verified and available now."
              align="left"
            />
            <ButtonLink href="/animals" variant="outline" size="sm">
              View all animals
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
          </div>
          <StaggerGroup className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((listing) => (
              <StaggerItem key={listing.id}>
                <TiltCard>
                  <ListingCard listing={listing} />
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ─────────────────────── How it works ─────────────────────── */}
      <section className="container-page py-16 lg:py-24">
        <Reveal>
          <SectionHead
            eyebrow="How Farmgate works"
            title="Buying an animal, the safe way"
            desc="No haggling games, no risky cash-in-hand meetups with strangers. Farmgate sits in the middle so every deal is handled properly."
          />
        </Reveal>
        <StaggerGroup className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", title: "Find your animal", body: "Browse verified listings with real photos, prices, breed, age and vaccination records. Filter by animal type and district." },
            { n: "02", title: "Request through Farmgate", body: "Tell us which animal you want. We capture your request and our team contacts you — you never chase a stranger's phone number." },
            { n: "03", title: "We arrange the deal", body: "Farmgate coordinates viewing, confirms the animal's health, and helps arrange pickup or delivery. You buy with confidence." },
          ].map((step) => (
            <StaggerItem
              key={step.n}
              className="relative rounded-[var(--radius-lg)] border border-line bg-surface p-7 shadow-[var(--shadow-sm)]"
            >
              <span className="font-display text-4xl font-extrabold text-leaf">{step.n}</span>
              <h3 className="mt-3 font-display text-xl font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-ink-soft">{step.body}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* ─────────────────────── Trust ─────────────────────── */}
      <section className="bg-forest-dark py-16 text-cream lg:py-24">
        <div className="container-page">
          <Reveal>
            <div className="max-w-2xl">
              <span className="text-sm font-semibold uppercase tracking-wider text-gold">Why Farmgate</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl">A marketplace built on trust</h2>
              <p className="mt-4 text-lg text-cream/80">Livestock is a big purchase. Farmgate protects both buyers and keepers so nobody gets cheated.</p>
            </div>
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheckIcon, title: "Verified keepers", body: "Every seller's identity and animals are checked before they can list." },
              { icon: LockIcon, title: "Your deal is protected", body: "Farmgate handles every enquiry, so prices stay fair and contacts stay private." },
              { icon: HandshakeIcon, title: "No middlemen markup", body: "Buy direct from the farm. No brokers inflating the price 20–40%." },
              { icon: TruckIcon, title: "Pickup & delivery", body: "We help arrange safe transport of your animal anywhere in Rwanda." },
            ].map((f) => (
              <StaggerItem key={f.title} className="rounded-[var(--radius-lg)] border border-cream/10 bg-white/5 p-6">
                <span className="grid h-12 w-12 place-items-center rounded-[var(--radius)] bg-gold/15 text-gold">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/75">{f.body}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ─────────────────────── Testimonials ─────────────────────── */}
      <section className="container-page py-16 lg:py-24">
        <Reveal>
          <SectionHead
            eyebrow="Loved by buyers & keepers"
            title="Real Rwandans, real deals"
            desc="Trust is the whole point. Here's what people across the country say."
          />
        </Reveal>
        <Reveal delay={0.1} className="mt-12">
          <TestimonialsCarousel items={testimonials} />
        </Reveal>
      </section>

      {/* ─────────────────────── Coverage ─────────────────────── */}
      <section className="bg-cream-deep/40 py-16 lg:py-20">
        <div className="container-page">
          <Reveal>
            <SectionHead
              eyebrow="Across Rwanda"
              title="Keepers in your district"
              desc="Farmgate connects buyers and keepers nationwide — and we're growing every week."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5">
              {districts.map((d) => (
                <Link
                  key={d}
                  href={`/animals?district=${encodeURIComponent(d)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink-soft shadow-[var(--shadow-sm)] transition-colors hover:border-forest/40 hover:text-forest-deep"
                >
                  <MapPinIcon className="h-4 w-4 text-forest-soft" />
                  {d}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────── Seller CTA ─────────────────────── */}
      <section className="container-page py-16 lg:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-line bg-grain p-8 shadow-[var(--shadow-md)] sm:p-12 lg:p-16">
            <div
              className="absolute inset-0 -z-10"
              style={{ background: "radial-gradient(90% 120% at 90% 10%, #e8f3ec 0%, #ffffff 55%)" }}
            />
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider text-gold-deep">For animal keepers</span>
                <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">Got animals to sell? Reach real buyers.</h2>
                <p className="mt-4 max-w-xl text-lg text-ink-soft">List your animals on Rwanda&apos;s livestock marketplace and let Farmgate bring you serious buyers. Get verified, get featured, and sell faster — we handle the enquiries for you.</p>
                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {["Free to list your first animals", "Verified keeper badge for trust", "We screen and route every buyer", "Featured placement to sell faster"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-ink-soft">
                      <CheckIcon className="h-5 w-5 shrink-0 text-forest" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href="/sell" variant="primary" size="lg">
                    Start selling
                    <ArrowRightIcon className="h-5 w-5" />
                  </ButtonLink>
                  <ButtonLink href="/how-it-works" variant="outline" size="lg">How it works</ButtonLink>
                </div>
              </div>
              <div className="relative hidden aspect-square overflow-hidden rounded-[var(--radius-lg)] border border-line shadow-[var(--shadow-lg)] lg:block">
                <Image src="/animals/goat-3.jpg" alt="A keeper's Boer-cross goat listed on Farmgate" fill sizes="35vw" className="object-cover" />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─────────────────────── Final CTA ─────────────────────── */}
      <section className="bg-forest py-16 text-center text-white lg:py-20">
        <div className="container-page">
          <Reveal>
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold sm:text-4xl">Find your next animal today.</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-cream/85">Hundreds of healthy animals from trusted keepers across Rwanda.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/animals" variant="gold" size="lg">
                Browse animals
                <ArrowRightIcon className="h-5 w-5" />
              </ButtonLink>
              <Link
                href="/find"
                className="inline-flex h-13 items-center justify-center rounded-[var(--radius)] border border-white/30 px-7 py-3.5 font-semibold text-white transition-colors duration-200 hover:bg-white/10"
              >
                Find your animal
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function SectionHead({
  eyebrow,
  title,
  desc,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="text-sm font-semibold uppercase tracking-wider text-gold-deep">{eyebrow}</span>
      <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h2>
      {desc && <p className="mt-4 text-lg text-ink-soft">{desc}</p>}
    </div>
  );
}
