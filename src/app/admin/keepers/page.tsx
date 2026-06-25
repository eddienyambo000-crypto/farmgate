import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { listSellers, listApplications } from "@/lib/data/admin-repo";
import {
  createSellerAction,
  verifySellerAction,
  deleteSellerAction,
  deleteApplicationAction,
} from "@/lib/actions/admin";
import { DeleteButton, MiniForm } from "@/components/admin/controls";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { formatMemberSince } from "@/lib/format";

export const metadata: Metadata = {
  title: "Keepers",
  robots: { index: false, follow: false },
};

const inp =
  "w-full rounded-[var(--radius)] border border-line bg-surface px-3 py-2 text-sm text-ink outline-none hover:border-forest/30 focus-visible:border-forest";

export default async function AdminKeepers() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [sellers, applications] = await Promise.all([
    listSellers(),
    listApplications(),
  ]);

  return (
    <AdminShell active="/admin/keepers" title="Keepers">
      {/* Applications */}
      <section className="mb-10">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">
          Pending applications ({applications.length})
        </h2>
        {applications.length === 0 ? (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-line bg-surface p-8 text-center text-sm text-ink-muted">
            No applications waiting. Keepers who apply via the Sell page show up
            here for you to approve.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {applications.map((a) => (
              <form
                key={a.id}
                action={createSellerAction}
                className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]"
              >
                <div className="mb-3">
                  <p className="font-display font-bold text-ink">{a.fullName}</p>
                  <p className="text-sm capitalize text-ink-muted">
                    {a.animalType}
                    {a.animalCount ? ` · ${a.animalCount}` : ""} · {a.district}
                  </p>
                  {a.details && (
                    <p className="mt-1 text-sm text-ink-soft">“{a.details}”</p>
                  )}
                </div>

                <input type="hidden" name="fullName" value={a.fullName} />
                <input type="hidden" name="phone" value={a.phone} />
                <input type="hidden" name="whatsapp" value={a.phone} />
                <input type="hidden" name="district" value={a.district} />
                <input type="hidden" name="applicationId" value={a.id} />

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-xs font-medium text-ink-soft">
                    Public name
                    <input
                      name="displayName"
                      required
                      defaultValue={publicName(a.fullName)}
                      className={`mt-1 ${inp}`}
                    />
                  </label>
                  <label className="text-xs font-medium text-ink-soft">
                    Sector
                    <input name="sector" placeholder="e.g. Nyamata" className={`mt-1 ${inp}`} />
                  </label>
                </div>

                <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-soft">
                  <input type="checkbox" name="verified" defaultChecked className="h-4 w-4 accent-[var(--color-forest)]" />
                  Mark as verified
                </label>

                <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center rounded-[var(--radius)] bg-forest px-4 text-sm font-semibold text-white transition-colors hover:bg-forest-deep cursor-pointer"
                  >
                    Approve &amp; publish keeper
                  </button>
                  <DeleteButton
                    action={deleteApplicationAction}
                    id={a.id}
                    label="Dismiss"
                    confirm="Dismiss this application?"
                  />
                </div>
              </form>
            ))}
          </div>
        )}
      </section>

      {/* Existing keepers */}
      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">
            Keepers ({sellers.length})
          </h2>
        </div>
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">Keeper</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Member since</th>
                <th className="px-4 py-3 font-semibold">Verified</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">
                    {s.displayName}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {s.sector}, {s.district}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {formatMemberSince(s.memberSince)}
                  </td>
                  <td className="px-4 py-3">
                    {s.verified ? <VerifiedBadge /> : <span className="text-xs text-ink-muted">No</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <MiniForm
                        action={verifySellerAction}
                        fields={{ id: s.id, verified: String(!s.verified) }}
                        label={s.verified ? "Unverify" : "Verify"}
                        tone={s.verified ? "neutral" : "gold"}
                      />
                      <DeleteButton
                        action={deleteSellerAction}
                        id={s.id}
                        confirm={`Delete ${s.displayName} and all their listings?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add keeper manually */}
      <section>
        <details className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
          <summary className="cursor-pointer font-display font-bold text-ink">
            + Add a keeper manually
          </summary>
          <form action={createSellerAction} className="mt-4 grid gap-3 sm:grid-cols-2">
            <Labeled label="Public name">
              <input name="displayName" required placeholder="e.g. Ferdinand N." className={inp} />
            </Labeled>
            <Labeled label="Full name (private)">
              <input name="fullName" required placeholder="Ferdinand Nzabirinda" className={inp} />
            </Labeled>
            <Labeled label="Phone (private)">
              <input name="phone" required placeholder="0783358497" className={inp} />
            </Labeled>
            <Labeled label="WhatsApp (private)">
              <input name="whatsapp" placeholder="0783358497" className={inp} />
            </Labeled>
            <Labeled label="District">
              <input name="district" placeholder="Bugesera" className={inp} />
            </Labeled>
            <Labeled label="Sector">
              <input name="sector" placeholder="Nyamata" className={inp} />
            </Labeled>
            <Labeled label="Bio" full>
              <textarea name="bio" rows={2} placeholder="Short description shown to buyers" className={`${inp} resize-none`} />
            </Labeled>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-soft sm:col-span-2">
              <input type="checkbox" name="verified" className="h-4 w-4 accent-[var(--color-forest)]" />
              Mark as verified
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-[var(--radius)] bg-forest px-5 text-sm font-semibold text-white transition-colors hover:bg-forest-deep cursor-pointer"
              >
                Create keeper
              </button>
            </div>
          </form>
        </details>
      </section>
    </AdminShell>
  );
}

function Labeled({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`text-xs font-medium text-ink-soft ${full ? "sm:col-span-2" : ""}`}>
      {label}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function publicName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}
