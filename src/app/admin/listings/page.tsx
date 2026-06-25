import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { listAllListings } from "@/lib/data/admin-repo";
import {
  deleteListingAction,
  toggleFeaturedAction,
  setStatusAction,
} from "@/lib/actions/admin";
import { DeleteButton, MiniForm, StatusSelect } from "@/components/admin/controls";
import { formatRwf } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Manage Listings",
  robots: { index: false, follow: false },
};

const STATUS_OPTS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "sold", label: "Sold" },
  { value: "rejected", label: "Rejected" },
];

export default async function AdminListings() {
  if (!(await isAdmin())) redirect("/admin/login");
  const listings = await listAllListings();

  return (
    <AdminShell
      active="/admin/listings"
      title="Listings"
      action={
        <ButtonLink href="/admin/listings/new" size="sm">
          + Add animal
        </ButtonLink>
      }
    >
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 font-semibold">Animal</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Keeper</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Featured</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/animals/${l.slug}`}
                    target="_blank"
                    className="font-medium text-ink hover:text-forest-deep"
                  >
                    {l.title}
                  </Link>
                  <p className="text-xs capitalize text-ink-muted">
                    {l.animalType} · {l.district}
                  </p>
                </td>
                <td className="px-4 py-3 text-ink-soft">{formatRwf(l.priceRwf)}</td>
                <td className="px-4 py-3 text-ink-soft">{l.seller.displayName}</td>
                <td className="px-4 py-3">
                  <StatusSelect
                    action={setStatusAction}
                    id={l.id}
                    current={l.status}
                    options={STATUS_OPTS}
                  />
                </td>
                <td className="px-4 py-3">
                  <MiniForm
                    action={toggleFeaturedAction}
                    fields={{ id: l.id }}
                    label={l.featured ? "★ Featured" : "☆ Feature"}
                    tone={l.featured ? "gold" : "neutral"}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/listings/${l.id}/edit`}
                      className="rounded-md px-2.5 py-1 text-xs font-semibold text-forest-deep transition-colors hover:bg-leaf-tint/60"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      action={deleteListingAction}
                      id={l.id}
                      confirm={`Delete "${l.title}"? This cannot be undone.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-muted">
                  No listings yet. Add your first animal.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
