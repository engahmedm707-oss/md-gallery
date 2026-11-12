import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { getPublicItems } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { ArrowIcon, CheckIcon } from "@/components/Icons";
import { submitEligibilityRequest, submitWallPost } from "../actions";
import { isUuid } from "@/lib/utils";

export default async function WallPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = getDictionary(locale);
  let posts: any[] = [];
  let user: any = null;
  let eligibleItemIds: string[] = [];
  let items: any[] = [];
  try {
    const supabase = await createClient();
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    user = u;
    const { data } = await supabase
      .from("wall_posts")
      .select("*, profiles(display_name), items(name_en,name_ar)")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);
    posts = data || [];
    items = await getPublicItems();
    if (u) {
      const { data: grants } = await supabase
        .from("purchase_eligibility")
        .select("item_id")
        .eq("user_id", u.id);
      eligibleItemIds = (grants || []).map((g: any) => g.item_id);
    }
  } catch {
    items = await getPublicItems();
  }

  const eligibleItems = items.filter((i: any) => eligibleItemIds.includes(i.id));
  // Demo catalogue entries have non-UUID ids; never offer them in forms that
  // write to the database.
  const requestableItems = items.filter((i: any) => isUuid(String(i.id)));
  const steps =
    locale === "ar"
      ? [
          "سجّل الدخول إلى حسابك.",
          "أرسل تفاصيل الشراء لطلب أهلية النشر لقطعة محددة.",
          "ارفع صورتك بعد الموافقة، وستظهر بعد مراجعة الإدارة.",
        ]
      : [
          "Sign in to your account.",
          "Submit purchase details to request wall access for a specific piece.",
          "Upload your photo once approved — it appears after gallery review.",
        ];

  return (
    <div className="bg-paper">
      <PageHeader
        locale={locale}
        eyebrow={locale === "ar" ? "المجتمع" : "Community"}
        title={t.sections.wall}
        description={
          locale === "ar"
            ? "صور من عملاء MD Gallery في مساحاتهم. تُنشر الصور المعتمدة فقط، وبعد التحقق من أهلية الشراء لكل قطعة."
            : "Photographs from MD Gallery clients in their own spaces. Only approved images are published, after purchase eligibility is verified for the piece."
        }
      />

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-line-soft pb-4">
              <h2 className="font-display text-2xl text-ink">
                {locale === "ar" ? "من بيوت العملاء" : "From our clients' homes"}
              </h2>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
                {posts.length} {locale === "ar" ? "صورة" : "photos"}
              </span>
            </div>

            {posts.length ? (
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                {posts.map((p: any) => {
                  const url = p.image_path
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wall-images/${p.image_path}`
                    : null;
                  return (
                    <article key={p.id} className="border border-line bg-white">
                      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                        {url ? (
                          <Image
                            src={url}
                            alt={p.caption || "Customer wall photo"}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 30vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="ornament absolute inset-0 flex items-center justify-center text-sm text-muted">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-display text-lg leading-tight text-ink">
                              {locale === "ar" ? p.items?.name_ar : p.items?.name_en}
                            </h3>
                            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted">
                              {p.profiles?.display_name || (locale === "ar" ? "عميل" : "Customer")}
                            </p>
                          </div>
                          <span className="chip chip-brass shrink-0">
                            {locale === "ar" ? "معتمد" : "Approved"}
                          </span>
                        </div>
                        {p.caption && (
                          <p className="mt-3 border-t border-line-soft pt-3 text-[12px] leading-6 text-muted">
                            {p.caption}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="ornament border border-line bg-cream px-6 py-20 text-center">
                <p className="font-display text-3xl text-ink">
                  {locale === "ar" ? "الحائط ينتظر أول صورة." : "The wall is waiting for its first photo."}
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
                  {locale === "ar"
                    ? "بعد شراء قطعة، اطلب أهلية النشر من النموذج المجاور وارفع صورتك. ستظهر هنا بعد الموافقة."
                    : "After purchasing a piece, request posting access in the form beside this wall and upload your photo. It will appear here once approved."}
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-5 lg:col-span-4">
            <div className="border border-line bg-white p-6">
              <p className="eyebrow">{locale === "ar" ? "كيف يعمل الحائط" : "How the wall works"}</p>
              <ol className="mt-5 space-y-4">
                {steps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center border border-brass/40 bg-brass-soft text-[9px] font-bold text-brass-ink">
                      {index + 1}
                    </span>
                    <span className="text-[12px] leading-6 text-muted">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border border-line bg-white p-6">
              <h2 className="font-display text-xl text-ink">{t.wall.requestEligibility}</h2>
              <p className="mt-2 text-[12px] leading-6 text-muted">
                {locale === "ar"
                  ? "أخبرنا بالقطعة التي اشتريتها ومرجع الشراء، لنراجع الطلب ونمنحك صلاحية النشر."
                  : "Tell us which piece you purchased and your purchase reference. We review it and grant posting access."}
              </p>

              {!user ? (
                <div className="mt-5">
                  <p className="text-[12px] leading-6 text-muted">
                    {locale === "ar"
                      ? "يرجى تسجيل الدخول لطلب أهلية النشر على الحائط."
                      : "Please log in to request posting access for the wall."}
                  </p>
                  <Link href={`/${locale}/auth/login`} className="btn btn-primary btn-block mt-4">
                    {t.auth.login}
                    <ArrowIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : requestableItems.length === 0 ? (
                <p className="mt-5 border-t border-line-soft pt-4 text-[12px] leading-6 text-muted">
                  {locale === "ar"
                    ? "لا توجد قطع متاحة لطلبات الأهلية حاليًا. أضف قطعة من لوحة الإدارة أولًا."
                    : "No pieces are available for eligibility requests yet. Add a piece from the admin panel first."}
                </p>
              ) : (
                <form action={submitEligibilityRequest} className="mt-5 space-y-4">
                  <div>
                    <label className="label" htmlFor="eligibility-item">
                      {locale === "ar" ? "القطعة المشتراة" : "Purchased item"}
                    </label>
                    <select id="eligibility-item" name="item_id" className="input" required>
                      <option value="">{locale === "ar" ? "اختر القطعة" : "Select a piece"}</option>
                      {requestableItems.map((it: any) => (
                        <option key={it.id} value={it.id}>
                          {locale === "ar" ? it.name_ar : it.name_en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="purchase-reference">
                      {t.wall.purchaseRef}
                    </label>
                    <textarea
                      id="purchase-reference"
                      name="purchase_reference"
                      className="input"
                      rows={3}
                      required
                      placeholder={
                        locale === "ar"
                          ? "رقم الطلب / مرجع / تفاصيل الشراء"
                          : "Order number / reference / purchase details"
                      }
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="proof-note">
                      {locale === "ar" ? "ملاحظة إثبات (اختياري)" : "Proof note (optional)"}
                    </label>
                    <input id="proof-note" name="proof_note" className="input" />
                  </div>
                  <button className="btn btn-outline btn-block" type="submit">
                    {t.wall.submit}
                  </button>
                  <p className="text-[11px] leading-5 text-muted">{t.wall.pending}</p>
                </form>
              )}
            </div>

            <div className="border border-line bg-white p-6">
              <h2 className="font-display text-xl text-ink">{t.wall.upload}</h2>
              {!user ? (
                <p className="mt-2 text-[12px] leading-6 text-muted">
                {locale === "ar"
                  ? "يرجى تسجيل الدخول لرفع صورة إلى الحائط."
                  : "Please log in to upload a photo to the wall."}
              </p>
              ) : eligibleItems.length === 0 ? (
                <p className="mt-2 text-[12px] leading-6 text-muted">{t.wall.eligibilityNeeded}</p>
              ) : (
                <form action={submitWallPost} className="mt-5 space-y-4">
                  <div>
                    <label className="label" htmlFor="wall-item">
                      {locale === "ar" ? "قطعة لديك أهلية لها" : "Eligible piece"}
                    </label>
                    <select id="wall-item" name="item_id" className="input" required>
                      {eligibleItems.map((it: any) => (
                        <option key={it.id} value={it.id}>
                          {locale === "ar" ? it.name_ar : it.name_en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="wall-caption">
                      {t.wall.caption}
                    </label>
                    <input id="wall-caption" name="caption" className="input" />
                  </div>
                  <div>
                    <label className="label" htmlFor="wall-image">
                      {locale === "ar" ? "الصورة" : "Photo"}
                    </label>
                    <input
                      id="wall-image"
                      name="image"
                      type="file"
                      accept="image/*"
                      className="input"
                      required
                    />
                  </div>
                  <button className="btn btn-primary btn-block" type="submit">
                    {t.wall.submit}
                  </button>
                  <p className="flex items-start gap-2 text-[11px] leading-5 text-muted">
                    <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" />
                    {t.wall.pending}
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