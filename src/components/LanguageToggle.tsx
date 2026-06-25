"use client";

import { useI18n } from "@/lib/i18n";
import { LANGS } from "@/lib/i18n/dictionary";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center rounded-full border border-line bg-white/70 p-0.5 text-xs font-semibold ${className}`}
    >
      {LANGS.map((l) => {
        const active = lang === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={active}
            className={`cursor-pointer rounded-full px-2.5 py-1 uppercase tracking-wide transition-colors ${
              active
                ? "bg-forest text-white"
                : "text-ink-muted hover:text-forest-deep"
            }`}
          >
            {l.code}
          </button>
        );
      })}
    </div>
  );
}
