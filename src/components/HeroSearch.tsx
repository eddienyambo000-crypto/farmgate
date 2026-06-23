"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "./icons";

const POPULAR = ["Dairy cow", "Goat", "Broilers", "Piglet", "Rabbit"];

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(term: string) {
    const value = term.trim();
    router.push(value ? `/animals?search=${encodeURIComponent(value)}` : "/animals");
  }

  return (
    <div className="w-full max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
        role="search"
        className="flex items-center gap-2 rounded-[var(--radius-xl)] border border-line bg-surface p-2 shadow-[var(--shadow-lg)]"
      >
        <span className="pl-3 text-ink-muted">
          <SearchIcon className="h-5 w-5" />
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search cattle, goats, pigs, chickens…"
          aria-label="Search animals"
          className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-ink-muted"
        />
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-lg)] bg-forest px-5 font-semibold text-white shadow-[var(--shadow-md)] transition-[background-color,transform] duration-200 hover:bg-forest-deep active:scale-95 cursor-pointer"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-soft/80">Popular:</span>
        {POPULAR.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => submit(term)}
            className="rounded-full border border-forest/20 bg-white/60 px-3 py-1 text-sm text-forest-deep transition-colors duration-200 hover:border-forest hover:bg-white cursor-pointer"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
