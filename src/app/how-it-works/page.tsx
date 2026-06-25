import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import {
  SearchIcon,
  ShieldCheckIcon,
  HandshakeIcon,
  TruckIcon,
  LockIcon,
  ArrowRightIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "How Farmgate works for buyers and sellers — browse verified animals, request through the platform, and let Farmgate handle the deal safely.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <div className="bg-grain">
      <header className="border-b border-line bg-cream/50">
        <div className="container-page py-14 text-center lg:py-20">
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink text-balance sm:text-5xl">
            A safer way to buy and sell animals in Rwanda
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft">
            Farmgate sits between buyers and keepers so every deal is fair,
            verified and handled properly — no middlemen, no guesswork.
          </p>
        </div>
      </header>

      {/* Buyers */}
      <section className="container-page py-16 lg:py-20">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wider text-gold-deep">
            For buyers
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-ink">
            Find and buy with confidence
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: SearchIcon,
              n: "01",
              title: "Browse verified animals",
              body: "Real photos, honest prices, breed, age and vaccination records. Filter by animal type and district to find exactly what you need.",
            },
            {
              icon: ShieldCheckIcon,
              n: "02",
              title: "Request through Farmgate",
              body: "Found one you like? Send a request. We capture it and our team contacts you — you never chase a stranger's phone number or risk a scam.",
            },
            {
              icon: HandshakeIcon,
              n: "03",
              title: "We arrange everything",
              body: "Farmgate coordinates the viewing, confirms the animal's health, and helps arrange safe pickup or delivery. You pay only when you're happy.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-[var(--radius-lg)] border border-line bg-surface p-7 shadow-[var(--shadow-sm)]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-[var(--radius)] bg-leaf-tint text-forest-deep">
                <s.icon className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display text-sm font-bold text-leaf">
                {s.n}
              </p>
              <h3 className="font-display text-xl font-bold text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why contacts are private */}
      <section className="bg-forest-dark py-16 text-cream lg:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <span className="grid h-12 w-12 place-items-center rounded-[var(--radius)] bg-gold/15 text-gold">
              <LockIcon className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold text-white">
              Why we keep contacts private
            </h2>
            <p className="mt-4 text-lg text-cream/80">
              On Farmgate you don&apos;t see a seller&apos;s phone number, and they
              don&apos;t see yours. Every conversation runs through our team.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              "No scams — we verify both sides before anyone commits.",
              "No price games — keepers can't be undercut by brokers, buyers can't be overcharged.",
              "Real support — if anything goes wrong, Farmgate is accountable, not a stranger.",
              "Fair for everyone — the keeper keeps their margin, the buyer gets a fair price.",
            ].map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-[var(--radius)] border border-cream/10 bg-white/5 p-4"
              >
                <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <span className="text-cream/85">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Sellers */}
      <section className="container-page py-16 lg:py-20">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wider text-gold-deep">
            For keepers
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-ink">
            List once, sell faster
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {[
            ["01", "Apply", "Send your details and what you keep."],
            ["02", "Get verified", "We confirm your identity and animals."],
            ["03", "Go live", "We publish your listings with a verified badge."],
            ["04", "Sell", "We route serious buyers to you and help close."],
          ].map(([n, title, body]) => (
            <div
              key={n}
              className="rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-sm)]"
            >
              <span className="font-display text-3xl font-extrabold text-leaf">
                {n}
              </span>
              <h3 className="mt-2 font-display text-lg font-bold text-ink">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-soft">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink href="/animals" size="lg">
            Browse animals
            <ArrowRightIcon className="h-5 w-5" />
          </ButtonLink>
          <ButtonLink href="/sell" variant="outline" size="lg">
            Start selling
          </ButtonLink>
        </div>
      </section>

      {/* Delivery */}
      <section className="bg-cream-deep/40 py-16">
        <div className="container-page flex flex-col items-center gap-4 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-[var(--radius)] bg-forest text-white">
            <TruckIcon className="h-6 w-6" />
          </span>
          <h2 className="font-display text-2xl font-extrabold text-ink">
            Pickup &amp; delivery, sorted
          </h2>
          <p className="max-w-xl text-ink-soft">
            Buying from another district? Farmgate helps arrange safe, affordable
            transport of your animal anywhere in Rwanda — just ask when you make
            your request.
          </p>
        </div>
      </section>
    </div>
  );
}
