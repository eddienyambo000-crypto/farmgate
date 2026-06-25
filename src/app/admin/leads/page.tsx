import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { listInquiries } from "@/lib/data/admin-repo";
import { setInquiryStatusAction, deleteInquiryAction } from "@/lib/actions/admin";
import { DeleteButton, StatusSelect } from "@/components/admin/controls";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Buyer Leads",
  robots: { index: false, follow: false },
};

const STATUS_OPTS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "viewing_scheduled", label: "Viewing set" },
  { value: "closed_won", label: "Sold ✓" },
  { value: "closed_lost", label: "Lost" },
];

export default async function AdminLeads() {
  if (!(await isAdmin())) redirect("/admin/login");
  const leads = await listInquiries();

  return (
    <AdminShell active="/admin/leads" title="Buyer leads">
      <p className="mb-5 max-w-2xl text-sm text-ink-soft">
        Every buyer who requested an animal. Tap the phone to message them on
        WhatsApp, then move the lead through your pipeline.
      </p>

      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 font-semibold">Buyer</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">District</th>
              <th className="px-4 py-3 font-semibold">Animal</th>
              <th className="px-4 py-3 font-semibold">Stage</th>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-line align-top last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{l.buyerName}</p>
                  {l.message && (
                    <p className="mt-0.5 max-w-xs text-xs text-ink-muted">
                      “{l.message}”
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`https://wa.me/${l.buyerPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-forest-deep underline"
                  >
                    {l.buyerPhone}
                  </a>
                </td>
                <td className="px-4 py-3 text-ink-soft">{l.buyerDistrict}</td>
                <td className="px-4 py-3 text-ink-soft">{l.listingTitle}</td>
                <td className="px-4 py-3">
                  <StatusSelect
                    action={setInquiryStatusAction}
                    id={l.id}
                    current={l.status}
                    options={STATUS_OPTS}
                  />
                </td>
                <td className="px-4 py-3 text-xs text-ink-muted">
                  {formatDate(l.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteButton
                    action={deleteInquiryAction}
                    id={l.id}
                    label="Remove"
                    confirm="Remove this lead?"
                  />
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ink-muted">
                  No leads yet. They&apos;ll appear here the moment a buyer
                  requests an animal.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
