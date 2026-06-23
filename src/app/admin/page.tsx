import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/admin-auth";
import { listInquiries } from "@/lib/data/inquiries-store";
import { listApplications } from "@/lib/data/applications-store";
import { getListings } from "@/lib/data/listings";
import { SELLERS } from "@/lib/data/seed";
import { formatRwf, formatDate } from "@/lib/format";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const [leads, applications, listings] = [
    listInquiries(),
    listApplications(),
    await getListings(),
  ];
  const sellers = Object.values(SELLERS);

  const stats = [
    ["New leads", leads.filter((l) => l.status === "new").length],
    ["Keeper applications", applications.length],
    ["Active listings", listings.length],
    ["Verified keepers", sellers.filter((s) => s.verified).length],
  ] as const;

  return (
    <div className="bg-background">
      <header className="border-b border-line bg-surface">
        <div className="container-page flex items-center justify-between py-5">
          <div>
            <p className="font-display text-xl font-extrabold text-forest-deep">
              FarmGate Admin
            </p>
            <p className="text-sm text-ink-muted">
              Manage leads, applications and listings.
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-[var(--radius)] border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-forest/30 hover:text-forest-deep cursor-pointer"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="container-page space-y-10 py-8">
        {!isSupabaseConfigured() && (
          <div className="rounded-[var(--radius)] border border-gold/40 bg-gold-tint/50 p-4 text-sm text-gold-deep">
            <strong>Demo mode.</strong> Supabase isn&apos;t connected yet, so leads
            and applications are stored in memory for this session only. Add your
            Supabase keys to persist data and enable listing management. See{" "}
            <code>supabase/schema.sql</code>.
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]"
            >
              <p className="font-display text-3xl font-extrabold text-forest-deep">
                {value}
              </p>
              <p className="mt-1 text-sm text-ink-muted">{label}</p>
            </div>
          ))}
        </section>

        {/* Leads — the captured buyers */}
        <Panel
          title="Buyer leads"
          subtitle="Every buyer who requested an animal. Contact them and route the deal."
        >
          {leads.length === 0 ? (
            <Empty>No leads yet. They appear here when a buyer submits a request.</Empty>
          ) : (
            <Table head={["Buyer", "Phone", "District", "Animal", "When"]}>
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-line">
                  <Td>
                    <span className="font-medium text-ink">{l.buyerName}</span>
                  </Td>
                  <Td>
                    <a
                      href={`https://wa.me/${l.buyerPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest-deep underline"
                    >
                      {l.buyerPhone}
                    </a>
                  </Td>
                  <Td>{l.buyerDistrict}</Td>
                  <Td>{l.listingTitle}</Td>
                  <Td>{formatDate(l.createdAt)}</Td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>

        {/* Keeper applications */}
        <Panel
          title="Keeper applications"
          subtitle="New keepers wanting to list. Verify them, then publish their animals."
        >
          {applications.length === 0 ? (
            <Empty>No applications yet.</Empty>
          ) : (
            <Table head={["Keeper", "Phone", "District", "Keeps", "Count", "When"]}>
              {applications.map((a) => (
                <tr key={a.id} className="border-t border-line">
                  <Td>
                    <span className="font-medium text-ink">{a.fullName}</span>
                  </Td>
                  <Td>
                    <a
                      href={`https://wa.me/${a.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest-deep underline"
                    >
                      {a.phone}
                    </a>
                  </Td>
                  <Td>{a.district}</Td>
                  <Td className="capitalize">{a.animalType}</Td>
                  <Td>{a.animalCount || "—"}</Td>
                  <Td>{formatDate(a.createdAt)}</Td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>

        {/* Listings overview */}
        <Panel
          title="Listings"
          subtitle="All animals currently on the marketplace."
        >
          <Table head={["Animal", "Type", "Price", "Keeper", "District", "Status"]}>
            {listings.map((l) => (
              <tr key={l.id} className="border-t border-line">
                <Td>
                  <span className="font-medium text-ink">{l.title}</span>
                  {l.featured && (
                    <span className="ml-2 rounded-full bg-gold-tint px-2 py-0.5 text-xs font-semibold text-gold-deep">
                      Featured
                    </span>
                  )}
                </Td>
                <Td className="capitalize">{l.animalType}</Td>
                <Td>{formatRwf(l.priceRwf)}</Td>
                <Td>{l.seller.displayName}</Td>
                <Td>{l.district}</Td>
                <Td>
                  <span className="inline-flex rounded-full bg-leaf-tint px-2.5 py-0.5 text-xs font-semibold capitalize text-forest-deep">
                    {l.status}
                  </span>
                </Td>
              </tr>
            ))}
          </Table>
        </Panel>

        {/* Keepers */}
        <Panel title="Keepers" subtitle="Sellers on the platform.">
          <Table head={["Keeper", "District", "Listings", "Member since", "Status"]}>
            {sellers.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <Td>
                  <span className="font-medium text-ink">{s.displayName}</span>
                </Td>
                <Td>{s.district}</Td>
                <Td>{s.totalListings}</Td>
                <Td>{s.memberSince}</Td>
                <Td>
                  {s.verified ? (
                    <VerifiedBadge />
                  ) : (
                    <span className="text-xs text-ink-muted">Pending</span>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)]">
      <div className="border-b border-line px-5 py-4">
        <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
        <p className="text-sm text-ink-muted">{subtitle}</p>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function Table({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="text-xs uppercase tracking-wide text-ink-muted">
          {head.map((h) => (
            <th key={h} className="px-5 py-3 font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-5 py-3 text-ink-soft ${className}`}>{children}</td>;
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-10 text-center text-sm text-ink-muted">{children}</div>
  );
}
