"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ArrowIcon, CloseIcon, MenuIcon, WhatsAppIcon } from "@/components/Icons";
import type { Locale } from "@/lib/i18n/config";

type NavLabels = {
  home: string;
  gallery: string;
  wall: string;
  reviews: string;
  login: string;
  admin: string;
  profile: string;
};

export function SiteHeader({
  locale,
  nav,
  whatsappDisplay,
  whatsappIntl,
  isAdmin = false,
  isLoggedIn = false,
}: {
  locale: Locale;
  nav: NavLabels;
  whatsappDisplay: string;
  whatsappIntl: string;
  isAdmin?: boolean;
  isLoggedIn?: boolean;
}) {
  const pathname = usePathname() || `/${locale}`;
  const [open, setOpen] = useState(false);
  const base = `/${locale}`;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const links = [
    { href: base, label: nav.home, exact: true },
    { href: `${base}/gallery`, label: nav.gallery },
    { href: `${base}/wall`, label: nav.wall },
    { href: `${base}/reviews`, label: nav.reviews },
    {
      href: isLoggedIn ? `${base}/profile` : `${base}/auth/login`,
      label: isLoggedIn ? nav.profile : nav.login,
    },
  ];

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const tagline =
    locale === "ar"
      ? "قطع مختارة بعناية · أسعار بالجنيه المصري · استفسار عبر واتساب"
      : "Curated pieces · Prices in EGP · Inquiries via WhatsApp";

  const waHref = `https://wa.me/${whatsappIntl.replace(/[^\d]/g, "")}`;

  return (
    <>
      <div className="hidden bg-ink text-cream md:block">
        <div className="container-page flex h-9 items-center justify-between gap-6 text-[9px] font-medium uppercase tracking-[0.18em] text-cream/65">
          <p>{tagline}</p>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-brass transition-colors hover:text-cream"
          >
            <WhatsAppIcon className="h-3 w-3" />
            <span dir="ltr">{whatsappDisplay}</span>
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-line-soft bg-paper/90 backdrop-blur-md">
        <div className="container-page relative flex h-[74px] items-center justify-between gap-6">
          <Link href={base} className="shrink-0" aria-label="MD Gallery home">
            <BrandMark size="sm" />
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex" aria-label="Main">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-item"
                data-active={isActive(link.href, link.exact)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 sm:gap-5">
            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  className="hidden text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink lg:inline-flex"
                >
                  {nav.admin}
                </Link>
                <span className="hidden h-4 w-px bg-line lg:block" aria-hidden />
              </>
            )}
            <LanguageSwitcher locale={locale} />
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="grid h-9 w-9 place-items-center border border-line text-ink transition-colors hover:border-ink lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {open && (
          <div id="mobile-menu" className="animate-fade-in border-t border-line-soft bg-paper lg:hidden">
            <nav className="container-page py-3" aria-label="Mobile">
              {links.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between border-b border-line-soft py-3.5 text-[12px] font-medium uppercase tracking-[0.12em] text-ink"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-[9px] text-brass">{String(index + 1).padStart(2, "0")}</span>
                    {link.label}
                  </span>
                  <ArrowIcon className="h-4 w-4 text-muted" />
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center justify-between border-b border-line-soft py-3.5 text-[12px] font-medium uppercase tracking-[0.12em] text-ink"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-[9px] text-brass">
                      {String(links.length + 1).padStart(2, "0")}
                    </span>
                    {nav.admin}
                  </span>
                  <ArrowIcon className="h-4 w-4 text-muted" />
                </Link>
              )}
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-block mt-5"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                {whatsappDisplay}
              </a>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}