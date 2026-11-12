import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getItemById, getPublicItems, getSiteSettings } from "@/lib/data";
import { formatEGP, calcDiscountedPrice, getWhatsAppLink } from "@/lib/utils";
import { ItemGallery } from "@/components/ItemGallery";
import { ItemCard } from "@/components/ItemCard";
import { CheckIcon, WhatsAppIcon } from "@/components/Icons";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getDictionary(locale);
  const [item, settings, allItems] = await Promise.all([
    getItemById(id),
    getSiteSettings(),
    getPublicItems(),
  ]);
  if (!item) notFound();

  const name = locale === "ar" ? item.name_ar : item.name_en;
  const desc = locale === "ar" ? item.description_ar : item.description_en;
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
  const images = item.item_images || [];
  const whatsappIntl = settings.whatsapp_number_intl || "201151515676";
  const whatsappDisplay = settings.whatsapp_number || "01151515676";
  const waMessage =
    locale === "ar"
      ? `مرحباً، أود الاستفسار عن: ${item.name_ar} (${formatEGP(finalPrice, locale)}) — MD Gallery`
      : `Hi, I'd like to inquire about: ${item.name_en} (${formatEGP(finalPrice, locale)}) — MD Gallery`;
  const wa = getWhatsAppLink(whatsappIntl, waMessage);

  const fields = (
    [
      [t.item.material, locale === "ar" ? item.material_ar : item.material_en],
      [t.item.dimensions, locale === "ar" ? item.dimensions_ar : item.dimensions_en],
      [t.item.color, locale === "ar" ? item.color_ar : item.color_en],
      [t.item.technique, locale === "ar" ? item.technique_craft_ar : item.technique_craft_en],
      [t.item.care, locale === "ar" ? item.care_instructions_ar : item.care_instructions_en],
      [t.item.availability, locale === "ar" ? item.availability_note_ar : item.availability_note_en],
      [t.item.notes, locale === "ar" ? item.notes_ar : item.notes_en],
    ] as Array<[string, string | null | undefined]>
  ).filter((entry): entry is [string, string] => Boolean(entry[1]));

  const related = [
    ...allItems.filter((candidate) => candidate.id !== item.id && candidate.category_id === item.category_id),
    ...allItems.filter((candidate) => candidate.id !== item.id && candidate.category_id !== item.category_id),
  ].slice(0, 3);

  const badge = hasDiscount
    ? item.discount_type === "percentage"
      ? `-${item.discount_value}%`
      : `-${Number(item.discount_value).toLocaleString("en-EG")} EGP`
    : null;

  const trust =
    locale === "ar"
      ? ["سعر نهائي بالجنيه", "تفاصيل موثقة", "دعم مباشر عبر واتساب"]
      : ["Final price in EGP", "Verified details", "WhatsApp support"];

  return (
    <div className="bg-paper">
      {/* Breadcrumb */}
      <div className="border-b border-line-soft bg-cream">
        <div className="container-page flex items-center gap-2.5 overflow-x-auto py-4 text-[9px] font-medium uppercase tracking-[0.16em] text-muted">
          <Link href={`/${locale}`} className="whitespace-nowrap transition-colors hover:text-ink">
            {locale === "ar" ? "الرئيسية" : "Home"}
          </Link>
          <span className="text-brass" aria-hidden>
            /
          </span>
          <Link
            href={`/${locale}/gallery`}
            className="whitespace-nowrap transition-colors hover:text-ink"
          >
            {t.nav.gallery}
          </Link>
          <span className="text-brass" aria-hidden>
            /
          </span>
          <span className="truncate text-ink">{name}</span>
        </div>
      </div>

      <section className="container-page py-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <div className="lg:sticky lg:top-28">
              <ItemGallery images={images} name={name} badge={badge} />
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="lg:max-w-xl">
              {category && (
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-brass-ink">
                  {category}
                </p>
              )}
              <h1 className="mt-3 font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
                {name}
              </h1>

              <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-line-soft pb-6">
                <span className="font-display text-3xl text-ink">
                  {formatEGP(finalPrice, locale)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-muted line-through decoration-burgundy/60">
                      {formatEGP(Number(item.price_egp), locale)}
                    </span>
                    <span className="chip chip-burgundy">
                      {locale === "ar" ? "خصم" : "Save"}{" "}
                      {item.discount_type === "percentage"
                        ? `${item.discount_value}%`
                        : formatEGP(Number(item.discount_value), locale)}
                    </span>
                  </>
                )}
              </div>

              {desc && <p className="mt-6 text-[14px] leading-8 text-muted">{desc}</p>}

              <div className="mt-7">
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-lg btn-block"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {t.item.inquire}
                </a>
                <p className="mt-3 text-center text-[10px] uppercase tracking-[0.14em] text-muted">
                  {locale === "ar" ? "واتساب" : "WhatsApp"} ·{" "}
                  <span dir="ltr">{whatsappDisplay}</span>
                </p>
              </div>

              <ul className="mt-6 grid gap-2.5 border border-line bg-cream p-4 text-[11.5px] text-muted sm:grid-cols-3">
                {trust.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" />
                    <span className="leading-5">{point}</span>
                  </li>
                ))}
              </ul>

              {fields.length > 0 && (
                <div className="mt-9">
                  <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                    {t.item.details}
                  </h2>
                  <dl className="mt-4 border-t border-line-soft">
                    {fields.map(([key, value]) => (
                      <div
                        key={key}
                        className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-line-soft py-3 last:border-b-0"
                      >
                        <dt className="pt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
                          {key}
                        </dt>
                        <dd className="text-[13px] leading-6 text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <div className="mt-9 border border-line bg-white p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-display text-xl text-ink">{t.item.reviews}</h2>
                    <p className="mt-1 text-[12px] leading-6 text-muted">
                      {locale === "ar"
                        ? "تقييمات المنتج المعتمدة تظهر هنا. سجّل الدخول لإضافة تقييم (يُنشر بعد موافقة الإدارة)."
                        : "Approved product reviews appear here. Log in to submit a review — published after gallery approval."}
                    </p>
                  </div>
                  <Link
                    href={`/${locale}/auth/login`}
                    className="btn btn-outline btn-sm shrink-0"
                  >
                    {t.auth.login}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line-soft bg-cream">
          <div className="section container-page">
            <div className="mb-9 flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">{locale === "ar" ? "قد يعجبك أيضًا" : "You may also like"}</p>
                <h2 className="section-title mt-4">{locale === "ar" ? "قطع أخرى" : "More pieces"}</h2>
              </div>
              <Link href={`/${locale}/gallery`} className="link-underline hidden sm:inline-flex">
                {t.nav.gallery}
              </Link>
            </div>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((relatedItem) => (
                <ItemCard
                  key={relatedItem.id}
                  item={relatedItem}
                  locale={locale}
                  whatsappIntl={whatsappIntl}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}