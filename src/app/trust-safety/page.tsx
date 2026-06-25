import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import {
  ShieldCheckIcon,
  LockIcon,
  SyringeIcon,
  TruckIcon,
  HandshakeIcon,
  ArrowRightIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Trust & Safety",
  description:
    "How Farmgate keeps buyers and keepers safe — verified keepers, private contacts, health records and protected deals.",
  alternates: { canonical: "/trust-safety" },
};

const PILLARS = [
  {
    icon: ShieldCheckIcon,
    title: "Verified keepers only",
    body: "Every seller's identity is checked and their animals confirmed before a single listing goes live. The verified badge means Farmgate vouches for them.",
  },
  {
    icon: LockIcon,
    title: "Private contacts",
    body: "Buyers never see a keeper's phone number and keepers never see a buyer's. Every conversation runs through Farmgate, so nobody can be scammed or undercut.",
  },
  {
    icon: SyringeIcon,
    title: "Honest health records",
    body: "Listings show breed, age, weight and vaccination status. We ask keepers to be truthful and verify where we can, so you know what you're buying.",
  },
  {
    icon: HandshakeIcon,
    title: "Protected deals",
    body: "Farmgate coordinates the viewing and confirms the animal before money changes hands. If something isn't as described, you don't have to proceed.",
  },
  {
    icon: TruckIcon,
    title: "Safe transport",
    body: "We help arrange trusted transport so your animal arrives safely — no risky cash-in-hand meetups with strangers.",
  },
];

export default function TrustSafetyPage() {
  return (
    <div className="bg-grain">
      <header className="border-b border-line bg-cream/50">
        <div className="container-page py-14 text-center lg:py-20">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-[var(--radius-lg)] bg-forest text-white shadow-[var(--shadow-md)]">
            <ShieldCheckIcon className="h-7 w-7" />
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-extrabold tracking-tight text-ink text-balance sm:text-5xl">
            Your safety is the whole point
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft">
            Livestock is a serious purchase. Farmgate is built so buyers and
            keepers can trade with total confidence.
          </p>
        </div>
      </header>

      <section className="container-page py-16 lg:py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-[var(--radius-lg)] border border-line bg-surface p-7 shadow-[var(--shadow-sm)]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-[var(--radius)] bg-leaf-tint text-forest-deep">
                <p.icon className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold text-ink">
                {p.title}
              </h2>
              <p className="mt-2 text-ink-soft">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-3xl rounded-[var(--radius-lg)] border border-line bg-surface p-8 shadow-[var(--shadow-sm)]">
          <h2 className="font-display text-2xl font-bold text-ink">
            Tips for a safe purchase
          </h2>
          <ul className="mt-4 space-y-3 text-ink-soft">
            {[
              "Always request the animal through Farmgate — never send money to anyone claiming to be a seller off-platform.",
              "Ask to view the animal, or have Farmgate confirm its condition, before you pay.",
              "Confirm vaccination and health details with our team.",
              "Use Farmgate's arranged transport for deliveries between districts.",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-forest py-16 text-center text-white">
        <div className="container-page">
          <h2 className="font-display text-3xl font-extrabold">
            Trade with confidence
          </h2>
          <div className="mt-8">
            <ButtonLink href="/animals" variant="gold" size="lg">
              Browse verified animals
              <ArrowRightIcon className="h-5 w-5" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
