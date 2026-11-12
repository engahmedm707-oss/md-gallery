"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", exact: true }],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/items", label: "Items" },
      { href: "/admin/categories", label: "Categories" },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/admin/moderation", label: "Moderation" },
      { href: "/admin/eligibility", label: "Purchase eligibility" },
      { href: "/admin/wall", label: "Wall posts" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/admins", label: "Admins" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

export function AdminNav({ variant = "sidebar" }: { variant?: "sidebar" | "mobile" }) {
  const pathname = usePathname() || "/admin";

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  if (variant === "mobile") {
    return (
      <nav className="flex gap-1.5 overflow-x-auto px-4 pb-3" aria-label="Admin">
        {groups.flatMap((group) => group.items).map((item) => {
          const active = isActive(item.href, (item as { exact?: boolean }).exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                active
                  ? "border-ink bg-ink text-cream"
                  : "border-line bg-white text-muted hover:border-ink/40 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-6" aria-label="Admin">
      {groups.map((group) => (
        <div key={group.label} className="mb-7">
          <p className="px-3 pb-2 text-[8px] font-semibold uppercase tracking-[0.24em] text-cream/25">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href, (item as { exact?: boolean }).exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-2.5 border-s-2 py-2 pe-2 ps-3 text-[11px] font-medium tracking-wide transition-colors ${
                    active
                      ? "border-brass bg-cream/[0.06] text-cream"
                      : "border-transparent text-cream/45 hover:bg-cream/[0.04] hover:text-cream/85"
                  }`}
                >
                  <span
                    className={`h-1 w-1 transition-colors ${
                      active ? "bg-brass" : "bg-cream/15 group-hover:bg-cream/40"
                    }`}
                    aria-hidden
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}