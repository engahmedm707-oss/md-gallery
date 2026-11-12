import Link from "next/link";
import type { Metadata } from "next";
import { getProfile } from "@/lib/auth";
import { BrandMark } from "@/components/BrandMark";
import { AdminNav } from "@/components/admin/AdminNav";
import { ArrowUpRightIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Admin | MD Gallery",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  const isAdmin = profile?.role === "admin";

  if (!isAdmin) {
    return <div className="min-h-screen bg-paper">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-paper md:flex">
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col bg-ink md:flex">
        <div className="border-b border-brass/30 p-5">
          <Link href="/admin" aria-label="MD Gallery admin">
            <BrandMark size="sm" tone="light" />
          </Link>
          <p className="mt-5 text-[8px] font-semibold uppercase tracking-[0.24em] text-brass">
            Studio admin
          </p>
        </div>

        <AdminNav />

        <div className="border-t border-brass/30 p-5">
          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-cream/30">
            Signed in
          </p>
          <p className="mt-1.5 truncate text-[11px] text-cream/75">{profile.email}</p>
          <Link
            href="/en"
            className="mt-4 inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-cream/45 transition-colors hover:text-brass"
          >
            View storefront
            <ArrowUpRightIcon className="h-3 w-3" />
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-40 border-b border-line-soft bg-paper/95 backdrop-blur md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <BrandMark size="sm" />
            <Link
              href="/en"
              className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted"
            >
              View site
              <ArrowUpRightIcon className="h-3 w-3" />
            </Link>
          </div>
          <AdminNav variant="mobile" />
        </div>

        <header className="hidden items-center justify-between border-b border-line-soft px-8 py-4 md:flex">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted">
            MD Gallery <span className="mx-2 text-brass">/</span> Admin
          </p>
          <Link
            href="/en"
            className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink"
          >
            View storefront
            <ArrowUpRightIcon className="h-3 w-3" />
          </Link>
        </header>

        <main className="px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-[78rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}