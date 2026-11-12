"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { AuthShell } from "@/components/AuthShell";
import { ArrowIcon } from "@/components/Icons";

export default function LoginPage() {
  const params = useParams<{ locale: Locale }>();
  const locale = (params?.locale === "ar" ? "ar" : "en") as Locale;
  const t = getDictionary(locale);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push(`/${locale}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      locale={locale}
      title={t.auth.login}
      subtitle={
        locale === "ar"
          ? "سجّل الدخول لمشاركة تقييمك، والرد على التقييمات، ورفع صورك بعد اعتماد أهلية الشراء."
          : "Sign in to share a review, reply to other clients, and upload your photos once purchase eligibility is approved."
      }
      footer={
        <>
          {t.auth.needAccount}{" "}
          <Link
            href={`/${locale}/auth/signup`}
            className="font-semibold text-ink underline decoration-brass/60 underline-offset-4 transition-colors hover:text-burgundy"
          >
            {t.auth.signup}
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
          <label className="label" htmlFor="login-email">
            {t.auth.email}
          </label>
          <input
            id="login-email"
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="login-password">
            {t.auth.password}
          </label>
          <input
            id="login-password"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <p className="border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
            {error}
          </p>
        )}
        <button className="btn btn-primary btn-block" disabled={loading || !isSupabaseConfigured} type="submit">
          {loading ? t.common.loading : t.auth.login}
          {!loading && <ArrowIcon className="h-3.5 w-3.5" />}
        </button>
      </form>
    </AuthShell>
  );
}