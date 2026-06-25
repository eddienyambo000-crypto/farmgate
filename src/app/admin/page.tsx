import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  listInquiries,
  listApplications,
  listAllListings,
  listSellers,
} from "@/lib/data/admin-repo";
import { formatDate } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminOverview() {
  if (!(await isAdmin())) redirect("/admin/login");

  const [leads, applications, listings, sellers] = await Promise.all([
    listInquiries(),
    listApplications(),
    listAllListings(),
    listSellers(),
  ]);

  const stats = [
    ["New leads", leads.filter((l) => l.status === "new").length, "/admin/leads"],
    ["Applications", applications.length, "/admin/keepers"],
    ["Active listings", listings.filter((l) => l.status === "active").length, "/admin/listings"],
    ["Verified keepers", sellers.filter((s) => s.verified).length, "/admin/keepers"],
  ] as const;

  return (
    <AdminShell
      active="/admin"
      title="Overview"
      action={
        <ButtonLink href="/admin/listings/new" size="sm">
          + Add animal
        </ButtonLink>
      }
    >
      {!isSupabaseConfigured() && (
        <div className="mb-6 rounded-[var(--radius)] border border-gold/40 bg-gold-tint/50 p-4 text-sm text-gold-deep">
          <strong>Demo mode.</strong> Supabase isn&apos;t connected, so changes you
          make here are live for this session but reset when the server restarts.
          Add Supabase keys to persist everything permanently.
        </div>
      )}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value, href]) => (
          <Link
            key={label}
            href={href}
            className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
          >
            <p className="font-display text-3xl font-extrabold text-forest-deep">
              {value}
            </p>
            <p className="mt-1 text-sm text-ink-muted">{label}</p>
          </Link>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card title="Latest leads" href="/admin/leads" linkLabel="Manage leads">
          {leads.length === 0 ? (
            <Empty>No buyer leads yet.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {leads.slice(0, 5).map((l) => (
                <li key={l.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-ink">{l.buyerName}</p>
                    <p className="text-sm text-ink-muted">
                      {l.listingTitle} · {l.buyerDistrict}
                    </p>
                  </div>
                  <span className="text-xs text-ink-muted">
                    {formatDate(l.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Keeper applications"
          href="/admin/keepers"
          linkLabel="Review applications"
        >
          {applications.length === 0 ? (
            <Empty>No applications yet.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {applications.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-ink">{a.fullName}</p>
                    <p className="text-sm capitalize text-ink-muted">
                      {a.animalType} · {a.district}
                    </p>
                  </div>
                  <span className="text-xs text-ink-muted">
                    {formatDate(a.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}

function Card({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-forest-deep hover:text-forest">
          {linkLabel} →
        </Link>
      </div>
      <div className="px-5 py-2">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-center text-sm text-ink-muted">{children}</p>;
}
