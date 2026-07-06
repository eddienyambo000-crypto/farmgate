"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { ContentResult } from "@/lib/actions/content";
import type { GuideRow } from "@/lib/data/admin-repo";

type Action = (
  prev: ContentResult | undefined,
  fd: FormData,
) => Promise<ContentResult>;

const inp =
  "w-full rounded-[var(--radius)] border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-muted hover:border-forest/30 focus-visible:border-forest";

export function GuideForm({
  action,
  guide,
}: {
  action: Action;
  guide?: GuideRow;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [cover, setCover] = useState(guide?.coverImage ?? "");

  return (
    <form
      action={formAction}
      className="max-w-3xl space-y-5 rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-sm)]"
    >
      <input type="hidden" name="coverImage" value={cover} />

      <Field label="Title">
        <input name="title" required defaultValue={guide?.title} placeholder="How to Buy a Healthy Dairy Cow in Rwanda" className={inp} />
      </Field>

      <Field label="Excerpt (shown on cards & search)">
        <textarea name="excerpt" rows={2} defaultValue={guide?.excerpt} placeholder="A one-line summary…" className={`${inp} resize-none`} />
      </Field>

      <Field label="Cover image">
        <ImageUploader
          bucket="fg-listings"
          single
          value={cover ? [cover] : []}
          onChange={(urls) => setCover(urls[0] ?? "")}
        />
      </Field>

      <Field label="Body (Markdown — use ## for headings, - for lists, [text](/link) for links)">
        <textarea name="body" rows={16} defaultValue={guide?.body} placeholder={"Write your guide here…\n\n## A heading\n\n- a point\n- another point"} className={`${inp} resize-y font-mono text-sm leading-relaxed`} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Author">
          <input name="author" defaultValue={guide?.author ?? "Farmgate"} className={inp} />
        </Field>
        <Field label="Read time (mins)">
          <input name="readMins" type="number" min="1" defaultValue={guide?.readMins ?? 4} className={inp} />
        </Field>
        <Field label="Tags (comma separated)">
          <input name="tags" defaultValue={guide?.tags.join(", ")} placeholder="cattle, dairy" className={inp} />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink-soft">
        <input type="checkbox" name="published" defaultChecked={guide?.published ?? false} className="h-4 w-4 accent-[var(--color-forest)]" />
        Published (visible on the site)
      </label>

      {state?.ok === false && <p className="text-sm font-medium text-danger">{state.error}</p>}

      <div className="flex gap-3 border-t border-line pt-5">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center rounded-[var(--radius)] bg-forest px-6 font-semibold text-white shadow-[var(--shadow-md)] transition-[background-color,transform] hover:bg-forest-deep active:scale-[0.99] disabled:opacity-60 cursor-pointer"
        >
          {pending ? "Saving…" : guide ? "Save guide" : "Publish guide"}
        </button>
        <Link href="/admin/guides" className="inline-flex h-11 items-center rounded-[var(--radius)] border border-line px-6 font-semibold text-ink-soft hover:border-forest/30">
          Cancel
        </Link>
      </div>
    </form>
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
