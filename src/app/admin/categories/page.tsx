import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { upsertCategory, deleteCategory } from "@/app/admin/actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*, items(count)")
    .order("sort_order");

  return (
    <div className="space-y-8">
      <div className="border-b border-line-soft pb-7">
        <p className="eyebrow">Catalog</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink">Categories</h1>
        <p className="mt-2 max-w-2xl text-[12px] leading-6 text-muted">
          Bilingual collections, ordered as they appear in the gallery. A category cannot be deleted
          while it still contains pieces — reassign or remove those items first.
        </p>
      </div>

      <form action={upsertCategory} className="form-card grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="form-title">Add or update a category</h2>
          <p className="mt-1 text-[11px] leading-5 text-muted">
            Provide a slug, name in both languages, and the order it should appear in.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="label" htmlFor="category-id">
            ID (leave blank to create)
          </label>
          <input id="category-id" name="id" placeholder="Optional existing category ID" className="input" />
        </div>

        <div>
          <label className="label" htmlFor="category-slug">
            Slug *
          </label>
          <input id="category-slug" name="slug" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="category-order">
            Sort order
          </label>
          <input
            id="category-order"
            name="sort_order"
            type="number"
            defaultValue={0}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="category-name-en">
            Name (EN) *
          </label>
          <input id="category-name-en" name="name_en" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="category-name-ar">
            Name (AR) *
          </label>
          <input id="category-name-ar" name="name_ar" className="input" dir="rtl" required />
        </div>
        <div>
          <label className="label" htmlFor="category-description-en">
            Description (EN)
          </label>
          <textarea
            id="category-description-en"
            name="description_en"
            className="input"
            rows={2}
          />
        </div>
        <div>
          <label className="label" htmlFor="category-description-ar">
            Description (AR)
          </label>
          <textarea
            id="category-description-ar"
            name="description_ar"
            className="input"
            dir="rtl"
            rows={2}
          />
        </div>
        <label className="flex items-center gap-2 text-[12px] text-ink">
          <input type="checkbox" name="is_visible" defaultChecked /> Visible in the gallery
        </label>
        <div className="flex justify-end md:col-span-2">
          <button className="btn btn-primary" type="submit">
            Save category
          </button>
        </div>
      </form>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Slug</th>
              <th>English</th>
              <th>Arabic</th>
              <th>Items</th>
              <th>Visibility</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(categories || []).map((c: any) => {
              const itemCount = c.items?.[0]?.count ?? 0;
              async function del() {
                "use server";
                await deleteCategory(c.id);
              }
              return (
                <tr key={c.id}>
                  <td className="text-muted">{c.sort_order}</td>
                  <td className="font-mono text-[11px] text-muted">{c.slug}</td>
                  <td className="font-medium">{c.name_en}</td>
                  <td dir="rtl">{c.name_ar}</td>
                  <td>
                    <span className={itemCount > 0 ? "chip chip-brass" : "chip"}>{itemCount}</span>
                  </td>
                  <td>
                    <span className={c.is_visible ? "chip chip-ink" : "chip"}>
                      {c.is_visible ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end">
                      <ConfirmDeleteButton
                        action={del}
                        className="btn btn-danger btn-sm"
                        confirmMessage={
                          itemCount > 0
                            ? "This category still contains items and cannot be deleted until they are reassigned or removed. Attempt delete anyway?"
                            : "Permanently delete this category? This cannot be undone."
                        }
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(!categories || categories.length === 0) && (
              <tr>
                <td className="py-12 text-center text-muted" colSpan={7}>
                  No categories yet. Run the seed file or add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}