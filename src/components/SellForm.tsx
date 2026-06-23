"use client";

import { useState } from "react";
import { submitSellerApplication } from "@/lib/actions/seller";
import { CATEGORY_LIST } from "@/lib/categories";
import { CheckIcon } from "./icons";

const DISTRICTS = [
  "Bugesera", "Burera", "Gakenke", "Gasabo", "Gatsibo", "Gicumbi", "Gisagara",
  "Huye", "Kamonyi", "Karongi", "Kayonza", "Kicukiro", "Kirehe", "Muhanga",
  "Musanze", "Ngoma", "Ngororero", "Nyabihu", "Nyagatare", "Nyamagabe",
  "Nyamasheke", "Nyanza", "Nyarugenge", "Nyaruguru", "Rubavu", "Ruhango",
  "Rulindo", "Rusizi", "Rutsiro", "Rwamagana",
];

const inputCls =
  "w-full rounded-[var(--radius)] border border-line bg-surface px-4 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-muted hover:border-forest/30 focus-visible:border-forest";

export function SellForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await submitSellerApplication({
      fullName: String(formData.get("fullName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      district: String(formData.get("district") ?? ""),
      animalType: String(formData.get("animalType") ?? ""),
      animalCount: String(formData.get("animalCount") ?? ""),
      details: String(formData.get("details") ?? ""),
    });
    setPending(false);
    if (res.ok) setDone(true);
    else setError(res.error ?? "Something went wrong. Please try again.");
  }

  if (done) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-forest/20 bg-leaf-tint/40 p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest text-white">
          <CheckIcon className="h-7 w-7" />
        </span>
        <h3 className="mt-4 font-display text-2xl font-bold text-forest-deep">
          Application received
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-ink-soft">
          Thank you. The FarmGate team will call you to verify your animals and
          get your first listings live. Keep your phone close.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="fullName">
          <input id="fullName" name="fullName" required autoComplete="name" placeholder="e.g. Ferdinand N." className={inputCls} />
        </Field>
        <Field label="Phone number" htmlFor="phone">
          <input id="phone" name="phone" required inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" className={inputCls} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="District" htmlFor="district">
          <select id="district" name="district" required className={inputCls}>
            <option value="">Select district…</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="What do you keep?" htmlFor="animalType">
          <select id="animalType" name="animalType" required className={inputCls}>
            <option value="">Select animal…</option>
            {CATEGORY_LIST.map((c) => (
              <option key={c.type} value={c.type}>{c.plural}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="How many animals do you want to list? (optional)" htmlFor="animalCount">
        <input id="animalCount" name="animalCount" placeholder="e.g. 3 cattle, 10 goats" className={inputCls} />
      </Field>

      <Field label="Tell us about your animals (optional)" htmlFor="details">
        <textarea id="details" name="details" rows={3} placeholder="Breeds, ages, prices, vaccination — anything that helps us list them." className={`${inputCls} resize-none`} />
      </Field>

      {error && (
        <p role="alert" className="text-sm font-medium text-danger">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius)] bg-forest font-semibold text-white shadow-[var(--shadow-md)] transition-[background-color,transform] duration-200 hover:bg-forest-deep active:scale-[0.99] disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Sending…" : "Apply to become a keeper"}
      </button>
      <p className="text-center text-xs text-ink-muted">
        Free to apply. FarmGate verifies every keeper before listing.
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
      </label>
      {children}
    </div>
  );
}
