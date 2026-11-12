"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || `/${locale}`;
  const rest = pathname.replace(/^\/(en|ar)/, "") || "";

  return (
    <nav
      aria-label="Language"
      className="flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.18em]"
    >
      {locales.map((l, index) => {
        const href = `/${l}${rest}`;
        const active = l === locale;
        return (
          <span key={l} className="flex items-center gap-2">
            {index > 0 && <span className="h-3 w-px bg-line" aria-hidden />}
            <Link
              href={href}
              aria-current={active ? "true" : undefined}
              className={
                active
                  ? "text-ink underline decoration-brass decoration-1 underline-offset-4"
                  : "text-muted transition-colors hover:text-ink"
              }
            >
              {l === "en" ? "EN" : "عربي"}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}