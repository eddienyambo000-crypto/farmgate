import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { listTestimonialsAdmin } from "@/lib/data/admin-repo";
import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
} from "@/lib/actions/content";
import { DeleteButton } from "@/components/admin/controls";

export const metadata: Metadata = {
  title: "Testimonials",
  robots: { index: false, follow: false },
};

const inp =
  "w-full rounded-[var(--radius)] border border-line bg-surface px-3 py-2 text-sm text-ink outline-none hover:border-forest/30 focus-visible:border-forest";

export default async function AdminTestimonials() {
  if (!(await isAdmin())) redirect("/admin/login");
  const items = await listTestimonialsAdmin();

  return (
    <AdminShell active="/admin/testimonials" title="Testimonials">
      {/* Add new */}
      <details className="mb-8 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
        <summary className="cursor-pointer font-display font-bold text-ink">
          + Add a testimonial
        </summary>
        <form action={createTestimonialAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="name" required placeholder="Customer name" className={inp} />
          <input name="location" placeholder="Location (e.g. Kicukiro, Kigali)" className={inp} />
          <select name="role" className={inp} defaultValue="Buyer">
            <option value="Buyer">Buyer</option>
            <option value="Keeper">Keeper</option>
          </select>
          <select name="rating" className={inp} defaultValue="5">
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} stars</option>
            ))}
          </select>
          <textarea name="quote" required rows={2} placeholder="What they said…" className={`${inp} sm:col-span-2`} />
          <textarea name="quoteRw" rows={2} placeholder="Kinyarwanda translation (optional)" className={`${inp} sm:col-span-2`} />
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" name="published" defaultChecked className="h-4 w-4 accent-[var(--color-forest)]" />
            Published
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="inline-flex h-10 items-center rounded-[var(--radius)] bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep cursor-pointer">
              Add testimonial
            </button>
          </div>
        </form>
      </details>

      {/* Existing */}
      {items.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-line bg-surface p-10 text-center text-ink-muted">
          No testimonials yet.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((t) => (
            <form
              key={t.id}
              action={updateTestimonialAction}
              className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]"
            >
              <input type="hidden" name="id" value={t.id} />
              <input type="hidden" name="sort" value={t.sort} />
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="name" defaultValue={t.name} className={inp} />
                <input name="location" defaultValue={t.location} className={inp} />
                <select name="role" defaultValue={t.role} className={inp}>
                  <option value="Buyer">Buyer</option>
                  <option value="Keeper">Keeper</option>
                </select>
                <select name="rating" defaultValue={t.rating} className={inp}>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>{r} stars</option>
                  ))}
                </select>
              </div>
              <textarea name="quote" defaultValue={t.quote} rows={2} className={`mt-3 ${inp}`} />
              <textarea name="quoteRw" defaultValue={t.quoteRw ?? ""} rows={2} placeholder="Kinyarwanda (optional)" className={`mt-3 ${inp}`} />
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-ink-soft">
                  <input type="checkbox" name="published" defaultChecked={t.published} className="h-4 w-4 accent-[var(--color-forest)]" />
                  Published
                </label>
                <div className="flex items-center gap-2">
                  <button type="submit" className="rounded-md px-3 py-1.5 text-xs font-semibold text-forest-deep hover:bg-leaf-tint/60 cursor-pointer">
                    Save
                  </button>
                  <DeleteButton action={deleteTestimonialAction} id={t.id} confirm="Delete this testimonial?" />
                </div>
              </div>
            </form>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
