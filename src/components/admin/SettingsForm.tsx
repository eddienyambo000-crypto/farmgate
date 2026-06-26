"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { updateSettingsAction } from "@/lib/actions/settings";
import { uploadImage } from "@/lib/actions/upload";
import type { SiteSettings } from "@/lib/settings-types";

const input =
  "w-full rounded-[var(--radius)] border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-muted hover:border-forest/30 focus-visible:border-forest";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, undefined);
  const [logoUrl, setLogoUrl] = useState<string>(settings.logoUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadErr(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "fg-brand");
    const res = await uploadImage(fd);
    setUploading(false);
    if (res.ok && res.url) setLogoUrl(res.url);
    else setUploadErr(res.error ?? "Upload failed.");
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      {/* Logo */}
      <Section title="Logo & branding">
        <input type="hidden" name="logoUrl" value={logoUrl} />
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-[var(--radius)] border border-line bg-cream">
            {logoUrl ? (
              <Image src={logoUrl} alt="Logo" width={64} height={64} className="h-16 w-16 object-contain" />
            ) : (
              <span className="text-xs text-ink-muted">No logo</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-10 cursor-pointer items-center rounded-[var(--radius)] border border-forest/30 bg-white px-4 text-sm font-semibold text-forest-deep hover:border-forest">
              {uploading ? "Uploading…" : "Upload logo"}
              <input type="file" accept="image/*" onChange={onLogo} disabled={uploading} className="hidden" />
            </label>
            {logoUrl && (
              <button type="button" onClick={() => setLogoUrl("")} className="text-xs font-semibold text-danger hover:underline cursor-pointer">
                Remove
              </button>
            )}
          </div>
        </div>
        {uploadErr && <p className="mt-2 text-sm text-danger">{uploadErr}</p>}
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
