import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { ArrowUpRightIcon, CheckIcon } from "@/components/Icons";

const cards = [
  {
    href: "/admin/items",
    title: "Items",
    desc: "Add, edit and remove pieces with bilingual content, images and discounts.",
  },
  {
    href: "/admin/categories",
    title: "Categories",
    desc: "Curate collections. Deletion is blocked while a category still contains items.",
  },
  {
    href: "/admin/moderation",
    title: "Moderation",
    desc: "Review and approve customer reviews and replies before they go public.",
  },
  {
    href: "/admin/eligibility",
    title: "Purchase eligibility",
    desc: "Verify purchase details and grant wall-posting access for a specific piece.",
  },
  {
    href: "/admin/wall",
    title: "Wall posts",
    desc: "Approve or reject customer photographs submitted for the customer wall.",
  },
  {
    href: "/admin/admins",
    title: "Admins",
    desc: "Promote or remove administrators. Removing an admin keeps the auth account.",
  },
  {
    href: "/admin/settings",
    title: "Settings",
    desc: "Manage the WhatsApp number, social links and storefront contact details.",
  },
  {
    href: "/en",
    title: "Storefront",
    desc: "Open the public gallery to review the live experience and new pieces.",
  },
];

export default async function AdminDashboard() {
  await requireAdmin();
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const checklist = [
    "Configure .env.local with the Supabase URL, anon key and server-only service role key.",
    "Run the SQL migrations and seed file in Supabase.",
    "Create the item-images and wall-images storage buckets with their policies.",
    "Promote the first account to admin in Supabase after signing up.",
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 border-b border-line-soft pb-7 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink">Studio overview</h1>
          <p className="mt-2 max-w-xl text-[12px] leading-6 text-muted">
            Manage the catalog, community contributions and gallery settings from one place.
          </p>
        </div>
        <div className="text-start sm:text-end">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">Today</p>
          <p className="mt-1 text-[12px] text-ink">{today}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex min-h-[190px] flex-col justify-between border border-line bg-white p-5 transition-colors hover:border-brass/60"
          >
            <div className="flex items-start justify-between">
              <span className="text-[9px] font-semibold tracking-[0.18em] text-brass">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="grid h-7 w-7 place-items-center border border-line text-muted transition-colors group-hover:border-brass group-hover:bg-brass group-hover:text-ink">
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-8">
              <h2 className="font-display text-[1.4rem] leading-tight text-ink">{card.title}</h2>
              <p className="mt-2 text-[11.5px] leading-6 text-muted">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-12">
        <div className="relative overflow-hidden bg-ink p-6 text-cream md:p-8 lg:col-span-7">
          <div className="ornament-faint absolute inset-0 opacity-25" aria-hidden />
          <div className="relative">
            <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-brass">
              Gallery operations
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-cream">
              Everything reviewed, everything intentional.
            </h2>
            <p className="mt-3 max-w-lg text-[12px] leading-7 text-cream/55">
              Every review, reply and customer wall photo passes through moderation. Permanent
              deletions always require confirmation, and categories cannot be removed while they
              still hold pieces.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/admin/items/new" className="btn btn-light btn-sm">
                Add a piece
              </Link>
              <Link href="/admin/moderation" className="btn btn-outline-light btn-sm">
                Open moderation
              </Link>
            </div>
          </div>
        </div>

        <div className="border border-line bg-white p-6 lg:col-span-5 md:p-8">
          <p className="eyebrow">Setup checklist</p>
          <ul className="mt-5 space-y-3.5">
            {checklist.map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center border border-brass/40 bg-brass-soft text-[8px] font-bold text-brass-ink">
                  {index + 1}
                </span>
                <span className="text-[11px] leading-5 text-muted">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 flex items-start gap-2 border-t border-line-soft pt-4 text-[10px] leading-5 text-muted">
            <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" />
            Full SQL and storage instructions are in{" "}
            <code className="font-mono text-[10px] text-ink">supabase/README.md</code>.
          </p>
        </div>
      </div>
    </div>
  );
}