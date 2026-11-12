"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertItem } from "@/app/admin/actions";

type Category = { id: string; name_en: string; name_ar: string };

export function ItemForm({ categories, item }: { categories: Category[]; item?: any }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await upsertItem(formData);
        router.push("/admin/items");
        router.refresh();
      } catch (e: any) {
        setError(e.message || "Failed to save item");
      }
    });
  }

  const v = (key: string, fallback: any = "") => item?.[key] ?? fallback;

  return (
    <form action={onSubmit} className="space-y-5">
      {item?.id && <input type="hidden" name="id" value={item.id} />}

      <section className="form-card grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="text-[9px] font-semibold tracking-[0.18em] text-brass">01</p>
          <h2 className="form-title mt-1">Basic & status</h2>
        </div>
        <div>
          <label className="label" htmlFor="item-category">
            Category *
          </label>
          <select
            id="item-category"
            name="category_id"
            className="input"
            defaultValue={v("category_id")}
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en} / {c.name_ar}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="item-sku">
              SKU
            </label>
            <input id="item-sku" name="sku" className="input" defaultValue={v("sku")} />
          </div>
          <div>
            <label className="label" htmlFor="item-slug">
              Slug
            </label>
            <input id="item-slug" name="slug" className="input" defaultValue={v("slug")} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-[12px] text-ink">
          <input type="checkbox" name="is_visible" defaultChecked={v("is_visible", true)} /> Visible
          in the storefront
        </label>
        <label className="flex items-center gap-2 text-[12px] text-ink">
          <input type="checkbox" name="is_featured" defaultChecked={v("is_featured", false)} />{" "}
          Featured on the homepage
        </label>
      </section>

      <section className="form-card grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="text-[9px] font-semibold tracking-[0.18em] text-brass">02</p>
          <h2 className="form-title mt-1">Content — English / Arabic</h2>
        </div>
        <div>
          <label className="label" htmlFor="item-name-en">
            Name (EN) *
          </label>
          <input id="item-name-en" name="name_en" className="input" defaultValue={v("name_en")} required />
        </div>
        <div>
          <label className="label" htmlFor="item-name-ar">
            Name (AR) *
          </label>
          <input
            id="item-name-ar"
            name="name_ar"
            className="input"
            dir="rtl"
            defaultValue={v("name_ar")}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="item-short-en">
            Short description (EN)
          </label>
          <textarea
            id="item-short-en"
            name="short_description_en"
            className="input"
            rows={2}
            defaultValue={v("short_description_en")}
          />
        </div>
        <div>
          <label className="label" htmlFor="item-short-ar">
            Short description (AR)
          </label>
          <textarea
            id="item-short-ar"
            name="short_description_ar"
            className="input"
            dir="rtl"
            rows={2}
            defaultValue={v("short_description_ar")}
          />
        </div>
        <div>
          <label className="label" htmlFor="item-desc-en">
            Description (EN)
          </label>
          <textarea
            id="item-desc-en"
            name="description_en"
            className="input"
            rows={4}
            defaultValue={v("description_en")}
          />
        </div>
        <div>
          <label className="label" htmlFor="item-desc-ar">
            Description (AR)
          </label>
          <textarea
            id="item-desc-ar"
            name="description_ar"
            className="input"
            dir="rtl"
            rows={4}
            defaultValue={v("description_ar")}
          />
        </div>
      </section>

      <section className="form-card grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="text-[9px] font-semibold tracking-[0.18em] text-brass">03</p>
          <h2 className="form-title mt-1">Specific details — English / Arabic</h2>
        </div>
        {[
          ["material", "Material"],
          ["dimensions", "Dimensions"],
          ["color", "Color"],
          ["technique_craft", "Technique / craft"],
          ["care_instructions", "Care instructions"],
          ["availability_note", "Availability note"],
          ["notes", "Notes"],
        ].map(([key, label]) => (
          <div key={key} className="contents">
            <div>
              <label className="label" htmlFor={`${key}-en`}>
                {label} (EN)
              </label>
              <input
                id={`${key}-en`}
                name={`${key}_en`}
                className="input"
                defaultValue={v(`${key}_en`)}
              />
            </div>
            <div>
              <label className="label" htmlFor={`${key}-ar`}>
                {label} (AR)
              </label>
              <input
                id={`${key}-ar`}
                name={`${key}_ar`}
                className="input"
                dir="rtl"
                defaultValue={v(`${key}_ar`)}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="form-card grid gap-4 md:grid-cols-3">
        <div className="md:col-span-3">
          <p className="text-[9px] font-semibold tracking-[0.18em] text-brass">04</p>
          <h2 className="form-title mt-1">Pricing & discount (EGP)</h2>
        </div>
        <div>
          <label className="label" htmlFor="item-price">
            Price (EGP) *
          </label>
          <input
            id="item-price"
            name="price_egp"
            type="number"
            step="0.01"
            min="0"
            className="input"
            defaultValue={v("price_egp", 0)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="item-discount-type">
            Discount type
          </label>
          <select
            id="item-discount-type"
            name="discount_type"
            className="input"
            defaultValue={v("discount_type", "none")}
          >
            <option value="none">None</option>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed amount (EGP)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="item-discount-value">
            Discount value
          </label>
          <input
            id="item-discount-value"
            name="discount_value"
            type="number"
            step="0.01"
            min="0"
            className="input"
            defaultValue={v("discount_value", 0)}
          />
        </div>
        <p className="text-[10px] leading-5 text-muted md:col-span-3">
          Validation: percentage 0–100, fixed discount cannot exceed the price. The storefront shows
          the original and final price.
        </p>
      </section>

      <section className="form-card space-y-3">
        <div>
          <p className="text-[9px] font-semibold tracking-[0.18em] text-brass">05</p>
          <h2 className="form-title mt-1">Images (1+)</h2>
        </div>
        {item?.item_images?.length ? (
          <p className="text-[11px] leading-6 text-muted">
            Current images: {item.item_images.length}. Uploading here adds more. Per-image removal
            and reordering can be managed through Supabase; permanent deletes require confirmation.
          </p>
        ) : (
          <p className="text-[11px] leading-6 text-muted">
            Upload one or more images. The first image (lowest sort order) is used as the cover.
          </p>
        )}
        <input name="images" type="file" accept="image/*" multiple className="input" />
      </section>

      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save item"}
        </button>
        <button className="btn btn-outline" type="button" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}