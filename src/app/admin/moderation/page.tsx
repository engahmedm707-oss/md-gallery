import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { moderate } from "@/app/admin/actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default async function ModerationPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data: reviews }, { data: replies }] = await Promise.all([
    supabase
      .from("reviews")
      .select("id,type,rating,body,status,created_at,item_id,profiles(email,display_name),items(name_en)")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("review_replies")
      .select("id,body,status,created_at,review_id,profiles(email,display_name)")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  function Actions({ table, id }: { table: "reviews" | "review_replies"; id: string }) {
    async function approve() {
      "use server";
      await moderate(table, id, "approved");
    }
    async function reject() {
      "use server";
      await moderate(table, id, "rejected");
    }
    return (
      <div className="flex flex-wrap justify-end gap-2">
        <form action={approve}>
          <button className="btn btn-primary btn-sm" type="submit">
            Approve
          </button>
        </form>
        <ConfirmDeleteButton
          action={reject}
          label="Reject"
          className="btn btn-outline btn-sm"
          confirmMessage="Reject this submission? Its status will be set to rejected. This can be reversed in the database if necessary."
        />
      </div>
    );
  }

  function Status({ value }: { value: string }) {
    const className =
      value === "approved" ? "chip chip-ink" : value === "rejected" ? "chip" : "chip chip-brass";
    return <span className={className}>{value}</span>;
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-line-soft pb-7">
        <p className="eyebrow">Community</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink">Moderation queue</h1>
        <p className="mt-2 max-w-2xl text-[12px] leading-6 text-muted">
          Approve or reject reviews and replies. Only approved content is visible on the public
          site. Rejections require confirmation.
        </p>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">Reviews</h2>
          <span className="text-[9px] uppercase tracking-[0.16em] text-muted">
            {reviews?.length || 0} total
          </span>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Type / item</th>
                <th>User</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(reviews || []).map((r: any) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap text-muted">
                    {new Date(r.created_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <span className="capitalize">{r.type}</span>
                    {r.items?.name_en ? (
                      <span className="text-muted"> · {r.items.name_en}</span>
                    ) : null}
                  </td>
                  <td>{r.profiles?.display_name || r.profiles?.email || "—"}</td>
                  <td className="whitespace-nowrap">{r.rating}/5</td>
                  <td className="max-w-md leading-6">{r.body}</td>
                  <td>
                    <Status value={r.status} />
                  </td>
                  <td>
                    {r.status === "pending" ? (
                      <Actions table="reviews" id={r.id} />
                    ) : (
                      <span className="block text-end text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!reviews || reviews.length === 0) && (
                <tr>
                  <td className="py-12 text-center text-muted" colSpan={7}>
                    No reviews yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">Replies</h2>
          <span className="text-[9px] uppercase tracking-[0.16em] text-muted">
            {replies?.length || 0} total
          </span>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Submitted</th>
                <th>User</th>
                <th>Reply</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(replies || []).map((r: any) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap text-muted">
                    {new Date(r.created_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>{r.profiles?.display_name || r.profiles?.email || "—"}</td>
                  <td className="max-w-md leading-6">{r.body}</td>
                  <td>
                    <Status value={r.status} />
                  </td>
                  <td>
                    {r.status === "pending" ? (
                      <Actions table="review_replies" id={r.id} />
                    ) : (
                      <span className="block text-end text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!replies || replies.length === 0) && (
                <tr>
                  <td className="py-12 text-center text-muted" colSpan={5}>
                    No replies yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}