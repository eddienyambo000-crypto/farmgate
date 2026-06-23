"use client";

import { useState } from "react";
import { submitInquiry } from "@/lib/actions/inquiry";
import { LockIcon, CheckIcon, ShieldCheckIcon } from "./icons";

const DISTRICTS = [
  "Bugesera", "Burera", "Gakenke", "Gasabo", "Gatsibo", "Gicumbi", "Gisagara",
  "Huye", "Kamonyi", "Karongi", "Kayonza", "Kicukiro", "Kirehe", "Muhanga",
  "Musanze", "Ngoma", "Ngororero", "Nyabihu", "Nyagatare", "Nyamagabe",
  "Nyamasheke", "Nyanza", "Nyarugenge", "Nyaruguru", "Rubavu", "Ruhango",
  "Rulindo", "Rusizi", "Rutsiro", "Rwamagana",
];

export function InquiryForm({
  listingSlug,
  listingTitle,
}: {
  listingSlug: string;
  listingTitle: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    const res = await submitInquiry({
      listingId: listingSlug,
      buyerName: String(formData.get("name") ?? ""),
      buyerPhone: String(formData.get("phone") ?? ""),
      buyerDistrict: String(formData.get("district") ?? ""),
      message: String(formData.get("message") ?? ""),
    });
    setPending(false);
    if (res.ok) setDone(true);
    else setError(res.error ?? "Something went wrong. Please try again.");
  }

  if (done) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-forest/20 bg-leaf-tint/40 p-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-forest text-white">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h3 className="mt-4 font-display text-xl font-bold text-forest-deep">
          Request received
        </h3>
        <p className="mt-2 text-sm text-ink-soft">
          The FarmGate team has your request for <strong>{listingTitle}</strong>.
          We&apos;ll contact you shortly to confirm availability and arrange a
          viewing. Keep your phone close.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="flex items-start gap-2 rounded-[var(--radius)] bg-leaf-tint/40 p-3 text-sm text-forest-deep">
        <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
        <p>
          FarmGate handles this deal directly. Send your request and our team
          contacts you — your details stay private.
        </p>
      </div>

      <Field label="Your name" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          placeholder="e.g. Jean Bosco"
          className={inputCls}
        />
      </Field>

      <Field label="Phone number" htmlFor="phone">
        <input
          id="phone"
          name="phone"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="07XX XXX XXX"
          className={inputCls}
        />
      </Field>

      <Field label="Your district" htmlFor="district">
        <select id="district" name="district" required className={inputCls}>
          <option value="">Select district…</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Message (optional)" htmlFor="message">
        <textarea
          id="message"
          name="message"
          rows={3}
          placeholder="When would you like to view or collect the animal?"
          className={`${inputCls} resize-none`}
        />
      </Field>

      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-forest font-semibold text-white shadow-[var(--shadow-md)] transition-[background-color,transform] duration-200 hover:bg-forest-deep active:scale-[0.99] disabled:opacity-60 cursor-pointer"
      >
        {pending ? "Sending…" : "Request this animal"}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-ink-muted">
        <LockIcon className="h-3.5 w-3.5" />
        Your information is only used to process this request.
      </p>
    </form>
  );
}

const inputCls =
  "w-full rounded-[var(--radius)] border border-line bg-surface px-4 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-muted hover:border-forest/30 focus-visible:border-forest";

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
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-ink-soft"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
