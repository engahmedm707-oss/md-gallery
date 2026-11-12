import Image from "next/image";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { CheckIcon, QuoteIcon } from "@/components/Icons";
import type { Locale } from "@/lib/i18n/config";

export function AuthShell({
  locale,
  title,
  subtitle,
  children,
  footer,
}: {
  locale: Locale;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const points =
    locale === "ar"
      ? ["تقييمات وصور عملاء معتمدة", "متابعة الطلبات والاستفسارات", "تجربة كاملة بالعربية والإنجليزية"]
      : ["Moderated reviews and client photos", "Follow inquiries and contributions", "A fully bilingual experience"];

  return (
    <section className="container-page py-10 md:py-14">
      <div className="grid overflow-hidden border border-line bg-white lg:grid-cols-[1.05fr_1fr]">
        <div className="flex items-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            <div>
              <Link href={`/${locale}`} className="inline-flex" aria-label="MD Gallery home">
                <BrandMark size="sm" />
              </Link>
            </div>

            <p className="eyebrow mt-10">{locale === "ar" ? "حساب العميل" : "Client access"}</p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-[2.75rem]">
              {title}
            </h1>
            <p className="mt-3 text-[13px] leading-7 text-muted">{subtitle}</p>

            <div className="mt-8">{children}</div>
            <div className="mt-6 text-[12px] leading-6 text-muted">{footer}</div>
          </div>
        </div>

        <aside className="relative hidden overflow-hidden bg-ink text-cream lg:block">
          <Image
            src="/demo/painting-2.svg"
            alt=""
            fill
            sizes="(max-width: 1024px) 0vw, 45vw"
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/85 to-ink/50" />
          <div className="grain" aria-hidden />

          <div className="relative z-10 flex min-h-[620px] flex-col justify-between p-10 xl:p-12">
            <div>
              <QuoteIcon className="h-8 w-8 text-brass/80" />
              <blockquote className="mt-7 font-display text-3xl leading-[1.25] text-cream xl:text-[2.15rem]">
                {locale === "ar"
                  ? "لكل قطعة حضور هادئ، وللتفاصيل الصغيرة أثر يدوم."
                  : "Every piece has a quiet presence, and the smallest details are the ones that stay."}
              </blockquote>
              <p className="mt-5 max-w-sm text-[12px] leading-7 text-cream/55">
                {locale === "ar"
                  ? "انضم إلى مجتمع MD Gallery لمشاركة تجربتك، وحفظ قطعك المفضلة، والتواصل معنا مباشرة."
                  : "Join the MD Gallery community to share your experience, keep the pieces you love close, and speak with us directly."}
              </p>
            </div>

            <div className="border-t border-brass/30 pt-6">
              <ul className="space-y-3">
                {points.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-[12px] text-cream/75">
                    <span className="grid h-5 w-5 shrink-0 place-items-center bg-brass text-ink">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-7 text-[8px] font-semibold uppercase tracking-[0.24em] text-cream/30">
                MD Gallery · {locale === "ar" ? "فن وحِرفة" : "Art & Objects"}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}