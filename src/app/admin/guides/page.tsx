import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { listGuidesAdmin } from "@/lib/data/admin-repo";
import { deleteGuideAction } from "@/lib/actions/content";
import { DeleteButton } from "@/components/admin/controls";
import { ButtonLink } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Guides",
  robots: { index: false, follow: false },
};

export default async function AdminGuides() {
  if (!(await isAdmin())) redirect("/admin/login");
  const guides = await listGuidesAdmin();

  return (
    <AdminShell
      active="/admin/guides"
      title="Guides & blog"
      action={
        <ButtonLink href="/admin/guides/new" size="sm">
          + New guide
        </ButtonLink>
      }
    >
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Published</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {guides.map((g) => (
              <tr key={g.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/guides/${g.slug}`} target="_blank" className="font-medium text-ink hover:text-forest-deep">
                    {g.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      g.published ? "bg-leaf-tint text-forest-deep" : "bg-line/70 text-ink-muted"
                    }`}
                  >
                    {g.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(g.publishedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/guides/${g.id}/edit`} className="rounded-md px-2.5 py-1 text-xs font-semibold text-forest-deep hover:bg-leaf-tint/60">
                      Edit
                    </Link>
                    <DeleteButton action={deleteGuideAction} id={g.id} confirm={`Delete "${g.title}"?`} />
                  </div>
                </td>
              </tr>
            ))}
            {guides.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink-muted">
                  No guides yet. Write your first one to start ranking on Google.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
