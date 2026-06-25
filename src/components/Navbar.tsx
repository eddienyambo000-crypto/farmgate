"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ButtonLink } from "./ui/Button";
import { MenuIcon, XIcon } from "./icons";
import { LanguageToggle } from "./LanguageToggle";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n/dictionary";

const NAV: { href: string; key: DictKey }[] = [
  { href: "/animals", key: "nav.browse" },
  { href: "/how-it-works", key: "nav.how" },
  { href: "/sell", key: "nav.sell" },
  { href: "/guides", key: "nav.guides" },
  { href: "/about", key: "nav.about" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide the public header in the admin panel.
  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? "border-b border-line/70 bg-cream/90 shadow-[var(--shadow-sm)] backdrop-blur-md"
          : "border-b border-transparent bg-cream/40 backdrop-blur-sm"
      }`}
    >
      <nav
        className={`container-page flex items-center justify-between gap-4 transition-[height] duration-300 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-forest-deep"
          onClick={() => setOpen(false)}
        >
          <Logo />
          <span>
            Farmgate <span className="text-gold-deep">Rwanda</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`rounded-[var(--radius-sm)] px-3.5 py-2 text-[0.95rem] font-medium transition-colors duration-200 ${
                    active
                      ? "bg-leaf-tint/70 text-forest-deep"
                      : "text-ink-soft hover:bg-leaf-tint/50 hover:text-forest-deep"
                  }`}
                >
                  {t(item.key)}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <ButtonLink href="/find" size="sm">
            {t("cta.findAnimal")}
          </ButtonLink>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-forest-deep transition-colors hover:bg-leaf-tint/60"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-line/70 bg-cream lg:hidden">
          <ul className="container-page flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-[var(--radius-sm)] px-3 py-2.5 font-medium text-ink-soft hover:bg-leaf-tint/50 hover:text-forest-deep"
                  onClick={() => setOpen(false)}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <ButtonLink href="/find" className="w-full" onClick={() => setOpen(false)}>
                {t("cta.findAnimal")}
              </ButtonLink>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

function Logo() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] bg-forest text-white shadow-[var(--shadow-sm)]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 11.5 12 4l9 7.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v9h14v-9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 19v-4h4v4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
