"use client";

import { useActionState, useState } from "react";
import { updateSettingsAction } from "@/lib/actions/settings";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { SiteSettings } from "@/lib/settings-types";

const input =
  "w-full rounded-[var(--radius)] border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-muted hover:border-forest/30 focus-visible:border-forest";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, undefined);
  const [logoUrl, setLogoUrl] = useState<string>(settings.logoUrl ?? "");

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      {/* Logo */}
      <Section title="Logo & branding">
        <input type="hidden" name="logoUrl" value={logoUrl} />
        <ImageUploader
          bucket="fg-brand"
          single
          value={logoUrl ? [logoUrl] : []}
          onChange={(urls) => setLogoUrl(urls[0] ?? "")}
        />
      </Section>

      {/* Hero */}
      <Section title="Homepage hero (optional override)">
        <Field label="Hero title">
          <input name="heroTitle" defaultValue={settings.heroTitle ?? ""} placeholder="Leave blank to keep the default" className={input} />
        </Field>
        <Field label="Hero subtitle">
          <textarea name="heroSubtitle" rows={2} defaultValue={settings.heroSubtitle ?? ""} placeholder="Leave blank to keep the default" className={`${input} resize-none`} />
        </Field>
        <Field label="Announcement bar (optional)">
          <input name="announcement" defaultValue={settings.announcement ?? ""} placeholder="e.g. Free delivery this month!" className={input} />
        </Field>
      </Section>

      {/* Contact */}
      <Section title="Contact & social">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp number (digits)">
            <input name="contactWhatsapp" defaultValue={settings.contactWhatsapp} placeholder="250783358497" className={input} />
          </Field>
          <Field label="Phone (display)">
            <input name="contactPhone" defaultValue={settings.contactPhone} placeholder="+250 783 358 497" className={input} />
          </Field>
          <Field label="Email">
            <input name="contactEmail" type="email" defaultValue={settings.contactEmail} className={input} />
          </Field>
          <div />
          <Field label="Instagram URL">
            <input name="instagram" defaultValue={settings.instagram} placeholder="https://instagram.com/..." className={input} />
          </Field>
          <Field label="Facebook URL">
            <input name="facebook" defaultValue={settings.facebook} placeholder="https://facebook.com/..." className={input} />
          </Field>
        </div>
      </Section>

      <div className="flex items-center gap-4 border-t border-line pt-5">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center rounded-[var(--radius)] bg-forest px-6 font-semibold text-white shadow-[var(--shadow-md)] transition-[background-color,transform] hover:bg-forest-deep active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
        {state?.saved && <span className="text-sm font-medium text-forest">Saved ✓</span>}
        {state?.ok === false && <span className="text-sm font-medium text-danger">{state.error}</span>}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-sm)]">
      <h2 className="mb-4 font-display text-lg font-bold text-ink">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
