import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { setRoleByEmail } from "@/app/admin/actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default async function AdminAdminsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: admins } = await supabase
    .from("profiles")
    .select("id,email,display_name,role,created_at")
    .eq("role", "admin")
    .order("created_at");

  async function addAdmin(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    await setRoleByEmail(email, "admin");
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-line-soft pb-7">
        <p className="eyebrow">Access</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-ink">Administrators</h1>
        <p className="mt-2 max-w-2xl text-[12px] leading-6 text-muted">
          Promote an existing account to admin, or remove admin access. Removing an administrator
          revokes the role only — the underlying auth account is preserved. The last admin cannot be
          removed.
        </p>
      </div>

      <form action={addAdmin} className="form-card flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="w-full flex-1">
          <label className="label" htmlFor="admin-email">
            User email to promote
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            className="input"
            placeholder="user@example.com"
            required
          />
          <p className="mt-1.5 text-[10px] leading-5 text-muted">
            The user must already have an account and profile. This uses the server-side service
            role.
          </p>
        </div>
        <button className="btn btn-primary shrink-0" type="submit">
          Add administrator
        </button>
      </form>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Joined</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(admins || []).map((a: any) => {
              async function remove() {
                "use server";
                await setRoleByEmail(a.email, "customer");
              }
              const isLast = (admins || []).length <= 1;
              return (
                <tr key={a.id}>
                  <td className="font-medium">{a.email}</td>
                  <td>{a.display_name || <span className="text-muted">—</span>}</td>
                  <td>
                    <span className="chip chip-ink">{a.role}</span>
                  </td>
                  <td className="whitespace-nowrap text-muted">
                    {a.created_at
                      ? new Date(a.created_at).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                  <td>
                    <div className="flex justify-end">
                      {isLast ? (
                        <span className="text-[10px] uppercase tracking-[0.1em] text-muted">
                          Last admin
                        </span>
                      ) : (
                        <ConfirmDeleteButton
                          action={remove}
                          label="Remove admin"
                          className="btn btn-danger btn-sm"
                          confirmMessage="Remove this user from administrators? This revokes the admin role only and keeps the account. You can re-add them later."
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {(!admins || admins.length === 0) && (
              <tr>
                <td className="py-12 text-center text-muted" colSpan={5}>
                  No administrators found. Bootstrap the first admin through Supabase — see
                  supabase/README.md.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}