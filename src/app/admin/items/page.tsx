import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteItem } from "@/app/admin/actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { formatEGP } from "@/lib/utils";

export default async function AdminItemsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("items")
    .select(
      "id,name_en,name_ar,price_egp,discount_type,discount_value,is_visible,is_featured,categories(name_en,name_ar),item_images(count)",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-5 border-b border-line-soft pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink">Items</h1>
          <p className="mt-2 max-w-xl text-[12px] leading-6 text-muted">
            Bilingual pieces with images and discounts. Deleting an item is permanent — it removes
            the database record and stored images after confirmation.
          </p>
        </div>
        <Link href="/admin/items/new" className="btn btn-primary shrink-0 self-start sm:self-auto">
          Add item
        </Link>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Piece</th>
              <th>Category</th>
              <th>Price (EGP)</th>
              <th>Discount</th>
              <th>Images</th>
              <th>Visibility</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(items || []).map((item: any) => {
              async function del() {
                "use server";
                await deleteItem(item.id);
              }
              const imageCount = item.item_images?.[0]?.count ?? 0;
              return (
                <tr key={item.id}>
                  <td>
                    <div className="font-medium text-ink">{item.name_en}</div>
                    <div className="mt-0.5 text-muted" dir="rtl">
                      {item.name_ar}
                    </div>
                  </td>
                  <td>{item.categories?.name_en || "—"}</td>
                  <td className="whitespace-nowrap font-medium">
                    {formatEGP(Number(item.price_egp), "en")}
                  </td>
                  <td className="whitespace-nowrap">
                    {item.discount_type === "none" ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <span className="chip chip-brass">
                        {item.discount_type === "percentage"
                          ? `${item.discount_value}%`
                          : `${item.discount_value} EGP`}
                      </span>
                    )}
                  </td>
                  <td>{imageCount}</td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <span className={item.is_visible ? "chip chip-ink" : "chip"}>
                        {item.is_visible ? "Visible" : "Hidden"}
                      </span>
                      {item.is_featured && <span className="text-[9px] text-brass-ink">★ Featured</span>}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link href={`/admin/items/${item.id}`} className="btn btn-outline btn-sm">
                        Edit
                      </Link>
                      <ConfirmDeleteButton
                        action={del}
                        confirmMessage="Permanently delete this item and all its images? This cannot be undone."
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(!items || items.length === 0) && (
              <tr>
                <td className="py-12 text-center text-muted" colSpan={7}>
                  No items yet. Click “Add item” to create the first piece.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}