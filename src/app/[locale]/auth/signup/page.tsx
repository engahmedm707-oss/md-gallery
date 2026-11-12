"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { AuthShell } from "@/components/AuthShell";
import { ArrowIcon } from "@/components/Icons";

export default function SignupPage() {
  const params = useParams<{ locale: Locale }>();
  const locale = (params?.locale === "ar" ? "ar" : "en") as Locale;
  const t = getDictionary(locale);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) throw error;
      setMsg(
        locale === "ar"
          ? "تم إنشاء الحساب. تحقق من بريدك إذا كان التأكيد مفعلاً، ثم سجّل الدخول."
          : "Account created. Check your email if confirmation is enabled, then log in.",
      );
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      locale={locale}
      title={t.auth.signup}
      subtitle={
        locale === "ar"
          ? "أنشئ حسابك للمشاركة في تقييمات المعرض وطلبات أهلية النشر على حائط العملاء."
          : "Create your account to join gallery reviews and request purchase eligibility for the customer wall."
      }
      footer={
        <>
          {t.auth.haveAccount}{" "}
          <Link
            href={`/${locale}/auth/login`}
            className="font-semibold text-ink underline decoration-brass/60 underline-offset-4 transition-colors hover:text-burgundy"
          >
            {t.auth.login}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {!isSupabaseConfigured && (
          <p className="border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-900">
            Supabase is not configured. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, then restart the
            app.
          </p>
        )}
        <div>
          <label className="label" htmlFor="signup-name">
            {t.auth.displayName}
          </label>
          <input
            id="signup-name"
            className="input"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="signup-email">
            {t.auth.email}
          </label>
          <input
            id="signup-email"
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="signup-password">
            {t.auth.password}
          </label>
          <input
            id="signup-password"
            className="input"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {error && (
          <p className="border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
            {error}
          </p>
        )}
        {msg && (
          <p className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">
            {msg}
          </p>
        )}
        <button className="btn btn-primary btn-block" disabled={loading || !isSupabaseConfigured} type="submit">
          {loading ? t.common.loading : t.auth.signup}
          {!loading && <ArrowIcon className="h-3.5 w-3.5" />}
        </button>
      </form>
    </AuthShell>
  );
}