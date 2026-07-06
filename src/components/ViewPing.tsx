"use client";

import { useEffect, useRef } from "react";
import { pingView } from "@/lib/actions/views";

/** Counts a real listing view once per mount (fire-and-forget). */
export function ViewPing({ listingId }: { listingId: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    void pingView(listingId);
  }, [listingId]);
  return null;
}
