import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getPublicCategories, getPublicItems, getSiteSettings } from "@/lib/data";
import { ItemCard } from "@/components/ItemCard";
import { PageHeader } from "@/components/PageHeader";
import { WhatsAppIcon } from "@/components/Icons";
import { getWhatsAppLink } from "@/lib/utils";

export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale: raw } = await params;
  const { category } = await searchParams;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getDictionary(locale);
  const [categories, items, settings] = await Promise.all([
    getPublicCategories(),
    getPublicItems({ categorySlug: category }),
    getSiteSettings(),
  ]);
  const whatsappIntl = settings.whatsapp_number_intl || "201151515676";
  const wa = getWhatsAppLink(
    whatsappIntl,
    locale === "ar"
      ? "مرحباً، أود الاستفسار عن قطعة من معرض MD"
      : "Hi, I'd like to ask about a piece from MD Gallery",
  );

  return (
    <div className="bg-paper">
      <PageHeader
        locale={locale}
        eyebrow={locale === "ar" ? "المجموعة" : "The collection"}
        title={t.nav.gallery}
        description={
          locale === "ar"
            ? "تصفّح القطع المتاحة، وتواصل معنا عبر واتساب للسعر النهائي والتوفر وتفاصيل التنفيذ."
            : "Browse available pieces, then message us on WhatsApp for final pricing, availability and details."
        }
      >
        <div className="grid grid-cols-2 border border-brass/45">
          <div className="px-6 py-4">
            <p className="font-display text-3xl leading-none text-cream">{items.length}</p>
            <p className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-cream/45">
              {locale === "ar" ? "قطعة معروضة" : "Pieces shown"}
            </p>
          </div>
          <div className="border-s border-brass/45 px-6 py-4">
            <p className="font-display text-3xl leading-none text-cream">{categories.length}</p>
            <p className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-cream/45">
              {locale === "ar" ? "مجموعة" : "Collections"}
            </p>
          </div>
        </div>
      </PageHeader>

      <section className="container-page py-12 md:py-16">
        <div className="mb-10 flex flex-col gap-5 border-b border-line-soft md:flex-row md:items-end md:justify-between">
          <nav
            aria-label={locale === "ar" ? "تصفية حسب الفئة" : "Filter by category"}
            className="-mb-px flex items-center gap-6 overflow-x-auto"
          >
            <Link
              href={`/${locale}/gallery`}
              className={`whitespace-nowrap border-b-2 pb-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                !category
                  ? "border-brass text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.common.all}
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/${locale}/gallery?category=${c.slug}`}
                className={`whitespace-nowrap border-b-2 pb-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  category === c.slug
                    ? "border-brass text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {locale === "ar" ? c.name_ar : c.name_en}
              </Link>
            ))}
          </nav>
          <p className="pb-3.5 text-[9px] font-medium uppercase tracking-[0.18em] text-muted">
            {locale === "ar"
              ? `${items.length} قطعة`
              : `${items.length} ${items.length === 1 ? "piece" : "pieces"}`}
          </p>
        </div>

        {items.length ? (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} locale={locale} whatsappIntl={whatsappIntl} />
            ))}
          </div>
        ) : (
          <div className="ornament border border-line bg-cream px-6 py-20 text-center">
            <p className="font-display text-3xl text-ink">
              {locale === "ar" ? "لا توجد قطع هنا بعد." : "No pieces here yet."}
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted">
              {locale === "ar"
                ? "جرّب مجموعة أخرى أو تصفّح كل القطع المتاحة."
                : "Try another collection or browse everything currently available."}
            </p>
            <Link href={`/${locale}/gallery`} className="btn btn-outline mt-7">
              {t.common.all}
            </Link>
          </div>
        )}

        <div className="mt-16 flex flex-col items-start justify-between gap-5 border border-line bg-cream p-6 md:flex-row md:items-center md:p-8">
          <div>
            <p className="eyebrow">{locale === "ar" ? "تحتاج مساعدة؟" : "Need a hand?"}</p>
            <p className="mt-3 font-display text-2xl text-ink">
              {locale === "ar"
                ? "اسألنا عن أي قطعة قبل أن تقرر."
                : "Ask us about any piece before you decide."}
            </p>
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            <WhatsAppIcon className="h-3.5 w-3.5" />
            {t.hero.whatsapp}
          </a>
        </div>
      </section>
    </div>
  );
}