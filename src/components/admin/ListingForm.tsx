"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PublicListing } from "@/lib/types";
import { ANIMAL_TYPES } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import type { ActionResult } from "@/lib/actions/admin";
import { uploadImage } from "@/lib/actions/upload";

type Action = (
  prev: ActionResult | undefined,
  fd: FormData,
) => Promise<ActionResult>;

const GENDERS = ["male", "female", "mixed"];
const PURPOSES = ["dairy", "meat", "breeding", "layers", "broilers", "pets", "general"];
const STATUSES = ["active", "pending", "sold", "rejected"];

const input =
  "w-full rounded-[var(--radius)] border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-muted hover:border-forest/30 focus-visible:border-forest";

export function ListingForm({
  action,
  sellers,
  listing,
}: {
  action: Action;
  sellers: { id: string; displayName: string }[];
  listing?: PublicListing & { sellerId?: string };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(listing?.images ?? []);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const error = state?.ok === false ? state.error : uploadError;

  function addImage(url: string) {
    const v = url.trim();
    if (v && !images.includes(v)) setImages((prev) => [...prev, v]);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadImage(fd);
    setUploading(false);
    if (res.ok && res.url) addImage(res.url);
    else setUploadError(res.error ?? "Upload failed.");
  }

  const sellerId =
    listing?.sellerId ?? listing?.seller?.id ?? sellers[0]?.id ?? "";

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-sm)]"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Animal title" full>
          <input name="title" required defaultValue={listing?.title} placeholder="e.g. Friesian Dairy Cow" className={input} />
        </Field>
        <Field label="Animal type">
          <select name="animalType" defaultValue={listing?.animalType ?? "cattle"} className={input}>
            {ANIMAL_TYPES.map((t) => (
              <option key={t} value={t}>{CATEGORIES[t].label}</option>
            ))}
          </select>
        </Field>
        <Field label="Keeper">
          <select name="sellerId" defaultValue={sellerId} className={input}>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>{s.displayName}</option>
            ))}
          </select>
        </Field>
        <Field label="Breed">
          <input name="breed" defaultValue={listing?.breed} placeholder="e.g. Friesian (Holstein)" className={input} />
        </Field>
        <Field label="Age">
          <input name="ageLabel" defaultValue={listing?.ageLabel} placeholder="e.g. 3 years" className={input} />
        </Field>
        <Field label="Weight (kg)">
          <input name="weightKg" type="number" min="0" defaultValue={listing?.weightKg ?? ""} placeholder="420" className={input} />
        </Field>
        <Field label="Price (RWF)">
          <input name="priceRwf" type="number" min="0" required defaultValue={listing?.priceRwf} placeholder="850000" className={input} />
        </Field>
        <Field label="Gender">
          <select name="gender" defaultValue={listing?.gender ?? "mixed"} className={input}>
            {GENDERS.map((g) => <option key={g} value={g}>{cap(g)}</option>)}
          </select>
        </Field>
        <Field label="Purpose">
          <select name="purpose" defaultValue={listing?.purpose ?? "general"} className={input}>
            {PURPOSES.map((p) => <option key={p} value={p}>{cap(p)}</option>)}
          </select>
        </Field>
        <Field label="District">
          <input name="district" defaultValue={listing?.district} placeholder="Bugesera" className={input} />
        </Field>
        <Field label="Sector">
          <input name="sector" defaultValue={listing?.sector} placeholder="Nyamata" className={input} />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={listing?.status ?? "active"} className={input}>
            {STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Description" full>
        <textarea name="description" rows={3} defaultValue={listing?.description} placeholder="Tell buyers about this animal…" className={`${input} resize-none`} />
      </Field>

      <Field label="Health notes" full>
        <input name="healthNotes" defaultValue={listing?.healthNotes ?? ""} placeholder="e.g. Vaccinated, dewormed, vet-checked." className={input} />
      </Field>

      <Field label="Photos" full hint="Upload from your device, or add an image URL / bundled path like /animals/cattle-1.jpg">
        <input type="hidden" name="images" value={images.join("\n")} />

        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {images.map((src) => (
              <div
                key={src}
                className="relative h-20 w-20 overflow-hidden rounded-[var(--radius)] border border-line"
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((p) => p.filter((x) => x !== src))}
                  aria-label="Remove photo"
                  className="absolute right-0 top-0 grid h-5 w-5 place-items-center bg-forest-dark/80 text-xs text-white hover:bg-danger cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex h-10 cursor-pointer items-center rounded-[var(--radius)] border border-forest/30 bg-white px-4 text-sm font-semibold text-forest-deep transition-colors hover:border-forest">
            {uploading ? "Uploading…" : "Upload photo"}
            <input type="file" accept="image/*" onChange={onFile} disabled={uploading} className="hidden" />
          </label>
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="…or paste image URL / path"
            className={`${input} max-w-xs flex-1`}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImage(urlInput);
                setUrlInput("");
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              addImage(urlInput);
              setUrlInput("");
            }}
            className="inline-flex h-10 items-center rounded-[var(--radius)] border border-line px-4 text-sm font-semibold text-ink-soft transition-colors hover:border-forest/30 cursor-pointer"
          >
            Add
          </button>
        </div>
      </Field>

      <div className="flex flex-wrap gap-6">
        <Checkbox name="vaccinated" label="Vaccinated" defaultChecked={listing?.vaccinated} />
        <Checkbox name="negotiable" label="Price negotiable" defaultChecked={listing?.negotiable} />
        <Checkbox name="featured" label="Featured (top of marketplace)" defaultChecked={listing?.featured} />
      </div>

      {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}

      <div className="flex gap-3 border-t border-line pt-5">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius)] bg-forest px-6 font-semibold text-white shadow-[var(--shadow-md)] transition-[background-color,transform] duration-200 hover:bg-forest-deep active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {pending ? "Saving…" : listing ? "Save changes" : "Publish animal"}
        </button>
        <Link
          href="/admin/listings"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius)] border border-line px-6 font-semibold text-ink-soft transition-colors hover:border-forest/30"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  full,
  children,
}: {
  label: string;
  hint?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-soft">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[var(--color-forest)]" />
      {label}
    </label>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
