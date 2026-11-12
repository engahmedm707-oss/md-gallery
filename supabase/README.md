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
3. `seed.sql`

(Or use Supabase CLI: `supabase db push` if this folder is linked.)

## 3. Storage buckets & policies
Create buckets in Storage:
- `item-images` — for admin-uploaded product images. Recommended: **public bucket** (or public read policy) so catalog can display images.
- `wall-images` — for customer wall uploads.

Apply Storage policies (Dashboard → Storage → Policies) as needed. Example guidance:
- **item-images**: public read; admin (profiles.role='admin') insert/update/delete.
- **wall-images**: public read for approved-post display paths (or serve via signed/public URLs per your choice); authenticated users insert to their own folder/prefix; admin manage.

Because storage RLS uses `storage.objects`, a typical admin check policy is:
```sql
-- example: allow admins full access to item-images
create policy "item_images_admin_all" on storage.objects for all
  using (bucket_id = 'item-images' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (bucket_id = 'item-images' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
```
Adjust read policies to match public/private choices.

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
