"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { PublicListing } from "@/lib/types";
import { useCategories } from "@/lib/categories-context";
import type { ActionResult } from "@/lib/actions/admin";
import { ImageUploader } from "@/components/admin/ImageUploader";

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
  const categories = useCategories();
  const [state, formAction, pending] = useActionState(action, undefined);
  const [images, setImages] = useState<string[]>(listing?.images ?? []);
  const [newKeeper, setNewKeeper] = useState(sellers.length === 0);
  const [newCat, setNewCat] = useState(categories.length === 0);
  const error = state?.ok === false ? state.error : null;

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
          {!newCat ? (
            <div className="flex gap-2">
              <select
                name="animalType"
                defaultValue={listing?.animalType ?? categories[0]?.type ?? "cattle"}
                className={`${input} flex-1`}
              >
                {categories.map((c) => (
                  <option key={c.type} value={c.type}>{c.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setNewCat(true)}
                className="inline-flex h-11 shrink-0 items-center rounded-[var(--radius)] border border-forest/30 bg-white px-3 text-sm font-semibold text-forest-deep transition-colors hover:border-forest cursor-pointer"
              >
                + New
              </button>
            </div>
          ) : (
            <div>
              <input name="animalType" required placeholder="New animal (e.g. Turkey)" className={input} />
              {categories.length > 0 && (
                <button
                  type="button"
                  onClick={() => setNewCat(false)}
                  className="mt-1.5 text-xs font-medium text-forest-deep hover:underline cursor-pointer"
                >
                  ← Choose an existing type
                </button>
              )}
            </div>
          )}
        </Field>
        <Field label="Keeper (animal owner)" full>
          {!newKeeper ? (
            <div className="flex flex-wrap items-center gap-2">
              <select name="sellerId" defaultValue={sellerId} className={`${input} flex-1`}>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>{s.displayName}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setNewKeeper(true)}
                className="inline-flex h-11 shrink-0 items-center rounded-[var(--radius)] border border-forest/30 bg-white px-4 text-sm font-semibold text-forest-deep transition-colors hover:border-forest cursor-pointer"
              >
                + New keeper
              </button>
            </div>
          ) : (
            <div className="rounded-[var(--radius)] border border-forest/20 bg-leaf-tint/25 p-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <input name="newKeeperName" required placeholder="Keeper name *" className={input} />
                <input name="newKeeperPhone" placeholder="WhatsApp / phone" className={input} />
                <input name="newKeeperDistrict" placeholder="District" className={input} />
              </div>
              {sellers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setNewKeeper(false)}
                  className="mt-2 text-sm font-medium text-forest-deep hover:underline cursor-pointer"
                >
                  ← Choose an existing keeper instead
                </button>
              )}
            </div>
          )}
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

      <Field label="Photos" full>
        <input type="hidden" name="images" value={images.join("\n")} />
        <ImageUploader bucket="fg-listings" value={images} onChange={setImages} />
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
