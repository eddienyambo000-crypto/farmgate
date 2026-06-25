"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CATEGORY_LIST } from "@/lib/categories";
import type { AnimalType } from "@/lib/types";
import { CheckIcon, ArrowRightIcon } from "@/components/icons";

const BUDGETS = [
  { label: "Under RWF 50,000", value: 50000 },
  { label: "RWF 50,000 – 150,000", value: 150000 },
  { label: "RWF 150,000 – 500,000", value: 500000 },
  { label: "Any budget", value: 0 },
];

export function AnimalFinder({ districts }: { districts: string[] }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<AnimalType | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [district, setDistrict] = useState<string>("");

  const steps = ["Animal", "Budget", "District"];

  function finish(dist: string) {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (budget) params.set("maxPrice", String(budget));
    if (dist) params.set("district", dist);
    router.push(`/animals?${params.toString()}`);
  }

  const variants = reduce
    ? undefined
    : {
        enter: { opacity: 0, x: 30 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -30 },
      };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition-colors ${
                i < step
                  ? "bg-forest text-white"
                  : i === step
                    ? "bg-gold text-forest-dark"
                    : "bg-line text-ink-muted"
              }`}
            >
              {i < step ? <CheckIcon className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`text-sm font-medium ${i === step ? "text-forest-deep" : "text-ink-muted"}`}>
              {s}
            </span>
            {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-line" />}
          </div>
        ))}
      </div>

      <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-[var(--shadow-lg)] sm:p-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h2 className="font-display text-2xl font-bold text-ink">What animal are you looking for?</h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {CATEGORY_LIST.map((c) => (
                  <button
                    key={c.type}
                    onClick={() => {
                      setType(c.type);
                      setStep(1);
                    }}
                    className={`group rounded-[var(--radius-lg)] border p-4 text-left transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] ${
                      type === c.type ? "border-forest bg-leaf-tint/40" : "border-line bg-surface hover:border-forest/40"
                    }`}
                  >
                    <p className="font-display font-bold text-ink">{c.label}</p>
                    <p className="text-xs text-ink-muted">{c.labelRw}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h2 className="font-display text-2xl font-bold text-ink">What&apos;s your budget?</h2>
              <div className="mt-6 grid gap-3">
                {BUDGETS.map((b) => (
                  <button
                    key={b.label}
                    onClick={() => {
                      setBudget(b.value);
                      setStep(2);
                    }}
                    className="flex items-center justify-between rounded-[var(--radius)] border border-line bg-surface px-5 py-3.5 text-left font-medium text-ink transition-colors cursor-pointer hover:border-forest/40 hover:bg-leaf-tint/30"
                  >
                    {b.label}
                    <ArrowRightIcon className="h-4 w-4 text-forest-soft" />
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(0)} className="mt-5 text-sm font-medium text-ink-muted hover:text-forest-deep cursor-pointer">
                ← Back
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h2 className="font-display text-2xl font-bold text-ink">Where are you?</h2>
              <p className="mt-1 text-sm text-ink-soft">Pick your district, or search nationwide.</p>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-5 w-full rounded-[var(--radius)] border border-line bg-surface px-4 py-3 text-ink outline-none hover:border-forest/30 focus-visible:border-forest"
              >
                <option value="">All of Rwanda</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <div className="mt-6 flex items-center justify-between">
                <button onClick={() => setStep(1)} className="text-sm font-medium text-ink-muted hover:text-forest-deep cursor-pointer">
                  ← Back
                </button>
                <button
                  onClick={() => finish(district)}
                  className="inline-flex h-12 items-center gap-2 rounded-[var(--radius)] bg-forest px-6 font-semibold text-white shadow-[var(--shadow-md)] transition-[background-color,transform] hover:bg-forest-deep active:scale-[0.99] cursor-pointer"
                >
                  Show my matches
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
