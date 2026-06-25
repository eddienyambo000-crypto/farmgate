import type { Metadata } from "next";
import { SellForm } from "@/components/SellForm";
import {
  ShieldCheckIcon,
  HandshakeIcon,
  TagIcon,
  CheckIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Sell Your Animals on Rwanda's Livestock Marketplace",
  description:
    "List your cattle, goats, pigs, chickens or rabbits on Farmgate and reach serious buyers across Rwanda. Free to apply, verified keeper badge, we handle every enquiry.",
  alternates: { canonical: "/sell" },
};

export default function SellPage() {
  return (
    <div className="bg-grain">
      <section className="border-b border-line bg-cream/50">
        <div className="container-page grid gap-12 py-14 lg:grid-cols-[1fr_1fr] lg:items-start lg:py-20">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-gold-deep">
              For animal keepers
            </span>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight text-ink text-balance sm:text-5xl">
              Sell your animals to buyers across Rwanda.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-soft">
              Farmgate puts your animals in front of serious buyers and handles
              every enquiry for you. No brokers eating your margin, no time wasted
              with people who never show up.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                {
                  icon: TagIcon,
                  title: "Free to list your first animals",
                  body: "Get started at no cost. Pay only when you want featured placement.",
                },
                {
                  icon: ShieldCheckIcon,
                  title: "Become a verified keeper",
                  body: "The verified badge tells buyers you're real and trustworthy — they buy faster.",
                },
                {
                  icon: HandshakeIcon,
                  title: "We bring you serious buyers",
                  body: "Farmgate screens every enquiry and connects you only with ready buyers.",
                },
              ].map((b) => (
                <li
                  key={b.title}
                  className="flex gap-3 rounded-[var(--radius)] border border-line bg-surface p-4"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-leaf-tint text-forest-deep">
                    <b.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display font-bold text-ink">{b.title}</p>
                    <p className="text-sm text-ink-soft">{b.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-[var(--shadow-lg)] sm:p-8">
            <h2 className="font-display text-2xl font-bold text-ink">
              Apply in 2 minutes
            </h2>
            <p className="mb-6 mt-1 text-sm text-ink-soft">
              Fill this in and our team calls you to verify and list your animals.
            </p>
            <SellForm />
          </div>
        </div>
      </section>

      {/* How selling works */}
      <section className="container-page py-16 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-gold-deep">
            How selling works
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            From your farm to a sale
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {[
            ["01", "Apply", "Send your details and what you keep. Takes 2 minutes."],
            ["02", "Get verified", "We confirm your identity and check your animals are real and healthy."],
            ["03", "Go live", "We photograph and publish your listings with a verified badge."],
            ["04", "We send buyers", "Farmgate routes serious buyers to you and helps close the deal."],
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

        <div className="mx-auto mt-12 max-w-2xl rounded-[var(--radius-lg)] border border-forest/20 bg-leaf-tint/30 p-6 text-center">
          <p className="flex items-center justify-center gap-2 font-display text-lg font-bold text-forest-deep">
            <CheckIcon className="h-5 w-5" />
            Our promise to keepers
          </p>
          <p className="mt-2 text-ink-soft">
            List your animals and get a serious buyer enquiry — or keep listing
            free until you do. Zero risk to you.
          </p>
        </div>
      </section>
    </div>
  );
}
