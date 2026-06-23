"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CATEGORY_LIST } from "@/lib/categories";
import { ChevronDownIcon } from "./icons";

export function FilterBar({ districts }: { districts: string[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`/animals?${next.toString()}`, { scroll: false });
    },
    [params, router],
  );

  const type = params.get("type") ?? "";
  const district = params.get("district") ?? "";
  const sort = params.get("sort") ?? "newest";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        label="Animal type"
        value={type}
        onChange={(v) => setParam("type", v)}
        options={[
          { value: "", label: "All animals" },
          ...CATEGORY_LIST.map((c) => ({ value: c.type, label: c.plural })),
        ]}
      />
      <Select
        label="District"
        value={district}
        onChange={(v) => setParam("district", v)}
        options={[
          { value: "", label: "All districts" },
          ...districts.map((d) => ({ value: d, label: d })),
        ]}
      />
      <Select
        label="Sort"
        value={sort}
        onChange={(v) => setParam("sort", v)}
        options={[
          { value: "newest", label: "Newest first" },
          { value: "price-asc", label: "Price: low to high" },
          { value: "price-desc", label: "Price: high to low" },
        ]}
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative inline-flex flex-col gap-1 text-sm">
      <span className="sr-only">{label}</span>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
        <ChevronDownIcon className="h-4 w-4" />
      </span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-[var(--radius)] border border-line bg-surface py-2.5 pl-3.5 pr-10 font-medium text-ink shadow-[var(--shadow-sm)] outline-none transition-colors hover:border-forest/40 focus-visible:border-forest"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
