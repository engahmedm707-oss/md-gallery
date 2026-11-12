import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ItemForm } from "@/components/admin/ItemForm";
import { ArrowIcon } from "@/components/Icons";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: categories }, { data: item }] = await Promise.all([
    supabase.from("categories").select("id,name_en,name_ar").order("sort_order"),
    supabase.from("items").select("*, item_images(*)").eq("id", id).single(),
  ]);
  if (!item) notFound();

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
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink">
          {item.name_en || "Edit piece"}
        </h1>
        <p className="mt-2 max-w-2xl text-[12px] leading-6 text-muted">
          Update bilingual fields, pricing and discounts, and add more images. Existing image
          removal is managed in Supabase Storage and requires confirmation.
        </p>
      </div>
      <ItemForm categories={categories || []} item={item as any} />
    </div>
  );
}