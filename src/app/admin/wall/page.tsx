import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { moderate } from "@/app/admin/actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default async function AdminWallPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("wall_posts")
    .select("*, profiles(email,display_name), items(name_en)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-8">
      <div className="border-b border-line-soft pb-7">
        <p className="eyebrow">Community</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink">Wall posts</h1>
        <p className="mt-2 max-w-2xl text-[12px] leading-6 text-muted">
          Approve or reject customer photographs submitted for the public wall. Rejections require
          confirmation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(posts || []).map((p: any) => {
          async function approve() {
            "use server";
            await moderate("wall_posts", p.id, "approved");
          }
          async function reject() {
            "use server";
            await moderate("wall_posts", p.id, "rejected");
          }
          const url = p.image_path
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wall-images/${p.image_path}`
            : null;
          const statusClass =
            p.status === "approved"
              ? "chip chip-ink"
              : p.status === "rejected"
                ? "chip"
                : "chip chip-brass";
          return (
            <article key={p.id} className="overflow-hidden border border-line bg-white">
              <div className="relative aspect-[4/3] bg-sand">
                {url ? (
                  <Image
                    src={url}
                    alt={p.caption || "Wall post"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
                    No image
                  </div>
                )}
                <span className={`absolute start-3 top-3 ${statusClass}`}>{p.status}</span>
              </div>
              <div className="space-y-2 p-4">
                <h2 className="font-display text-lg leading-tight text-ink">
                  {p.items?.name_en || "Item"}
                </h2>
                <p className="text-[11px] text-muted">
                  {p.profiles?.display_name || p.profiles?.email || "—"}
                </p>
                {p.caption && (
                  <p className="border-t border-line-soft pt-2 text-[12px] leading-6">{p.caption}</p>
                )}
                {p.status === "pending" && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <form action={approve}>
                      <button className="btn btn-primary btn-sm" type="submit">
                        Approve
                      </button>
                    </form>
                    <ConfirmDeleteButton
                      action={reject}
                      label="Reject"
                      className="btn btn-outline btn-sm"
                      confirmMessage="Reject this wall post? It will no longer be eligible for the public wall."
                    />
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {(!posts || posts.length === 0) && (
        <div className="ornament border border-line bg-white py-16 text-center text-sm text-muted">
          No wall posts have been submitted yet.
        </div>
      )}
    </div>
  );
}