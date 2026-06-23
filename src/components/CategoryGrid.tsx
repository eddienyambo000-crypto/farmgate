import Link from "next/link";
import { CATEGORY_LIST } from "@/lib/categories";
import type { AnimalType } from "@/lib/types";

const ART: Record<AnimalType, string> = {
  cattle: "M4 9c0-1 1-2 2-2 .5-2 2-3 6-3s5.5 1 6 3c1 0 2 1 2 2 0 1.2-1 2-1 2v3a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-3s-1-.8-1-2Z M9 8.5h.01M15 8.5h.01",
  goat: "M5 6c-1 0-2 1-2 3 0 1 .5 2 1.5 2.5M19 6c1 0 2 1 2 3 0 1-.5 2-1.5 2.5M7 9c0 5 2 9 5 9s5-4 5-9c0-2-2-3-5-3S7 7 7 9Z M10 11h.01M14 11h.01",
  sheep: "M7 9a3 3 0 0 1 0-2 3 3 0 0 1 3-2 3 3 0 0 1 4 0 3 3 0 0 1 3 2 3 3 0 0 1 0 2 3 3 0 0 1-1 5 3 3 0 0 1-3 2 3 3 0 0 1-4 0 3 3 0 0 1-3-2 3 3 0 0 1 1-5Z M10 11h.01M14 11h.01",
  pig: "M5 8c-1 0-2 1-2 3a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4c0-2-1-3-2-3M8 8 6 6M16 8l2-2 M10 13h4 M10.5 13v.01M13.5 13v.01 M9 10h.01M15 10h.01",
  chicken: "M9 4c1.5 0 2.5 1 2.5 2.5 2 .5 3.5 2.5 3.5 5 0 3.5-2.5 6.5-5 6.5s-5-2-5-5.5c0-1.5.5-2.5 1.5-3.5M9 4 7.5 2.5M9 4l1.5-1.5 M11.5 9h.01 M15 11l3-1",
  rabbit: "M9 13c-2 0-3.5 1.5-3.5 3.5S7 20 9 20h6c2 0 3.5-1.5 3.5-3.5S17 13 15 13M8 13C7 11 6.5 7 8 4c1 1.5 1.5 4 1.5 6M16 13c1-2 1.5-6 0-9-1 1.5-1.5 4-1.5 6 M10.5 16h.01M13.5 16h.01",
};

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {CATEGORY_LIST.map((c) => (
        <Link
          key={c.type}
          href={`/animals?type=${c.type}`}
          className="group flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-line bg-surface p-5 text-center shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out)] hover:-translate-y-1 hover:border-forest/40 hover:shadow-[var(--shadow-md)]"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-leaf-tint text-forest-deep transition-colors duration-300 group-hover:bg-forest group-hover:text-white">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d={ART[c.type]} />
            </svg>
          </span>
          <span className="font-display text-base font-bold text-ink">
            {c.label}
          </span>
          <span className="-mt-2 text-xs text-ink-muted">{c.labelRw}</span>
        </Link>
      ))}
    </div>
  );
}
