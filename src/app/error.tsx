"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced to the console (and any error monitor) without crashing the app.
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center bg-grain px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-5xl font-extrabold text-leaf">Oops</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">
          Something went wrong
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-ink-soft">
          A hiccup on our side — please try again. If it keeps happening, contact
          us on WhatsApp and we&apos;ll sort it out.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex h-11 items-center rounded-[var(--radius)] bg-forest px-6 font-semibold text-white shadow-[var(--shadow-md)] transition-colors hover:bg-forest-deep cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-[var(--radius)] border border-line px-6 font-semibold text-ink-soft transition-colors hover:border-forest/30"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
