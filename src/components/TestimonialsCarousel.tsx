"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Testimonial } from "@/lib/data/testimonials";
import { useI18n } from "@/lib/i18n";

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={i < n ? "var(--color-gold)" : "none"}
          stroke="var(--color-gold)"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsCarousel({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const { tc } = useI18n();
  if (items.length === 0) return null;
  const active = items[i];

  const go = (dir: number) =>
    setI((p) => (p + dir + items.length) % items.length);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative min-h-[260px] rounded-[var(--radius-xl)] border border-line bg-surface p-8 shadow-[var(--shadow-lg)] sm:p-10">
        <svg
          className="absolute right-6 top-6 h-12 w-12 text-leaf-tint"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M9.5 4C6.5 5.5 4.5 8.5 4.5 12v8h7v-8h-4c0-2 1-3.5 3-4.5L9.5 4zm9 0c-3 1.5-5 4.5-5 8v8h7v-8h-4c0-2 1-3.5 3-4.5L18.5 4z" />
        </svg>
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={active.id}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Stars n={active.rating} />
            <p className="mt-4 font-display text-xl leading-relaxed text-ink sm:text-2xl">
              “{tc(active.quote, active.quoteRw)}”
            </p>
            <footer className="mt-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-forest text-base font-bold text-white">
                {active.name.charAt(0)}
              </span>
              <div>
                <p className="font-semibold text-ink">{active.name}</p>
                <p className="text-sm text-ink-muted">
                  {active.role} · {active.location}
                </p>
              </div>
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <NavBtn label="Previous" onClick={() => go(-1)} dir="left" />
        <div className="flex gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to testimonial ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === i ? "w-6 bg-forest" : "w-2 bg-line hover:bg-leaf"
              }`}
            />
          ))}
        </div>
        <NavBtn label="Next" onClick={() => go(1)} dir="right" />
      </div>
    </div>
  );
}

function NavBtn({
  label,
  onClick,
  dir,
}: {
  label: string;
  onClick: () => void;
  dir: "left" | "right";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:border-forest/40 hover:text-forest-deep cursor-pointer"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {dir === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
      </svg>
    </button>
  );
}
