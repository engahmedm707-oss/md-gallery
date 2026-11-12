"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { BrandMark } from "@/components/BrandMark";
import { ArrowIcon, QuoteIcon } from "@/components/Icons";

export default function AdminLoginPage() {
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
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-ink text-cream lg:block">
        <Image
          src="/demo/painting.svg"
          alt=""
          fill
          sizes="50vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/85 to-ink/45" />
        <div className="grain" aria-hidden />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
          <Link href="/en" aria-label="MD Gallery">
            <BrandMark size="md" tone="light" />
          </Link>
          <div>
            <QuoteIcon className="h-8 w-8 text-brass/80" />
            <blockquote className="mt-7 max-w-md font-display text-4xl leading-[1.2] text-cream">
              The gallery, kept in order — quietly and with care.
            </blockquote>
            <p className="mt-5 max-w-sm text-[12px] leading-7 text-cream/55">
              Manage pieces, categories, community submissions and gallery access from a single
              considered workspace.
            </p>
          </div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-cream/30">
            MD Gallery · Studio administration
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Link href="/en">
              <BrandMark size="sm" />
            </Link>
          </div>

          <p className="eyebrow mt-10 lg:mt-0">Restricted access</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink">Admin sign in</h1>
          <p className="mt-2 text-[12px] leading-6 text-muted">
            Use an administrator account. To bootstrap the first admin, follow the steps in
            supabase/README.md.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {!isSupabaseConfigured && (
              <p className="border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-900">
                Supabase is not configured. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, then restart
                the app.
              </p>
            )}
            <div>
              <label className="label" htmlFor="admin-login-email">
                Email
              </label>
              <input
                id="admin-login-email"
                className="input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="admin-login-password">
                Password
              </label>
              <input
                id="admin-login-password"
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
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowIcon className="h-3.5 w-3.5" />}
            </button>
          </form>

          <p className="mt-6 text-[11px] text-muted">
            <Link
              href="/en"
              className="underline decoration-brass/50 underline-offset-4 transition-colors hover:text-ink"
            >
              Return to the storefront
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}