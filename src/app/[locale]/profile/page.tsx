import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/PageHeader";
import { Stars } from "@/components/Stars";
import { ArrowUpRightIcon, WhatsAppIcon } from "@/components/Icons";
import { signOut } from "./actions";

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || "MD";
}

function statusChipClass(status: string) {
  return status === "approved" ? "chip chip-ink" : status === "rejected" ? "chip" : "chip chip-brass";
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getDictionary(locale);
  const { user, profile } = await getViewer();

  if (!user) redirect(`/${locale}/auth/login`);

  let reviews: any[] = [];
  let wallPosts: any[] = [];
  let reviewCount = 0;
  let wallCount = 0;
  let eligibleCount = 0;

  try {
    const supabase = await createClient();
    const [reviewResult, wallResult, eligibilityResult] = await Promise.all([
      supabase
        .from("reviews")
        .select("id,type,rating,body,status,created_at", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("wall_posts")
        .select("id,caption,status,created_at", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("purchase_eligibility")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    reviews = reviewResult.data || [];
    wallPosts = wallResult.data || [];
    reviewCount = reviewResult.count || 0;
    wallCount = wallResult.count || 0;
    eligibleCount = eligibilityResult.count || 0;
  } catch {
    // Keep the account page usable even if a query fails.
  }

  const settings = await getSiteSettings();
  const waHref = `https://wa.me/${(settings.whatsapp_number_intl || "201151515676").replace(/[^\d]/g, "")}`;
  const displayName =
    profile?.display_name ||
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    (locale === "ar" ? "عميل" : "Client");
  const email = profile?.email || user.email || "—";
  const isAdmin = profile?.role === "admin";
  const memberSince = formatDate(profile?.created_at || user.created_at, locale);

  const statusLabel = (status: string) =>
    status === "approved"
      ? locale === "ar"
        ? "معتمد"
        : "Approved"
      : status === "rejected"
        ? locale === "ar"
          ? "مرفوض"
          : "Rejected"
        : locale === "ar"
          ? "بانتظار المراجعة"
          : "Pending review";

  const stats = [
    {
      label: locale === "ar" ? "التقييمات" : "Reviews",
      value: reviewCount,
      note: locale === "ar" ? "مشاركاتك في تقييمات المعرض" : "Your gallery submissions",
      href: `/${locale}/reviews`,
    },
    {
      label: locale === "ar" ? "صور الحائط" : "Wall photos",
      value: wallCount,
      note: locale === "ar" ? "صورك المنشورة أو قيد المراجعة" : "Published or awaiting review",
      href: `/${locale}/wall`,
    },
    {
      label: locale === "ar" ? "قطع مؤهلة" : "Eligible pieces",
      value: eligibleCount,
      note: locale === "ar" ? "قطع تمت الموافقة على صورها" : "Purchases approved for the wall",
      href: `/${locale}/wall`,
    },
  ];

  return (
    <div className="bg-paper">
      <PageHeader
        locale={locale}
        eyebrow={locale === "ar" ? "حسابك" : "Your account"}
        title={t.nav.profile}
        description={
          locale === "ar"
            ? "بياناتك ومساهماتك في المعرض وصلاحياتك في مكان واحد."
            : "Your details, gallery contributions and posting access in one place."
        }
      >
        <div className="flex items-center gap-3 border border-brass/45 bg-cream/5 px-4 py-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brass/40 bg-brass/10 font-display text-lg text-brass">
            {initials(displayName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-cream">
              {displayName}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-cream/45">{email}</p>
          </div>
        </div>
      </PageHeader>

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <aside className="space-y-5 lg:col-span-4">
            <div className="border border-line bg-white p-6">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink font-display text-xl text-cream">
                  {initials(displayName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-2xl leading-tight text-ink">{displayName}</p>
                  <p className="mt-1 truncate text-[11px] text-muted">{email}</p>
                </div>
              </div>

              <dl className="mt-6 space-y-3 border-t border-line-soft pt-5 text-[11px]">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">{locale === "ar" ? "عضو منذ" : "Member since"}</dt>
                  <dd className="font-medium text-ink">{memberSince}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">{locale === "ar" ? "نوع الحساب" : "Account type"}</dt>
                  <dd>
                    <span className={isAdmin ? "chip chip-ink" : "chip chip-brass"}>
                      {isAdmin
                        ? locale === "ar"
                          ? "مسؤول"
                          : "Administrator"
                        : locale === "ar"
                          ? "عميل"
                          : "Client"}
                    </span>
                  </dd>
                </div>
              </dl>

              {isAdmin && (
                <Link href="/admin" className="btn btn-outline btn-block btn-sm mt-5">
                  {locale === "ar" ? "لوحة الإدارة" : "Admin dashboard"}
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            <div className="border border-line bg-white p-6">
              <p className="eyebrow">{locale === "ar" ? "اختصارات" : "Quick links"}</p>
              <div className="mt-4 space-y-1">
                {[
                  {
                    href: `/${locale}/gallery`,
                    label: locale === "ar" ? "تصفح المعرض" : "Browse the gallery",
                  },
                  {
                    href: `/${locale}/reviews`,
                    label: locale === "ar" ? "تقييمات المعرض" : "Gallery reviews",
                  },
                  {
                    href: `/${locale}/wall`,
                    label: locale === "ar" ? "حائط العملاء" : "Customer wall",
                  },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between border-b border-line-soft py-2.5 text-[11.5px] text-ink transition-colors last:border-0 hover:text-burgundy"
                  >
                    {link.label}
                    <ArrowUpRightIcon className="h-3.5 w-3.5 text-muted" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="border border-line bg-cream p-6">
              <p className="text-[11px] leading-6 text-muted">
                {locale === "ar"
                  ? "هل تحتاج مساعدة بخصوص طلب أو قطعة؟ تواصل معنا مباشرة."
                  : "Need help with an order or a piece? Speak with us directly."}
              </p>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-block btn-sm mt-4"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                {settings.whatsapp_number || "01151515676"}
              </a>
            </div>

            <form action={signOut}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="btn btn-outline btn-block btn-sm">
                {t.nav.logout}
              </button>
            </form>
          </aside>

          <div className="space-y-6 lg:col-span-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="group border border-line bg-white p-5 transition-colors hover:border-brass/60"
                >
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">
                    {stat.label}
                  </p>
                  <p className="mt-3 font-display text-4xl leading-none text-ink">{stat.value}</p>
                  <p className="mt-3 text-[10.5px] leading-5 text-muted">{stat.note}</p>
                </Link>
              ))}
            </div>

            <div className="border border-line bg-white">
              <div className="flex items-center justify-between gap-4 border-b border-line-soft px-6 py-4">
                <h2 className="font-display text-2xl text-ink">
                  {locale === "ar" ? "آخر تقييماتك" : "Your latest reviews"}
                </h2>
                <Link
                  href={`/${locale}/reviews`}
                  className="text-[9px] font-semibold uppercase tracking-[0.14em] text-brass-ink transition-colors hover:text-ink"
                >
                  {locale === "ar" ? "كل التقييمات" : "All reviews"}
                </Link>
              </div>

              {reviews.length ? (
                <ul className="divide-y divide-line-soft">
                  {reviews.map((review) => (
                    <li key={review.id} className="px-6 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Stars value={Number(review.rating)} size="sm" />
                          <span className={statusChipClass(review.status)}>
                            {statusLabel(review.status)}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.12em] text-muted">
                          {formatDate(review.created_at, locale)}
                        </span>
                      </div>
                      <p className="mt-2 text-[12px] leading-6 text-ink/80">{review.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="font-display text-2xl text-ink">
                    {locale === "ar" ? "لا توجد تقييمات بعد" : "No reviews yet"}
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-[11.5px] leading-6 text-muted">
                    {locale === "ar"
                      ? "شاركنا تجربتك مع قطعة من المعرض، وسيظهر تقييمك بعد المراجعة."
                      : "Share your experience with a gallery piece. It will appear after review."}
                  </p>
                  <Link href={`/${locale}/reviews`} className="btn btn-outline btn-sm mt-4">
                    {locale === "ar" ? "أضف تقييمًا" : "Leave a review"}
                  </Link>
                </div>
              )}
            </div>

            <div className="border border-line bg-white">
              <div className="flex items-center justify-between gap-4 border-b border-line-soft px-6 py-4">
                <h2 className="font-display text-2xl text-ink">
                  {locale === "ar" ? "صورك على الحائط" : "Your wall photos"}
                </h2>
                <Link
                  href={`/${locale}/wall`}
                  className="text-[9px] font-semibold uppercase tracking-[0.14em] text-brass-ink transition-colors hover:text-ink"
                >
                  {locale === "ar" ? "زيارة الحائط" : "Visit the wall"}
                </Link>
              </div>

              {wallPosts.length ? (
                <ul className="divide-y divide-line-soft">
                  {wallPosts.map((post) => (
                    <li key={post.id} className="flex items-start justify-between gap-4 px-6 py-4">
                      <div className="min-w-0">
                        <p className="text-[12px] leading-6 text-ink/80">
                          {post.caption || (locale === "ar" ? "صورة بدون وصف" : "Untitled photo")}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">
                          {formatDate(post.created_at, locale)}
                        </p>
                      </div>
                      <span className={statusChipClass(post.status)}>{statusLabel(post.status)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="font-display text-2xl text-ink">
                    {locale === "ar" ? "لم تشارك صورًا بعد" : "No wall photos yet"}
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-[11.5px] leading-6 text-muted">
                    {locale === "ar"
                      ? "بعد اعتماد أهلية الشراء، يمكنك رفع صورة لقطعتك إلى حائط العملاء."
                      : "Once your purchase eligibility is approved, you can upload a photo of your piece to the customer wall."}
                  </p>
                  <Link href={`/${locale}/wall`} className="btn btn-outline btn-sm mt-4">
                    {locale === "ar" ? "طلب أهلية النشر" : "Request posting access"}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}