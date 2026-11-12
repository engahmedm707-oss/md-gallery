import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSiteSettings } from "@/lib/data";
import { getViewer } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { isRTL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "MD Gallery | Curated Art & Handcrafted Objects",
  description:
    "MD Gallery — paintings, handcrafted tables, crochet and decor. Prices in EGP, direct WhatsApp inquiries.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const dir = isRTL(locale) ? "rtl" : "ltr";
  const settings = await getSiteSettings();
  const { user, profile } = await getViewer();
  const whatsappDisplay = settings.whatsapp_number || "01151515676";
  const whatsappIntl = settings.whatsapp_number_intl || "201151515676";

  return (
    <div dir={dir} lang={locale} className="flex min-h-screen flex-col bg-paper">
      <SiteHeader
        locale={locale}
        nav={t.nav}
        whatsappDisplay={whatsappDisplay}
        whatsappIntl={whatsappIntl}
        isAdmin={profile?.role === "admin"}
        isLoggedIn={Boolean(user)}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter
        locale={locale}
        whatsappDisplay={whatsappDisplay}
        whatsappIntl={whatsappIntl}
        instagramUrl={(settings as { instagram_url?: string | null }).instagram_url}
        facebookUrl={(settings as { facebook_url?: string | null }).facebook_url}
      />
    </div>
  );
}