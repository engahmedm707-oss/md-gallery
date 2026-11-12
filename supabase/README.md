# Supabase setup (MD Gallery)

## 1. Create project & env vars
1. Create a Supabase project at https://supabase.com/dashboard.
2. Copy Project URL and keys into `.env.local` (see `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
   - `SUPABASE_SERVICE_ROLE_KEY` (**server-only**, never expose to client)

## 2. Apply schema, RLS, seed
In Supabase Dashboard → SQL Editor, run in order:
1. `migrations/0001_init.sql`
2. `migrations/0002_rls.sql`
3. `migrations/0003_storage.sql` (buckets + storage policies)
4. `seed.sql`

(Or use Supabase CLI: `supabase db push` if this folder is linked.)

## 3. Storage buckets & policies
`migrations/0003_storage.sql` creates the two public buckets and their policies:
- `item-images` — admin-uploaded product images (10 MB limit; JPG/PNG/WebP/GIF/AVIF).
- `wall-images` — customer wall uploads (same limits, own-folder writes).

The server actions upload with the service role after checking the admin role or
purchase eligibility, so uploads work even before these policies are applied.
The policies are still recommended as defence in depth for direct uploads.

## 4. Bootstrap the first admin
After the first user signs up (or you create them in Auth → Users):
1. Find their `id` (UUID) in `auth.users`.
2. Promote to admin:
```sql
update public.profiles set role = 'admin' where id = '<USER_UUID>';
-- or if profile missing:
insert into public.profiles (id, email, role) values ('<USER_UUID>', 'admin@example.com', 'admin')
on conflict (id) do update set role = 'admin';
```
This first admin can then add/remove other admins from the in-app admin panel (server-side actions). Removing an admin sets role back to `customer` and does **not** delete the Auth account.

### Admin entry
There is **no public Admin link** in the storefront header. Administrators should bookmark the direct URL:
- Sign in: `/admin/login`
- Dashboard: `/admin`

Once signed in with an account whose `profiles.role` is `admin`, a discreet **Admin** link appears in the storefront header and mobile menu. Anonymous visitors and regular customers never see it. Access control is enforced server-side by middleware and `requireAdmin()`, not by hiding the link.

## 5. Notes
- **Category delete:** blocked by FK (`items.category_id on delete restrict`) when items exist; app should also show a clear message to reassign/delete items first.
- **Permanent deletes:** deleting an item must also remove its `item_images` rows and Storage objects.
- **Moderation:** reviews, replies, and wall posts default to `pending` and are public only when `approved`.
- **Wall eligibility (Option 2):** customer submits `purchase_eligibility_requests`; admin approval creates `purchase_eligibility` grant required to insert `wall_posts`.
- **Admin add/remove users:** requires `SUPABASE_SERVICE_ROLE_KEY` on server; never use in browser.
- **Auth settings:** configure email confirmations/providers in Supabase Auth as desired for customer login. Keep service-role key out of version control. Add `.env.local` to `.gitignore`.
