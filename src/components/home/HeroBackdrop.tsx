"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Decorative animated hero backdrop: soft drifting orbs over a radial wash and
 * a faint grid. Purely cosmetic (aria-hidden); motion disabled under
 * prefers-reduced-motion.
 */
export function HeroBackdrop() {
  const reduce = useReducedMotion();
  const float = (dx: number, dy: number, d: number) =>
    reduce
      ? {}
      : {
          animate: { x: [0, dx, 0], y: [0, dy, 0] },
          transition: {
            duration: d,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 12% 0%, #e8f3ec 0%, #faf7f1 46%, #f3ede2 100%)",
        }}
      />
      <div className="absolute inset-0 bg-grain opacity-60" />
      <motion.div
        {...float(40, 30, 14)}
        className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-leaf/30 blur-3xl"
      />
      <motion.div
        {...float(-50, 40, 18)}
        className="absolute right-[-4rem] top-1/3 h-80 w-80 rounded-full bg-gold/20 blur-3xl"
      />
      <motion.div
        {...float(30, -40, 16)}
        className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-forest/15 blur-3xl"
      />
    </div>
  );
}
