import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getPublicCategories, getPublicItems, getSiteSettings, type Item } from "@/lib/data";
import { ItemCard } from "@/components/ItemCard";
import { ArrowIcon, ArrowUpRightIcon, CheckIcon, QuoteIcon, WhatsAppIcon } from "@/components/Icons";
import { formatEGP, calcDiscountedPrice, getWhatsAppLink } from "@/lib/utils";

const collectionImages: Record<string, string> = {
  paintings: "/demo/painting.svg",
  tables: "/demo/table.svg",
  crochet: "/demo/crochet.svg",
  "handmade-decor": "/demo/decor.svg",
};

function resolveImage(item: Item | undefined, fallback: string) {
  const image = item?.item_images?.slice().sort((a, b) => a.sort_order - b.sort_order)[0];
  if (!image?.storage_path) return fallback;
  return image.storage_path.startsWith("http") || image.storage_path.startsWith("/")
    ? image.storage_path
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-images/${image.storage_path}`;
}

function finalPrice(item: Item) {
  return calcDiscountedPrice(Number(item.price_egp), item.discount_type, Number(item.discount_value));
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getDictionary(locale);
  const [categories, items, settings] = await Promise.all([
    getPublicCategories(),
    getPublicItems(),
    getSiteSettings(),
  ]);

  const whatsappIntl = settings.whatsapp_number_intl || "201151515676";
  const wa = getWhatsAppLink(
    whatsappIntl,
    locale === "ar"
      ? "مرحباً، أود الاستفسار عن قطع معرض MD"
      : "Hi, I'd like to inquire about MD Gallery pieces",
  );

  const featuredItems = [
    ...items.filter((item) => item.is_featured),
    ...items.filter((item) => !item.is_featured),
  ].slice(0, 3);

  const heroItem = items.find((item) => item.is_featured) || items[0];
  const accentItem = items.find((item) => item.categories?.slug === "tables");
  const heroImage = resolveImage(heroItem, "/demo/painting.svg");
  const accentImage = resolveImage(accentItem, "/demo/table.svg");

  const promises =
    locale === "ar"
      ? ["قطع منجزة يدويًا", "مختارات محدودة", "أسعار واضحة بالجنيه", "تواصل مباشر عبر واتساب"]
      : ["Hand-finished pieces", "Small-batch curation", "Transparent EGP pricing", "Direct WhatsApp support"];

  const steps =
    locale === "ar"
      ? [
          {
            title: "اختَر قطعتك",
            text: "تصفّح المجموعة وتوقف عند القطع التي تشبه مساحتك وذوقك.",
          },
          {
            title: "استفسر عبر واتساب",
            text: "راسلنا لمعرفة السعر النهائي والتوفر والتفاصيل أو طلب صور إضافية.",
          },
          {
            title: "نسّق الاستلام",
            text: "نرتّب الاستلام أو التوصيل، أو نبدأ تنفيذ قطعة خاصة حسب الطلب.",
          },
        ]
      : [
          {
            title: "Choose your piece",
            text: "Browse the collection and save the pieces that speak to your space.",
          },
          {
            title: "Inquire on WhatsApp",
            text: "Message us for final pricing, availability, details or extra photographs.",
          },
          {
            title: "Arrange the handover",
            text: "We coordinate pickup or delivery, or begin a made-to-order commission.",
          },
        ];

  return (
    <div className="bg-paper">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line-soft">
        <div className="container-page relative grid items-center gap-14 py-14 lg:grid-cols-12 lg:gap-10 lg:py-20">
          <div className="animate-fade-up lg:col-span-6">
            <p className="eyebrow">
              {locale === "ar" ? "فن · حرفة · انتقاء" : "Art · Craft · Curated"}
            </p>
            <h1 className="display mt-6">{t.hero.title}</h1>
            <p className="mt-6 max-w-xl text-[15px] leading-8 text-muted">{t.hero.subtitle}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={`/${locale}/gallery`} className="btn btn-primary btn-lg">
                {t.hero.cta}
                <ArrowIcon className="h-3.5 w-3.5" />
              </Link>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-lg"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                {t.hero.whatsapp}
              </a>
            </div>

            <div className="mt-10 grid max-w-md grid-cols-2 gap-x-6 gap-y-2.5 text-[9px] font-medium uppercase tracking-[0.18em] text-muted">
              {promises.map((promise) => (
                <span key={promise} className="flex items-center gap-2 whitespace-nowrap">
                  <span className="h-1 w-1 bg-brass" aria-hidden />
                  {promise}
                </span>
              ))}
            </div>
          </div>

          <div className="animate-fade-up delay-1 lg:col-span-6">
            <div className="relative mx-auto max-w-[520px]">
              <div
                className="absolute -inset-4 border border-brass/30 sm:-inset-5"
                aria-hidden
              />
              <div className="absolute -inset-4 ornament opacity-[0.35] sm:-inset-5" aria-hidden />
              <div className="relative overflow-hidden border border-line bg-sand">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={heroImage}
                    alt={heroItem ? (locale === "ar" ? heroItem.name_ar : heroItem.name_en) : "Featured artwork"}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 45vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-brass">
                      {locale === "ar" ? "قطعة مميزة" : "Featured piece"}
                    </p>
                    <div className="mt-2 flex items-end justify-between gap-4">
                      <h2 className="font-display text-2xl leading-tight text-cream sm:text-3xl">
                        {heroItem
                          ? locale === "ar"
                            ? heroItem.name_ar
                            : heroItem.name_en
                          : "Sunset Canvas"}
                      </h2>
                      {heroItem && (
                        <p className="shrink-0 text-sm text-cream/85">
                          {formatEGP(finalPrice(heroItem), locale)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {accentItem && (
                <div className="absolute top-1/2 -start-5 hidden w-44 -translate-y-1/2 border border-line bg-cream p-2 shadow-[0_24px_60px_-30px_rgba(17,28,51,0.5)] sm:block">
                  <div className="relative aspect-square overflow-hidden bg-sand">
                    <Image
                      src={accentImage}
                      alt={locale === "ar" ? accentItem.name_ar : accentItem.name_en}
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
                  </div>
                  <div className="px-2 pb-1 pt-3">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-brass">
                      {locale === "ar" ? "من المجموعة" : "New in"}
                    </p>
                    <p className="mt-1 truncate font-display text-base text-ink">
                      {locale === "ar" ? accentItem.name_ar : accentItem.name_en}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="section container-page">
        <div className="mb-10 flex flex-col justify-between gap-6 md:mb-12 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{locale === "ar" ? "المجموعات" : "Collections"}</p>
            <h2 className="section-title mt-4">{t.sections.categories}</h2>
            <p className="section-subtitle">
              {locale === "ar"
                ? "ادخل إلى المجموعة التي تحبها — لكل قطعة تفاصيلها وحكايتها."
                : "Step into the collection you love — every piece carries its own detail and story."}
            </p>
          </div>
          <Link href={`/${locale}/gallery`} className="link-underline self-start md:self-auto">
            {locale === "ar" ? "عرض كل القطع" : "View all pieces"}
            <ArrowIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {categories.map((category, index) => {
            const count = items.filter((item) => item.category_id === category.id).length;
            const image = collectionImages[category.slug] || "/demo/decor.svg";
            return (
              <Link
                key={category.id}
                href={`/${locale}/gallery?category=${category.slug}`}
                className="group relative block overflow-hidden border border-line bg-sand"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={image}
                    alt={locale === "ar" ? category.name_ar : category.name_en}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-ink/5" />
                  <span className="absolute start-4 top-4 text-[9px] font-semibold tracking-[0.18em] text-cream/55">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <h3 className="font-display text-xl leading-tight text-cream sm:text-2xl">
                      {locale === "ar" ? category.name_ar : category.name_en}
                    </h3>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[9px] uppercase tracking-[0.16em] text-cream/60">
                        {count > 0
                          ? locale === "ar"
                            ? `${count} قطعة`
                            : `${count} ${count === 1 ? "piece" : "pieces"}`
                          : locale === "ar"
                            ? "استكشف"
                            : "Explore"}
                      </span>
                      <span className="grid h-7 w-7 place-items-center border border-brass/60 text-cream/75 transition-colors group-hover:border-brass group-hover:bg-brass group-hover:text-ink">
                        <ArrowUpRightIcon className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured selection */}
      <section className="border-y border-line-soft bg-cream">
        <div className="section container-page">
          <div className="mb-10 flex flex-col justify-between gap-6 md:mb-12 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">{locale === "ar" ? "مختار بعناية" : "Selected with care"}</p>
              <h2 className="section-title mt-4">{t.sections.featured}</h2>
              <p className="section-subtitle">
                {locale === "ar"
                  ? "قطع تستحق التوقف — بأسعار واضحة واستفسار مباشر عبر واتساب."
                  : "Pieces worth pausing for — clear pricing and a direct WhatsApp inquiry."}
              </p>
            </div>
            <Link href={`/${locale}/gallery`} className="link-underline self-start md:self-auto">
              {t.nav.gallery}
              <ArrowIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          {featuredItems.length ? (
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {featuredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  locale={locale}
                  whatsappIntl={whatsappIntl}
                />
              ))}
            </div>
          ) : (
            <div className="border border-line bg-paper p-10 text-center text-sm text-muted">
              {locale === "ar"
                ? "ستظهر القطع المميزة هنا بعد إضافتها من لوحة الإدارة."
                : "Featured pieces will appear here once added in the admin."}
            </div>
          )}
        </div>
      </section>

      {/* Atelier story */}
      <section className="relative overflow-hidden bg-ink text-cream">
        <div className="grain" aria-hidden />
        <div className="container-page relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-[430px]">
              <div className="absolute -inset-3 border border-brass/25" aria-hidden />
              <div className="relative aspect-[4/5] overflow-hidden border border-brass/40">
                <Image
                  src="/demo/decor.svg"
                  alt={locale === "ar" ? "قطعة ديكور يدوية" : "Handmade decor still life"}
                  fill
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -end-3 border border-brass/40 bg-ink px-4 py-3">
                <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-brass">
                  {locale === "ar" ? "تفاصيل مصنوعة يدويًا" : "Hand-finished detail"}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="eyebrow !text-brass">{locale === "ar" ? "الورشة" : "The atelier"}</p>
            <h2 className="mt-4 font-display text-3xl leading-[1.12] text-cream sm:text-4xl lg:text-[3rem]">
              {locale === "ar"
                ? "قطع بحضور هادئ وثقة في التفاصيل."
                : "Pieces with a quiet confidence."}
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-8 text-cream/60 md:text-[15px]">
              {t.sections.aboutText}
            </p>

            <ul className="mt-8 grid gap-3 text-sm text-cream/75 sm:grid-cols-2">
              {(locale === "ar"
                ? ["لمسات منجزة يدويًا", "تصنيع حسب الطلب", "خدمة شخصية بلغتين", "أسعار نهائية بالجنيه"]
                : ["Hand-finished details", "Made to order on request", "Personal bilingual service", "Final prices in EGP"]
              ).map((value) => (
                <li key={value} className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center border border-brass/40 text-brass">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  {value}
                </li>
              ))}
            </ul>

            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-light mt-9"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              {t.hero.whatsapp}
            </a>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section container-page">
        <div className="mb-10 flex flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow">{locale === "ar" ? "كيف تطلب" : "How it works"}</p>
            <h2 className="section-title mt-4">
              {locale === "ar" ? "من الاختيار إلى التسليم" : "From selection to delivery"}
            </h2>
            <p className="section-subtitle">
              {locale === "ar"
                ? "ثلاث خطوات بسيطة، والتواصل معنا مباشرة عبر واتساب."
                : "Three simple steps, with a real person on WhatsApp at every stage."}
            </p>
          </div>
          <Callout locale={locale} whatsappDisplay={settings.whatsapp_number || "01151515676"} />
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          {steps.map((step, index) => (
            <div key={step.title} className="border-t border-line-soft pt-6">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-3xl text-brass">0{index + 1}</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-muted/70">
                  {locale === "ar" ? "خطوة" : "Step"}
                </span>
              </div>
              <h3 className="mt-5 font-display text-2xl text-ink">{step.title}</h3>
              <p className="mt-2.5 text-sm leading-7 text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community */}
      <section className="border-t border-line-soft bg-sand/60">
        <div className="section container-page">
          <div className="mb-10 max-w-2xl md:mb-12">
            <p className="eyebrow">{locale === "ar" ? "المجتمع" : "Community"}</p>
            <h2 className="section-title mt-4">
              {locale === "ar" ? "محبوب في بيوت حقيقية." : "Loved in real homes."}
            </h2>
            <p className="section-subtitle">
              {locale === "ar"
                ? "آراء العملاء وصور قطعهم بعد الاستلام — كلها مُراجعة ومعتمدة من الإدارة."
                : "Client reviews and photographs of their pieces at home — all reviewed and approved by the gallery."}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <Link
              href={`/${locale}/wall`}
              className="group flex flex-col justify-between border border-line bg-white p-7 transition-colors hover:border-brass/60 md:p-10"
            >
              <div>
                <div className="flex items-start justify-between gap-6">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-brass">
                    {locale === "ar" ? "حائط العملاء" : "Customer wall"}
                  </span>
                  <span className="grid h-8 w-8 place-items-center border border-line text-muted transition-colors group-hover:border-brass group-hover:bg-brass group-hover:text-ink">
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="mt-8 font-display text-2xl leading-tight text-ink sm:text-3xl">
                  {locale === "ar" ? "شاهد القطع في مساحات حقيقية." : "See the pieces in real spaces."}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-muted">{t.sections.wallText}</p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink">
                {t.nav.wall}
                <ArrowIcon className="h-3.5 w-3.5" />
              </span>
            </Link>

            <Link
              href={`/${locale}/reviews`}
              className="group flex flex-col justify-between border border-line bg-white p-7 transition-colors hover:border-brass/60 md:p-10"
            >
              <div>
                <div className="flex items-start justify-between gap-6">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-brass">
                    {locale === "ar" ? "آراء العملاء" : "Client reviews"}
                  </span>
                  <QuoteIcon className="h-6 w-6 text-brass/70" />
                </div>
                <h3 className="mt-8 font-display text-2xl leading-tight text-ink sm:text-3xl">
                  {locale === "ar" ? "ثقة تُبنى قطعة بعد قطعة." : "Trust, built piece by piece."}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-muted">
                  {locale === "ar"
                    ? "آراء العملاء وملاحظاتهم حول المنصة والقطع، تُنشر بعد مراجعة الإدارة."
                    : "Client feedback on the gallery and individual pieces, published after gallery review."}
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink">
                {t.nav.reviews}
                <ArrowIcon className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Closing invitation */}
      <section className="relative overflow-hidden bg-burgundy text-cream">
        <div className="ornament-faint absolute inset-0 opacity-25" aria-hidden />
        <div className="container-page relative flex flex-col items-start justify-between gap-7 py-14 md:flex-row md:items-center md:py-16">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-cream/55">
              {locale === "ar" ? "طلبات خاصة واستفسارات" : "Commissions & questions"}
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-cream sm:text-4xl">
              {locale === "ar"
                ? "هل تبحث عن قطعة تُصنع خصيصًا لك؟"
                : "Looking for something made just for you?"}
            </h2>
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-lg">
            <WhatsAppIcon className="h-4 w-4" />
            {locale === "ar" ? "ابدأ المحادثة" : "Start a conversation"}
          </a>
        </div>
      </section>
    </div>
  );
}

function Callout({ locale, whatsappDisplay }: { locale: Locale; whatsappDisplay: string }) {
  return (
    <div className="flex items-center gap-3 border border-line bg-cream px-4 py-3">
      <span className="grid h-8 w-8 place-items-center bg-brass-soft text-brass-ink">
        <WhatsAppIcon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-muted">
          {locale === "ar" ? "واتساب مباشر" : "Direct WhatsApp"}
        </p>
        <p className="mt-0.5 text-sm text-ink" dir="ltr">
          {whatsappDisplay}
        </p>
      </div>
    </div>
  );
}