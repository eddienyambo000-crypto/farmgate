"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ButtonLink } from "./ui/Button";
import { MenuIcon, XIcon } from "./icons";

const NAV = [
  { href: "/animals", label: "Browse Animals" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/sell", label: "Sell Your Animal" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-cream/85 backdrop-blur-md">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-forest-deep"
          onClick={() => setOpen(false)}
        >
          <Logo />
          FarmGate
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
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
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:block">
          <ButtonLink href="/animals" size="sm">
            Find an Animal
          </ButtonLink>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-forest-deep hover:bg-leaf-tint/60 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line/70 bg-cream md:hidden">
          <ul className="container-page flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-[var(--radius-sm)] px-3 py-2.5 font-medium text-ink-soft hover:bg-leaf-tint/50 hover:text-forest-deep"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <ButtonLink
                href="/animals"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Find an Animal
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
        <path
          d="M3 11.5 12 4l9 7.5"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 10v9h14v-9"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 19v-4h4v4"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
