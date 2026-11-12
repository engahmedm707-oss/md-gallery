import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateSettings } from "@/app/admin/actions";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").eq("id", 1).single();

  return (
    <div className="space-y-8">
      <div className="border-b border-line-soft pb-7">
        <p className="eyebrow">System</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink">Settings</h1>
        <p className="mt-2 max-w-2xl text-[12px] leading-6 text-muted">
          Contact details and social links used across the storefront, WhatsApp buttons and footer.
        </p>
      </div>

      <form action={updateSettings} className="max-w-2xl space-y-4">
        <section className="form-card space-y-4">
          <h2 className="form-title">Contact</h2>
          <div>
            <label className="label" htmlFor="whatsapp-display">
              WhatsApp number (display / local)
            </label>
            <input
              id="whatsapp-display"
              name="whatsapp_number"
              className="input"
              defaultValue={settings?.whatsapp_number || "01151515676"}
            />
            <p className="mt-1.5 text-[10px] text-muted">
              Shown as text in the header, footer and product pages.
            </p>
          </div>
          <div>
            <label className="label" htmlFor="whatsapp-intl">
              WhatsApp number (international, digits only)
            </label>
            <input
              id="whatsapp-intl"
              name="whatsapp_number_intl"
              className="input"
              defaultValue={settings?.whatsapp_number_intl || "201151515676"}
              dir="ltr"
            />
            <p className="mt-1.5 text-[10px] text-muted">
              Used to build wa.me inquiry links. Include the country code without “+”.
            </p>
          </div>
        </section>

        <section className="form-card space-y-4">
          <h2 className="form-title">Social profiles</h2>
          <div>
            <label className="label" htmlFor="instagram-url">
              Instagram URL
            </label>
            <input
              id="instagram-url"
              name="instagram_url"
              type="url"
              className="input"
              placeholder="https://instagram.com/..."
              defaultValue={settings?.instagram_url || ""}
            />
          </div>
          <div>
            <label className="label" htmlFor="facebook-url">
              Facebook URL
            </label>
            <input
              id="facebook-url"
              name="facebook_url"
              type="url"
              className="input"
              placeholder="https://facebook.com/..."
              defaultValue={settings?.facebook_url || ""}
            />
          </div>
        </section>

        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] leading-5 text-muted">
            Reload the storefront after saving to see updated details.
          </p>
          <button className="btn btn-primary" type="submit">
            Save settings
          </button>
        </div>
      </form>

      <div className="max-w-2xl border border-line bg-white p-5 text-[11px] leading-6 text-muted">
        <p className="font-semibold text-ink">Supabase configuration</p>
        <p className="mt-1">
          Ensure <code className="font-mono text-[10px] text-ink">.env.local</code> contains the
          Supabase URL, anon key and the server-only service role key. Settings cannot be saved
          without a working Supabase connection.
        </p>
      </div>
    </div>
  );
}