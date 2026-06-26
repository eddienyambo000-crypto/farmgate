import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { listAllListings, listSellers } from "@/lib/data/admin-repo";
import { toggleFeaturedAction, verifySellerAction } from "@/lib/actions/admin";
import { MiniForm } from "@/components/admin/controls";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { formatRwf } from "@/lib/format";

export const metadata: Metadata = {
  title: "Promotions",
  robots: { index: false, follow: false },
};

export default async function AdminPromotions() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [listings, sellers] = await Promise.all([listAllListings(), listSellers()]);
  const featured = listings.filter((l) => l.featured);
  const notFeatured = listings.filter((l) => !l.featured && l.status === "active");

  return (
    <AdminShell active="/admin/promotions" title="Promotions & featured">
      <p className="mb-6 max-w-2xl text-sm text-ink-soft">
        Featured animals appear first across the marketplace — your premium slot to
        sell to keepers. The verified badge builds buyer trust.
      </p>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">
          Featured now ({featured.length})
        </h2>
        {featured.length === 0 ? (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-line bg-surface p-6 text-sm text-ink-muted">
            Nothing featured yet. Promote an animal below.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {featured.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-[var(--radius)] border border-gold/40 bg-gold-tint/30 p-4">
                <div>
                  <p className="font-medium text-ink">{l.title}</p>
                  <p className="text-xs text-ink-muted">{formatRwf(l.priceRwf)} · {l.seller.displayName}</p>
                </div>
                <MiniForm action={toggleFeaturedAction} fields={{ id: l.id }} label="★ Unfeature" tone="gold" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Feature an animal</h2>
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)]">
          <table className="w-full text-left text-sm">
            <tbody>
              {notFeatured.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{l.title}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatRwf(l.priceRwf)}</td>
                  <td className="px-4 py-3 text-ink-soft">{l.seller.displayName}</td>
                  <td className="px-4 py-3 text-right">
                    <MiniForm action={toggleFeaturedAction} fields={{ id: l.id }} label="☆ Feature" tone="forest" />
                  </td>
                </tr>
              ))}
              {notFeatured.length === 0 && (
                <tr><td className="px-4 py-8 text-center text-ink-muted">No more active animals to feature.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Verified keepers</h2>
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)]">
          <table className="w-full text-left text-sm">
            <tbody>
              {sellers.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{s.displayName}</td>
                  <td className="px-4 py-3 text-ink-soft">{s.district}</td>
                  <td className="px-4 py-3">{s.verified ? <VerifiedBadge /> : <span className="text-xs text-ink-muted">Not verified</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <MiniForm
                      action={verifySellerAction}
                      fields={{ id: s.id, verified: String(!s.verified) }}
                      label={s.verified ? "Remove badge" : "Verify"}
                      tone={s.verified ? "neutral" : "gold"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
