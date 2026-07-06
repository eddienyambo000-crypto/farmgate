import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { listSellersFull, listApplications } from "@/lib/data/admin-repo";
import {
  createSellerAction,
  updateSellerAction,
  verifySellerAction,
  deleteSellerAction,
  deleteApplicationAction,
} from "@/lib/actions/admin";
import { DeleteButton, MiniForm } from "@/components/admin/controls";
import { VerifiedBadge } from "@/components/VerifiedBadge";

export const metadata: Metadata = {
  title: "Keepers",
  robots: { index: false, follow: false },
};

const inp =
  "w-full rounded-[var(--radius)] border border-line bg-surface px-3 py-2 text-sm text-ink outline-none hover:border-forest/30 focus-visible:border-forest";

export default async function AdminKeepers() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [sellers, applications] = await Promise.all([
    listSellersFull(),
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

      {/* Existing keepers — fully editable */}
      <section className="mb-10">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">
          Keepers ({sellers.length})
        </h2>
        {sellers.length === 0 ? (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-line bg-surface p-8 text-center text-sm text-ink-muted">
            No keepers yet. Add one below or on a listing.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {sellers.map((s) => (
              <div
                key={s.id}
                className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-display font-bold text-ink">
                    {s.displayName}
                    {s.verified && <VerifiedBadge />}
                  </span>
                  <div className="flex items-center gap-1">
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
                </div>
                <form action={updateSellerAction} className="space-y-2">
                  <input type="hidden" name="id" value={s.id} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Labeled label="Public name">
                      <input name="displayName" required defaultValue={s.displayName} className={inp} />
                    </Labeled>
                    <Labeled label="Full name (private)">
                      <input name="fullName" defaultValue={s.fullName} className={inp} />
                    </Labeled>
                    <Labeled label="Phone (private)">
                      <input name="phone" defaultValue={s.phone} className={inp} />
                    </Labeled>
                    <Labeled label="WhatsApp (private)">
                      <input name="whatsapp" defaultValue={s.whatsapp} className={inp} />
                    </Labeled>
                    <Labeled label="District">
                      <input name="district" defaultValue={s.district} className={inp} />
                    </Labeled>
                    <Labeled label="Sector">
                      <input name="sector" defaultValue={s.sector} className={inp} />
                    </Labeled>
                    <Labeled label="Email (optional)" full>
                      <input name="email" defaultValue={s.email ?? ""} className={inp} />
                    </Labeled>
                    <Labeled label="Bio" full>
                      <textarea name="bio" rows={2} defaultValue={s.bio} className={`${inp} resize-none`} />
                    </Labeled>
                  </div>
                  <button
                    type="submit"
                    className="mt-1 inline-flex h-9 items-center rounded-[var(--radius)] bg-forest px-4 text-sm font-semibold text-white transition-colors hover:bg-forest-deep cursor-pointer"
                  >
                    Save changes
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
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
