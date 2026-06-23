import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "gold" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-forest text-white shadow-[var(--shadow-md)] hover:bg-forest-deep active:scale-[0.98]",
  gold: "bg-gold text-forest-dark shadow-[var(--shadow-gold)] hover:bg-gold-deep hover:text-white active:scale-[0.98]",
  outline:
    "border border-forest/30 text-forest-deep bg-white/60 hover:bg-white hover:border-forest active:scale-[0.98]",
  ghost: "text-forest-deep hover:bg-leaf-tint/60 active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-[0.95rem] gap-2",
  lg: "h-13 px-7 text-base gap-2.5 py-3.5",
};

const base =
  "inline-flex items-center justify-center font-semibold rounded-[var(--radius)] cursor-pointer select-none transition-[background-color,transform,border-color,color] duration-200 ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
