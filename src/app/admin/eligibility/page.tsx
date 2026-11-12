import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { handleEligibilityRequest } from "@/app/admin/actions";

export default async function EligibilityPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("purchase_eligibility_requests")
    .select("*, profiles(email,display_name), items(name_en,name_ar)")
    .order("created_at", { ascending: false })
    .limit(100);
  const { data: grants } = await supabase
    .from("purchase_eligibility")
    .select("*, profiles(email,display_name), items(name_en)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-8">
      <div className="border-b border-line-soft pb-7">
        <p className="eyebrow">Community</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink">Purchase eligibility</h1>
        <p className="mt-2 max-w-2xl text-[12px] leading-6 text-muted">
          Customers submit purchase details or a reference to request wall-posting access for a
          specific piece. Approving a request grants eligibility for that customer and item; the
          customer can then upload a photo for moderation.
        </p>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">Requests</h2>
          <span className="text-[9px] uppercase tracking-[0.16em] text-muted">
            {requests?.length || 0} total
          </span>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Customer</th>
                <th>Item</th>
                <th>Reference / details</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(requests || []).map((r: any) => {
                async function approve() {
                  "use server";
                  await handleEligibilityRequest(r.id, "approved", admin.id);
                }
                async function reject() {
                  "use server";
                  await handleEligibilityRequest(r.id, "rejected", admin.id);
                }
                const statusClass =
                  r.status === "approved"
                    ? "chip chip-ink"
                    : r.status === "rejected"
                      ? "chip"
                      : "chip chip-brass";
                return (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap text-muted">
                      {new Date(r.created_at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>{r.profiles?.display_name || r.profiles?.email || "—"}</td>
                    <td>{r.items?.name_en || "—"}</td>
                    <td className="max-w-md whitespace-pre-wrap leading-6">
                      {r.purchase_reference}
                      {r.proof_note ? `\n${r.proof_note}` : ""}
                    </td>
                    <td>
                      <span className={statusClass}>{r.status}</span>
                    </td>
                    <td>
                      {r.status === "pending" ? (
                        <div className="flex flex-wrap justify-end gap-2">
                          <form action={approve}>
                            <button className="btn btn-primary btn-sm" type="submit">
                              Approve & grant
                            </button>
                          </form>
                          <form action={reject}>
                            <button className="btn btn-outline btn-sm" type="submit">
                              Reject
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="block text-end text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {(!requests || requests.length === 0) && (
                <tr>
                  <td className="py-12 text-center text-muted" colSpan={6}>
                    No eligibility requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">Granted eligibility</h2>
          <span className="text-[9px] uppercase tracking-[0.16em] text-muted">
            {grants?.length || 0} active
          </span>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Granted</th>
                <th>Customer</th>
                <th>Item</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(grants || []).map((g: any) => (
                <tr key={g.id}>
                  <td className="whitespace-nowrap text-muted">
                    {new Date(g.created_at).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td>{g.profiles?.display_name || g.profiles?.email || "—"}</td>
                  <td>{g.items?.name_en || "—"}</td>
                  <td>
                    <span className="chip chip-ink">Eligible</span>
                  </td>
                </tr>
              ))}
              {(!grants || grants.length === 0) && (
                <tr>
                  <td className="py-12 text-center text-muted" colSpan={4}>
                    No eligibility grants yet.
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