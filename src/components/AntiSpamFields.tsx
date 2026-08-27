"use client";

import { useState } from "react";
import { SPAM_FIELDS } from "@/lib/anti-spam";

/**
 * Invisible anti-spam fields for public forms. Drop inside any <form>; read the
 * values back with readSpamSignals(formData) in the submit handler.
 *
 * The honeypot is positioned off-screen (not display:none, which sophisticated
 * bots skip) and hidden from a11y + tab order so no real user ever fills it.
 * The mount timestamp is stamped once when the form renders in the browser.
 */
export function AntiSpamFields() {
  const [mountedAt] = useState(() => String(Date.now()));
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        width: 1,
        height: 1,
        overflow: "hidden",
      }}
    >
      <label htmlFor={SPAM_FIELDS.honeypot}>Leave this field empty</label>
      <input
        id={SPAM_FIELDS.honeypot}
        name={SPAM_FIELDS.honeypot}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
      <input type="hidden" name={SPAM_FIELDS.mountedAt} value={mountedAt} readOnly />
    </div>
  );
}

/** Extract the honeypot + elapsed-time signals from a submitted form. */
export function readSpamSignals(formData: FormData): {
  honeypot: string;
  elapsedMs?: number;
} {
  const honeypot = String(formData.get(SPAM_FIELDS.honeypot) ?? "");
  const t = Number(formData.get(SPAM_FIELDS.mountedAt) ?? 0);
  return { honeypot, elapsedMs: t > 0 ? Date.now() - t : undefined };
}
