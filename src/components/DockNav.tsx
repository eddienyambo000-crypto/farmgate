"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n/dictionary";
import {
  SearchIcon,
  TagIcon,
  HandshakeIcon,
  MapPinIcon,
} from "@/components/icons";

/**
 * Farmgate floating "dock" navigation — a 21st.dev-style glass dock with a
 * gold active-glow that springs between items. Primary nav on mobile (where the
 * top bar collapses); a quick-jump dock on desktop. Adapted from the LumaBar
 * pattern to the Forest/Gold brand and Farmgate routes.
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
    const hit =
      item.match === "/" ? pathname === "/" : pathname.startsWith(item.match);
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

  // Hide the dock inside the admin panel.
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-50 -translate-x-1/2 lg:hidden"
    >
      <div className="relative flex items-center justify-center gap-1 overflow-hidden rounded-full border border-gold/30 bg-forest-dark/80 px-2 py-1.5 shadow-[0_10px_40px_rgba(18,45,34,0.45)] backdrop-blur-2xl">
        <motion.div
          aria-hidden
          className="absolute -z-10 h-12 w-12 rounded-full bg-gradient-to-r from-gold to-gold-deep blur-2xl"
          animate={{
            left: `calc(${active * (100 / items.length)}% + ${100 / items.length / 2}%)`,
            translateX: "-50%",
          }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 500, damping: 30 }
          }
        />
        {items.map((item, i) => {
          const isActive = i === active;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={t(item.label)}
              aria-current={isActive ? "page" : undefined}
              className="group relative flex flex-col items-center justify-center rounded-full px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <motion.span
                whileHover={reduce ? undefined : { scale: 1.15 }}
                whileTap={reduce ? undefined : { scale: 0.92 }}
                animate={{ scale: isActive ? 1.18 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className={`relative z-10 flex h-8 w-8 items-center justify-center transition-colors [&_svg]:h-5 [&_svg]:w-5 ${
                  isActive
                    ? "text-gold drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]"
                    : "text-cream/70 group-hover:text-gold"
                }`}
              >
                {item.icon}
              </motion.span>
              <span
                className={`mt-0.5 text-[9px] font-medium leading-none tracking-wide transition-colors ${
                  isActive ? "text-gold" : "text-cream/50 group-hover:text-cream/80"
                }`}
              >
                {t(item.label)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeGlyph() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}
