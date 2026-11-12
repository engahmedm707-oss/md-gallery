import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/Icons";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export function SiteFooter({
  locale,
  whatsappDisplay,
  whatsappIntl,
  instagramUrl,
  facebookUrl,
}: {
  locale: Locale;
  whatsappDisplay: string;
  whatsappIntl: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
}) {
  const t = getDictionary(locale);
  const base = `/${locale}`;
  const year = new Date().getFullYear();
  const wa = `https://wa.me/${whatsappIntl.replace(/[^\d]/g, "")}`;

  return (
    <footer className="relative overflow-hidden bg-ink text-cream">
      <div className="grain" aria-hidden />
      <div className="container-page relative">
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-20">
          <div className="lg:col-span-5">
            <BrandMark size="md" tone="light" />
            <p className="mt-6 max-w-sm text-sm leading-7 text-cream/60">{t.sections.aboutText}</p>
            <div className="mt-7 flex items-center gap-2.5">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="grid h-9 w-9 place-items-center border border-brass/55 text-cream/70 transition-colors hover:border-brass hover:text-brass"
              >
                <WhatsAppIcon />
              </a>
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="grid h-9 w-9 place-items-center border border-brass/55 text-cream/70 transition-colors hover:border-brass hover:text-brass"
                >
                  <InstagramIcon />
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="grid h-9 w-9 place-items-center border border-brass/55 text-cream/70 transition-colors hover:border-brass hover:text-brass"
                >
                  <FacebookIcon />
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-brass">
              {locale === "ar" ? "استكشف" : "Explore"}
            </p>
            <ul className="mt-5 space-y-3 text-sm text-cream/65">
              <li>
                <Link href={`${base}/gallery`} className="transition-colors hover:text-cream">
                  {t.nav.gallery}
                </Link>
              </li>
              <li>
                <Link href={`${base}/wall`} className="transition-colors hover:text-cream">
                  {t.nav.wall}
                </Link>
              </li>
              <li>
                <Link href={`${base}/reviews`} className="transition-colors hover:text-cream">
                  {t.nav.reviews}
                </Link>
              </li>
              <li>
                <Link href={`${base}/auth/login`} className="transition-colors hover:text-cream">
                  {t.nav.login}
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-brass">
              {locale === "ar" ? "المساعدة" : "Service"}
            </p>
            <ul className="mt-5 space-y-3 text-sm text-cream/65">
              <li>{locale === "ar" ? "الاستفسار عبر واتساب" : "WhatsApp inquiries"}</li>
              <li>{locale === "ar" ? "أسعار واضحة بالجنيه" : "Clear EGP pricing"}</li>
              <li>{locale === "ar" ? "قطع حسب الطلب" : "Made-to-order pieces"}</li>
              <li>{locale === "ar" ? "توصيل بالتنسيق" : "Coordinated delivery"}</li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-brass">
              {locale === "ar" ? "تواصل" : "Contact"}
            </p>
            <p className="mt-5 text-sm leading-7 text-cream/65">
              {locale === "ar"
                ? "للطلب أو الاستفسار عن قطعة، راسلنا مباشرة على واتساب."
                : "For a piece, a commission or a question, message us directly on WhatsApp."}
            </p>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 border-b border-brass/40 pb-1 text-sm text-cream transition-colors hover:border-brass hover:text-brass"
              dir="ltr"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              {whatsappDisplay}
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-brass/30 py-6 text-[9px] uppercase tracking-[0.18em] text-cream/35 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} MD Gallery. {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <p>{locale === "ar" ? "صُنع بعناية · فن وحِرفة" : "Made with care · Art & craft"}</p>
        </div>
      </div>
    </footer>
  );
}