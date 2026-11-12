import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ItemForm } from "@/components/admin/ItemForm";
import { ArrowIcon } from "@/components/Icons";

export default async function NewItemPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id,name_en,name_ar")
    .order("sort_order");

  return (
    <div className="space-y-7">
      <div className="border-b border-line-soft pb-7">
        <Link
          href="/admin/items"
          className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted transition-colors hover:text-ink"
        >
          <ArrowIcon className="icon-arrow h-3 w-3 rotate-180" />
          Back to items
        </Link>
        <p className="eyebrow mt-5">Catalog</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink">Add a piece</h1>
        <p className="mt-2 max-w-2xl text-[12px] leading-6 text-muted">
          Enter details in both English and Arabic, upload one or more images, and set pricing and
          discount. Percentage discounts must be 0–100; fixed discounts cannot exceed the price.
        </p>
      </div>
      <ItemForm categories={categories || []} />
    </div>
  );
}