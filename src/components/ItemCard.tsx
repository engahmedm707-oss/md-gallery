import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatEGP, calcDiscountedPrice, getWhatsAppLink } from "@/lib/utils";
import { ArrowUpRightIcon, WhatsAppIcon } from "@/components/Icons";
import type { Item } from "@/lib/data";

export function ItemCard({
  item,
  locale,
  whatsappIntl,
}: {
  item: Item;
  locale: Locale;
  whatsappIntl: string;
}) {
  const t = getDictionary(locale);
  const name = locale === "ar" ? item.name_ar : item.name_en;
  const desc =
    locale === "ar"
      ? item.short_description_ar || item.description_ar
      : item.short_description_en || item.description_en;
  const category = item.categories
    ? locale === "ar"
      ? item.categories.name_ar
      : item.categories.name_en
    : null;
  const hasDiscount = item.discount_type !== "none" && item.discount_value > 0;
  const finalPrice = calcDiscountedPrice(
    Number(item.price_egp),
    item.discount_type,
    Number(item.discount_value),
  );
  const image = item.item_images?.slice().sort((a, b) => a.sort_order - b.sort_order)[0];
  const imageUrl = image
    ? image.storage_path.startsWith("http") || image.storage_path.startsWith("/")
      ? image.storage_path
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${image.storage_path}`
    : null;
  const message =
    locale === "ar"
      ? `مرحباً، أود الاستفسار عن: ${item.name_ar} (MD Gallery)`
      : `Hi, I'd like to inquire about: ${item.name_en} (MD Gallery)`;
  const wa = getWhatsAppLink(whatsappIntl || "201151515676", message);

  return (
    <article className="group flex flex-col">
      <Link
        href={`/${locale}/gallery/${item.id}`}
        className="relative block overflow-hidden border border-line bg-sand"
      >
        <div className="relative aspect-[4/5]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="ornament absolute inset-0 flex items-center justify-center">
              <span className="font-display text-3xl tracking-tight text-ink/30">
                <span style={{ color: "#7A1F2B" }}>M</span>
                <span style={{ color: "#1B2A49" }}>D</span>
              </span>
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent opacity-70"
            aria-hidden
          />

          {category && (
            <span className="absolute start-3 top-3 border border-brass/60 bg-cream/90 px-2.5 py-1 text-[8.5px] font-semibold uppercase tracking-[0.16em] text-ink backdrop-blur">
              {category}
            </span>
          )}

          {hasDiscount && (
            <span className="absolute bottom-3 start-3 bg-burgundy px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
              {item.discount_type === "percentage"
                ? `-${item.discount_value}%`
                : `-${Number(item.discount_value).toLocaleString("en-EG")} EGP`}
            </span>
          )}

          <span className="absolute bottom-3 end-3 grid h-9 w-9 translate-y-2 place-items-center border border-brass/70 bg-ink/45 text-cream opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRightIcon className="h-4 w-4" />
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <Link href={`/${locale}/gallery/${item.id}`} className="group/name">
          <h3 className="font-display text-xl leading-snug text-ink transition-colors group-hover/name:text-burgundy sm:text-[1.35rem]">
            {name}
          </h3>
        </Link>
        {desc && <p className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-muted">{desc}</p>}

        <div className="mt-auto flex items-baseline gap-2.5 pt-4">
          <span className="text-[15px] font-semibold text-ink">{formatEGP(finalPrice, locale)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted line-through decoration-burgundy/60">
              {formatEGP(Number(item.price_egp), locale)}
            </span>
          )}
        </div>

        <div className="mt-3.5 flex gap-2">
          <Link
            href={`/${locale}/gallery/${item.id}`}
            className="btn btn-outline btn-sm flex-1"
          >
            {t.item.details}
          </Link>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm flex-1"
          >
            <WhatsAppIcon className="h-3 w-3" />
            {t.item.inquire}
          </a>
        </div>
      </div>
    </article>
  );
}