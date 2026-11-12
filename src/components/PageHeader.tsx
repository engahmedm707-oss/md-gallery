import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

export function PageHeader({
  locale,
  eyebrow,
  title,
  description,
  children,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  const home = locale === "ar" ? "الرئيسية" : "Home";

  return (
    <section className="relative overflow-hidden bg-ink text-cream">
      <div className="ornament-faint absolute inset-0 opacity-30" aria-hidden />
      <div
        className="absolute -end-24 -top-28 h-80 w-80 rounded-full border border-cream/10"
        aria-hidden
      />
      <div
        className="absolute -end-10 -top-14 h-56 w-56 rounded-full border border-brass/25"
        aria-hidden
      />
      <div className="container-page relative py-14 md:py-20">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2.5 text-[9px] font-medium uppercase tracking-[0.2em] text-cream/40"
        >
          <Link href={`/${locale}`} className="transition-colors hover:text-cream">
            {home}
          </Link>
          <span className="text-brass/60" aria-hidden>
            /
          </span>
          <span className="text-cream/75">{title}</span>
        </nav>

        <div className="mt-10 flex flex-col gap-8 md:mt-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow !text-brass">{eyebrow}</p>
            <h1 className="page-title mt-4">{title}</h1>
            {description && (
              <p className="mt-5 max-w-2xl text-sm leading-7 text-cream/60 md:text-[15px] md:leading-8">
                {description}
              </p>
            )}
          </div>
          {children && <div className="shrink-0">{children}</div>}
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brass/50 to-transparent" aria-hidden />
    </section>
  );
}