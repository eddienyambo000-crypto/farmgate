"use client";

import { useRef } from "react";

type Action = (fd: FormData) => Promise<void>;

/** A delete button that confirms before submitting to a server action. */
export function DeleteButton({
  action,
  id,
  label = "Delete",
  confirm = "Are you sure? This cannot be undone.",
}: {
  action: Action;
  id: string;
  label?: string;
  confirm?: string;
}) {
  return (
    <form action={action} className="inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => {
          if (!window.confirm(confirm)) e.preventDefault();
        }}
        className="rounded-md px-2.5 py-1 text-xs font-semibold text-danger transition-colors hover:bg-danger/10 cursor-pointer"
      >
        {label}
      </button>
    </form>
  );
}

/** A small submit button carrying one or more hidden fields. */
export function MiniForm({
  action,
  fields,
  label,
  tone = "neutral",
}: {
  action: Action;
  fields: Record<string, string>;
  label: string;
  tone?: "neutral" | "gold" | "forest";
}) {
  const tones = {
    neutral: "text-ink-soft hover:bg-line/60",
    gold: "text-gold-deep hover:bg-gold-tint/60",
    forest: "text-forest-deep hover:bg-leaf-tint/60",
  };
  return (
    <form action={action} className="inline">
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${tones[tone]}`}
      >
        {label}
      </button>
    </form>
  );
}

/** A <select> that submits its form on change (status changes). */
export function StatusSelect({
  action,
  id,
  current,
  options,
}: {
  action: Action;
  id: string;
  current: string;
  options: { value: string; label: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form action={action} ref={formRef} className="inline">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={current}
        onChange={() => formRef.current?.requestSubmit()}
        className="cursor-pointer rounded-md border border-line bg-surface px-2 py-1 text-xs font-medium text-ink outline-none hover:border-forest/40 focus-visible:border-forest"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}
