import Link from "next/link";
import { logoutAction } from "@/lib/actions/admin-auth";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/keepers", label: "Keepers" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/guides", label: "Guides" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({
  active,
  title,
  action,
  children,
}: {
  active: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-line bg-surface">
        <div className="container-page flex items-center justify-between py-4">
          <Link
            href="/admin"
            className="font-display text-xl font-extrabold text-forest-deep"
          >
            Farmgate Admin
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden text-sm font-medium text-ink-soft hover:text-forest-deep sm:block"
            >
              View site ↗
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-[var(--radius)] border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-forest/30 hover:text-forest-deep cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="container-page flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const on = active === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  on
                    ? "border-forest text-forest-deep"
                    : "border-transparent text-ink-muted hover:text-ink-soft"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="container-page py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-extrabold text-ink">
            {title}
          </h1>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}
