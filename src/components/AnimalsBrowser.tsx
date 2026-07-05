"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/ListingCard";
import { CATEGORY_LIST, CATEGORIES } from "@/lib/categories";
import { ANIMAL_TYPES, type AnimalType, type PublicListing } from "@/lib/types";
import { ChevronDownIcon, SearchIcon } from "@/components/icons";

type Sort = "newest" | "price-asc" | "price-desc";

// Everyday words buyers actually type, mapped to each animal type.
const SYNONYMS: Record<AnimalType, string> = {
  cattle: "cow cows bull bulls calf heifer dairy beef inka",
  goat: "goats kid buck doe ihene",
  sheep: "lamb lambs mutton ram ewe intama",
  pig: "pigs swine pork piglet sow boar ingurube",
  chicken: "chickens hen hens broiler broilers layer layers poultry chick inkoko",
  rabbit: "rabbits bunny doe buck kit urukwavu",
};

/**
 * Client-side marketplace browser. The server sends ALL active listings (good
 * for SEO + a single source of truth); filtering happens instantly in the
 * browser. This removes the router-cache desync that made the dropdown and the
 * results disagree ("shows nothing but it's actually there").
 */
export function AnimalsBrowser({
  listings,
  districts,
}: {
  listings: PublicListing[];
  districts: string[];
}) {
  const params = useSearchParams();
  const initialType = ANIMAL_TYPES.includes(params.get("type") as AnimalType)
    ? (params.get("type") as AnimalType)
    : "";

  const [type, setType] = useState<AnimalType | "">(initialType);
  const [district, setDistrict] = useState(params.get("district") ?? "");
  const [sort, setSort] = useState<Sort>((params.get("sort") as Sort) || "newest");
  const [search, setSearch] = useState(params.get("search") ?? "");

  // Keep the URL shareable without a server round-trip (no cache desync).
  useEffect(() => {
    const p = new URLSearchParams();
    if (type) p.set("type", type);
    if (district) p.set("district", district);
    if (search.trim()) p.set("search", search.trim());
    if (sort !== "newest") p.set("sort", sort);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `/animals?${qs}` : "/animals");
  }, [type, district, search, sort]);

  const filtered = useMemo(() => {
    let rows = listings.slice();
    if (type) rows = rows.filter((l) => l.animalType === type);
    if (district)
      rows = rows.filter(
        (l) => l.district.toLowerCase() === district.toLowerCase(),
      );
    const q = search.toLowerCase().trim();
    if (q) {
      // Also match the singular form so "goats" finds a "goat", "cows" a "cow".
      const qSingular = q.replace(/s$/, "");
      rows = rows.filter((l) => {
        const cat = CATEGORIES[l.animalType];
        const hay = [
          l.title,
          l.breed,
          l.district,
          l.sector,
          l.animalType,
          l.purpose,
          cat.label,
          cat.plural,
          cat.labelRw,
          SYNONYMS[l.animalType],
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q) || (qSingular.length > 1 && hay.includes(qSingular));
      });
    }

    if (sort === "price-asc") rows.sort((a, b) => a.priceRwf - b.priceRwf);
    else if (sort === "price-desc") rows.sort((a, b) => b.priceRwf - a.priceRwf);
    else rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    return rows.sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [listings, type, district, sort, search]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative flex min-w-[220px] flex-1 items-center sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-ink-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search animals, breed, district…"
            aria-label="Search animals"
            className="w-full rounded-[var(--radius)] border border-line bg-surface py-2.5 pl-9 pr-3 text-ink outline-none transition-colors placeholder:text-ink-muted hover:border-forest/40 focus-visible:border-forest"
          />
        </label>

        <Select label="Animal type" value={type} onChange={(v) => setType(v as AnimalType | "")}
          options={[{ value: "", label: "All animals" }, ...CATEGORY_LIST.map((c) => ({ value: c.type, label: c.plural }))]} />
        <Select label="District" value={district} onChange={setDistrict}
          options={[{ value: "", label: "All districts" }, ...districts.map((d) => ({ value: d, label: d }))]} />
        <Select label="Sort" value={sort} onChange={(v) => setSort(v as Sort)}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "price-asc", label: "Price: low to high" },
            { value: "price-desc", label: "Price: high to low" },
          ]} />
      </div>

      <p className="mt-6 text-sm text-ink-muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "animal" : "animals"} available
      </p>

      {filtered.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[var(--radius-lg)] border border-dashed border-line bg-surface p-12 text-center">
          <p className="font-display text-xl font-bold text-ink">
            No animals match your search
          </p>
          <p className="mt-2 text-ink-soft">
            Try a different animal type or district — new animals are listed every
            week.
          </p>
          {(type || district || search) && (
            <button
              onClick={() => {
                setType("");
                setDistrict("");
                setSearch("");
              }}
              className="mt-5 rounded-[var(--radius)] border border-line px-4 py-2 text-sm font-semibold text-forest-deep transition-colors hover:border-forest/40 cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </>
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
