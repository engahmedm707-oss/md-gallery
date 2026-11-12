import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { getPublicItems } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { Stars } from "@/components/Stars";
import { ArrowIcon, CheckIcon } from "@/components/Icons";
import { submitReview, submitReply } from "../actions";
import { isUuid } from "@/lib/utils";

function formatDate(value: string, locale: Locale) {
  return new Date(value).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function initials(name?: string | null) {
  if (!name) return "MD";
  return name.trim().slice(0, 2).toUpperCase();
}

export default async function ReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getDictionary(locale);
  let reviews: any[] = [];
  let replies: any[] = [];
  let user: any = null;
  let items: any[] = [];
  try {
    const supabase = await createClient();
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    user = u;
    const [r, rep] = await Promise.all([
      supabase
        .from("reviews")
        .select("*, profiles(display_name), items(name_en,name_ar)")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("review_replies")
        .select("*, profiles(display_name)")
        .eq("status", "approved")
        .order("created_at", { ascending: true }),
    ]);
    reviews = r.data || [];
    replies = rep.data || [];
    items = await getPublicItems();
  } catch {}

  const repliesByReview = replies.reduce((acc: any, rep: any) => {
    (acc[rep.review_id] ||= []).push(rep);
    return acc;
  }, {});

  // Demo catalogue entries have non-UUID ids and cannot be linked to reviews.
  const reviewableItems = items.filter((it: any) => isUuid(String(it.id)));

  const average = reviews.length
    ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length
    : 0;

  return (
    <div className="bg-paper">
      <PageHeader
        locale={locale}
        eyebrow={locale === "ar" ? "آراء العملاء" : "Client feedback"}
        title={t.sections.platformReviews}
        description={
          locale === "ar"
            ? "تقييمات وردود معتمدة من الإدارة فقط. سجّل الدخول للمشاركة، وتخضع كل المشاركات للمراجعة قبل النشر."
            : "Only admin-approved reviews and replies are published. Log in to contribute — every submission is reviewed before it appears."
        }
      >
        <div className="flex items-center gap-5 border border-brass/45 px-6 py-4">
          <p className="font-display text-4xl leading-none text-cream">
            {reviews.length ? average.toFixed(1) : "—"}
          </p>
          <div>
            <Stars value={average} size="md" />
            <p className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-cream/45">
              {reviews.length} {locale === "ar" ? "تقييم معتمد" : "approved reviews"}
            </p>
          </div>
        </div>
      </PageHeader>

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-line-soft pb-4">
              <h2 className="font-display text-2xl text-ink">
                {locale === "ar" ? "ماذا قال العملاء" : "What clients are saying"}
              </h2>
              <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                <CheckIcon className="h-3.5 w-3.5 text-brass" />
                {locale === "ar" ? "مراجع من المعرض" : "Gallery moderated"}
              </span>
            </div>

            {reviews.length ? (
              <div className="space-y-4">
                {reviews.map((r: any) => {
                  const person = r.profiles?.display_name || (locale === "ar" ? "عميل" : "Customer");
                  const itemName =
                    r.type === "product"
                      ? locale === "ar"
                        ? r.items?.name_ar
                        : r.items?.name_en
                      : locale === "ar"
                        ? "تقييم المنصة"
                        : "Platform review";
                  return (
                    <article key={r.id} className="border border-line bg-white p-5 sm:p-6">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand font-display text-lg text-ink">
                            {initials(r.profiles?.display_name)}
                          </span>
                          <div>
                            <p className="text-[13px] font-semibold text-ink">{person}</p>
                            <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted">
                              {formatDate(r.created_at, locale)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Stars value={Number(r.rating)} size="sm" />
                          <span className="chip">{itemName}</span>
                        </div>
                      </div>

                      <p className="mt-4 text-[13px] leading-7 text-ink/85">{r.body}</p>

                      {(repliesByReview[r.id] || []).length > 0 && (
                        <div className="mt-4 space-y-3 border-s-2 border-brass/40 bg-cream/60 py-3 pe-3 ps-4">
                          {repliesByReview[r.id].map((rep: any) => (
                            <div key={rep.id}>
                              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-brass-ink">
                                {rep.profiles?.display_name || (locale === "ar" ? "مستخدم" : "User")}
                              </p>
                              <p className="mt-1 text-[12px] leading-6 text-muted">{rep.body}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {user && (
                        <form action={submitReply} className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <input type="hidden" name="review_id" value={r.id} />
                          <label className="sr-only" htmlFor={`reply-${r.id}`}>
                            {t.review.reply}
                          </label>
                          <input
                            id={`reply-${r.id}`}
                            name="body"
                            className="input flex-1"
                            placeholder={t.review.reply}
                            required
                          />
                          <button className="btn btn-outline btn-sm shrink-0" type="submit">
                            {t.review.reply}
                          </button>
                        </form>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="ornament border border-line bg-cream px-6 py-20 text-center">
                <p className="font-display text-3xl text-ink">
                  {locale === "ar" ? "لا توجد تقييمات معتمدة بعد." : "No approved reviews yet."}
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
                  {locale === "ar"
                    ? "كن أول من يشارك تجربته. سجّل الدخول وأرسل تقييمك، وسيظهر بعد المراجعة."
                    : "Be the first to share your experience. Log in, submit a review, and it will appear after review."}
                </p>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="border border-line bg-white p-6 lg:sticky lg:top-28">
              <p className="eyebrow">{locale === "ar" ? "شاركنا" : "Share yours"}</p>
              <h2 className="mt-3 font-display text-2xl text-ink">{t.review.leave}</h2>

              {!user ? (
                <>
                  <p className="mt-2 text-[12px] leading-6 text-muted">{t.review.loginRequired}</p>
                  <Link href={`/${locale}/auth/login`} className="btn btn-primary btn-block mt-5">
                    {t.auth.login}
                    <ArrowIcon className="h-3.5 w-3.5" />
                  </Link>
                  <p className="mt-3 text-[11px] leading-5 text-muted">
                    {locale === "ar"
                      ? "ليست لديك حساب؟ يمكنك إنشاء حساب جديد في دقيقة."
                      : "New here? Creating an account takes a minute."}
                  </p>
                </>
              ) : (
                <form action={submitReview} className="mt-5 space-y-4">
                  <div>
                    <label className="label" htmlFor="review-type">
                      {locale === "ar" ? "نوع التقييم" : "Review type"}
                    </label>
                    <select id="review-type" name="type" className="input" defaultValue="platform">
                      <option value="platform">{locale === "ar" ? "المنصة" : "The gallery"}</option>
                      <option value="product">{locale === "ar" ? "منتج" : "A product"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="review-item">
                      {locale === "ar" ? "المنتج (للتقييم المنتج)" : "Product (for product review)"}
                    </label>
                    <select id="review-item" name="item_id" className="input">
                      <option value="">—</option>
                      {reviewableItems.map((it: any) => (
                        <option key={it.id} value={it.id}>
                          {locale === "ar" ? it.name_ar : it.name_en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="review-rating">
                      {t.review.rating}
                    </label>
                    <select id="review-rating" name="rating" className="input" defaultValue={5}>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating} / 5 —{" "}
                          {locale === "ar"
                            ? ["", "ضعيف", "مقبول", "جيد", "جيد جدًا", "ممتاز"][rating]
                            : ["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="review-body">
                      {t.review.comment}
                    </label>
                    <textarea id="review-body" name="body" className="input" rows={4} required />
                  </div>
                  <button className="btn btn-primary btn-block" type="submit">
                    {t.auth.submit}
                  </button>
                  <p className="flex items-start gap-2 text-[11px] leading-5 text-muted">
                    <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" />
                    {t.review.pending}
                  </p>
                </form>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}