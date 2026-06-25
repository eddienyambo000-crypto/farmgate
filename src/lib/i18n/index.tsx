"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import { translate, type DictKey, type Lang } from "./dictionary";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
  /** Pick a content field by language, falling back to English. */
  tc: (en: string | null | undefined, rw: string | null | undefined) => string;
}

const Ctx = createContext<LangCtx | null>(null);
const COOKIE = "fg_lang";
const EVENT = "fg-lang-change";

// External store so we read the language from the cookie without a
// setState-in-effect (hydration-safe: server + first client render use "en").
function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
function getSnapshot(): Lang {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=(en|rw)`));
  return (m?.[1] as Lang) ?? "en";
}
function getServerSnapshot(): Lang {
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLang = useCallback((l: Lang) => {
    document.cookie = `${COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    document.documentElement.lang = l;
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const t = useCallback((key: DictKey) => translate(key, lang), [lang]);
  const tc = useCallback(
    (en: string | null | undefined, rw: string | null | undefined) =>
      (lang === "rw" ? rw || en : en) ?? "",
    [lang],
  );

  return <Ctx.Provider value={{ lang, setLang, t, tc }}>{children}</Ctx.Provider>;
}

export function useI18n(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
