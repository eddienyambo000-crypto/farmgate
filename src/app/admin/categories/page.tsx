import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { listCategories } from "@/lib/data/admin-repo";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/lib/actions/content";
import { DeleteButton } from "@/components/admin/controls";

export const metadata: Metadata = {
  title: "Animal Categories",
  robots: { index: false, follow: false },
};

const inp =
  "w-full rounded-[var(--radius)] border border-line bg-surface px-3 py-2 text-sm text-ink outline-none hover:border-forest/30 focus-visible:border-forest";

export default async function AdminCategories() {
  if (!(await isAdmin())) redirect("/admin/login");
  const categories = await listCategories();

  return (
    <AdminShell active="/admin/categories" title="Animal categories">
      <p className="mb-6 max-w-2xl text-sm text-ink-soft">
        These are the animal types buyers browse. Add any animal you sell — it
        instantly appears in the marketplace filters, category grid and its own
        landing page. (Tip: you can also add a new type right on a listing.)
      </p>

      {/* Add */}
      <details className="mb-8 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
        <summary className="cursor-pointer font-display font-bold text-ink">
          + Add a category
        </summary>
        <form action={createCategoryAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <Labeled label="Name (e.g. Turkey)">
            <input name="label" required placeholder="Turkey" className={inp} />
          </Labeled>
          <Labeled label="Plural (e.g. Turkeys)">
            <input name="plural" placeholder="Turkeys" className={inp} />
          </Labeled>
          <Labeled label="Kinyarwanda name">
            <input name="labelRw" placeholder="Optional" className={inp} />
          </Labeled>
          <Labeled label="Sort order">
            <input name="sort" type="number" defaultValue={categories.length + 1} className={inp} />
          </Labeled>
          <Labeled label="Short blurb" full>
            <input name="blurb" placeholder="e.g. Healthy turkeys for meat & breeding" className={inp} />
          </Labeled>
          <Labeled label="Search words (space-separated, EN + Kinyarwanda)" full>
            <input name="synonyms" placeholder="turkey turkeys bird poultry inkoko-y-amahanga" className={inp} />
          </Labeled>
          <label className="flex items-center gap-2 text-sm text-ink-soft sm:col-span-2">
            <input type="checkbox" name="active" defaultChecked className="h-4 w-4 accent-[var(--color-forest)]" />
            Active (visible to buyers)
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="inline-flex h-10 items-center rounded-[var(--radius)] bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep cursor-pointer">
              Add category
            </button>
          </div>
        </form>
      </details>

      {/* Existing */}
      {categories.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-line bg-surface p-8 text-center text-sm text-ink-muted">
          No categories yet — add your first one above.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {categories.map((c) => (
            <form
              key={c.slug}
              action={updateCategoryAction}
              className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-sm)]"
            >
              <input type="hidden" name="slug" value={c.slug} />
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display font-bold text-ink">{c.label}</span>
                <span className="rounded-full bg-cream px-2 py-0.5 text-xs text-ink-muted">/{c.slug}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Labeled label="Name"><input name="label" defaultValue={c.label} required className={inp} /></Labeled>
                <Labeled label="Plural"><input name="plural" defaultValue={c.plural} className={inp} /></Labeled>
                <Labeled label="Kinyarwanda"><input name="labelRw" defaultValue={c.labelRw} className={inp} /></Labeled>
                <Labeled label="Sort"><input name="sort" type="number" defaultValue={c.sort} className={inp} /></Labeled>
                <Labeled label="Blurb" full><input name="blurb" defaultValue={c.blurb} className={inp} /></Labeled>
                <Labeled label="Search words" full><input name="synonyms" defaultValue={c.synonyms} className={inp} /></Labeled>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <label className="flex items-center gap-2 text-sm text-ink-soft">
                  <input type="checkbox" name="active" defaultChecked={c.active} className="h-4 w-4 accent-[var(--color-forest)]" />
                  Active
                </label>
                <div className="flex items-center gap-2">
                  <button type="submit" className="rounded-md px-3 py-1.5 text-xs font-semibold text-forest-deep hover:bg-leaf-tint/60 cursor-pointer">
                    Save
                  </button>
                  <DeleteButton
                    action={deleteCategoryAction}
                    id={c.slug}
                    confirm={`Delete the "${c.label}" category? Existing listings stay but lose this label.`}
                  />
                </div>
              </div>
            </form>
          ))}
        </div>
      )}
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
