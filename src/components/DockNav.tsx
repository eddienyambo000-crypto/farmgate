"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n/dictionary";
import { SearchIcon, TagIcon, HandshakeIcon, MapPinIcon } from "@/components/icons";

/**
 * Farmgate premium "dock" — a floating glass bar with a sliding gold active
 * pill (Apple-style). Shows on every screen size; auto-tucks away when the user
 * reaches the footer so it never covers content.
 */
interface Item {
  href: string;
  label: DictKey;
  match: string;
  icon: React.ReactNode;
}

const items: Item[] = [
  { href: "/", label: "nav.home", match: "/", icon: <HomeGlyph /> },
  { href: "/animals", label: "nav.browse", match: "/animals", icon: <SearchIcon /> },
  { href: "/find", label: "nav.find", match: "/find", icon: <TagIcon /> },
  { href: "/sell", label: "nav.sell", match: "/sell", icon: <HandshakeIcon /> },
  { href: "/guides", label: "nav.guides", match: "/guides", icon: <MapPinIcon /> },
];

function activeIndex(pathname: string): number {
  let best = 0;
  let bestLen = -1;
  items.forEach((item, i) => {
    const hit = item.match === "/" ? pathname === "/" : pathname.startsWith(item.match);
    if (hit && item.match.length > bestLen) {
      best = i;
      bestLen = item.match.length;
    }
  });
  return best;
}

export function DockNav() {
  const pathname = usePathname() || "/";
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const active = activeIndex(pathname);
  const [nearBottom, setNearBottom] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.innerHeight + window.scrollY;
      setNearBottom(scrolled >= document.body.offsetHeight - 140);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.9rem)] z-50 flex justify-center px-4 transition-[opacity,transform] duration-300 ${
        nearBottom ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <nav
        aria-label="Quick navigation"
        aria-hidden={nearBottom}
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-forest-dark/85 p-1.5 shadow-[0_16px_44px_-10px_rgba(18,45,34,0.7)] ring-1 ring-black/5 backdrop-blur-xl"
      >
        {items.map((item, i) => {
          const isActive = i === active;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={t(item.label)}
              aria-current={isActive ? "page" : undefined}
              className="relative flex items-center gap-2 rounded-full px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-gold sm:px-4"
            >
              {isActive && (
                <motion.span
                  layoutId="dock-pill"
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-gold to-gold-deep shadow-[0_2px_10px_rgba(201,168,76,0.5)]"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 34 }}
                />
              )}
              <span
                className={`flex h-5 w-5 items-center justify-center transition-colors [&_svg]:h-5 [&_svg]:w-5 ${
                  isActive ? "text-forest-dark" : "text-cream/70"
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`text-xs font-semibold leading-none tracking-tight transition-colors ${
                  isActive ? "text-forest-dark" : "hidden text-cream/70 sm:inline"
                }`}
              >
                {t(item.label)}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function HomeGlyph() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}
