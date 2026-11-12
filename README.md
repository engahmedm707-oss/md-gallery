# MD Gallery

Bilingual (Arabic/English) Next.js + Supabase gallery/catalog for **MD Gallery** (M `#7A1F2B`, D `#1B2A49`).

- **Public:** landing + gallery (categories, item details, 1+ images, EGP pricing & discounts), WhatsApp inquiry, customer wall, and reviews/replies (approved only).
- **Admin:** inventory CRUD (bilingual), categories, multi-admin management, moderation queue (reviews/replies/wall), purchase-eligibility requests/grants (Option 2), and settings.
- **Rules:** reviews/replies/wall require login and **admin approval**; wall upload requires **approved purchase eligibility** for the specific item; category delete blocked if items exist; destructive actions require confirmation; item deletion is permanent (DB + Storage).

> A detailed blueprint is saved at `C:\Users\Admin\.opencode\plan\md-gallery-plan.md` (planning artifact).

## Tech stack
- Next.js (App Router, TypeScript), Tailwind CSS
- Supabase (Auth, Postgres, Storage, RLS)
- Locale routes: `/en`, `/ar` with RTL/LTR support

## 1) Prerequisites
- Node.js 20+ and npm
- A Supabase project

## 2) Install
```bash
npm install
```

## 3) Environment variables
Create `.env.local` from `.env.example` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server-only (admin add/remove, privileged ops)

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=01151515676
NEXT_PUBLIC_WHATSAPP_NUMBER_INTL=201151515676
```

> `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser or committed.

If you see **“Your project's URL and API key are required to create a Supabase client”**, `.env.local` is missing or the dev server was started before the file was created. Copy the values into `.env.local` (not `.env.example`) and restart the dev server. The app now shows a setup notice on auth pages instead of the raw client error when configuration is missing.

## 4) Supabase setup (schema, RLS, storage, bootstrap)
Run in Supabase SQL Editor (in order):
1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/seed.sql`

Create Storage buckets:
- `item-images` (item photos; public read recommended for catalog)
- `wall-images` (customer wall uploads)

Apply storage policies as needed (admin manage, public/auth read/insert rules). See **`supabase/README.md`** for details and example storage policy.

### Bootstrap the first admin
1. Create/sign up the first user (Supabase Auth).
2. Promote them to admin in SQL Editor:
```sql
update public.profiles set role = 'admin' where id = '<USER_UUID>';
-- or insert if needed:
-- insert into public.profiles (id, email, role) values ('<USER_UUID>', 'admin@example.com', 'admin')
-- on conflict (id) do update set role = 'admin';
```
After this, use **Admin → Admins** to add/remove other admins (remove = revoke admin role only, account kept). Last admin cannot be removed.

## 5) Run locally
```bash
npm run dev
```
- Site: http://localhost:3000 (redirects to `/en`)
- Admin: http://localhost:3000/admin (requires admin role)

## Project structure (key paths)
- `src/app/[locale]/...` – public bilingual pages (home, gallery, item detail, wall, reviews, auth)
- `src/app/admin/...` – admin dashboard and management (items, categories, admins, moderation, eligibility, wall, settings)
- `src/app/admin/actions.ts` – server actions (catalog/admin/moderation/eligibility/settings)
- `src/app/[locale]/actions.ts` – customer submissions (reviews/replies/eligibility requests/wall posts)
- `src/lib/supabase/{client,server,admin}.ts` – Supabase clients (SSR + service-role)
- `src/lib/i18n/*` – locales and EN/AR dictionaries
- `src/lib/data.ts` – public data fetching with safe demo fallback when env is not configured
- `supabase/migrations/*`, `supabase/seed.sql`, `supabase/README.md` – DB/RLS/setup

## Key flows
- **Add item (admin):** Admin → Items → Add → select category → enter EN/AR content & specific details → set EGP price & discount (none/%/fixed) → upload 1+ images → Save. Edit via same form.
- **Delete:** confirmation required everywhere; item delete removes DB rows and Storage images (permanent). Category delete blocked if items exist.
- **Purchase eligibility (Option 2):** customer submits purchase details/reference for an item → admin approves/rejects in Eligibility queue → approval grants eligibility to upload a wall photo for that item.
- **Moderation:** reviews, replies, and wall posts saved as `pending`; admin approves/rejects in Moderation/Wall queues before public display.

## Notes
- When Supabase env vars are missing, public pages use demo/fallback content so the UI can be previewed; configure Supabase for real data/auth/storage.
- WhatsApp number is configurable in Settings/env; links use `NEXT_PUBLIC_WHATSAPP_NUMBER_INTL` for `wa.me`.
- Review “verified purchase” is not auto-enforced beyond the wall-eligibility flow (no checkout); extend as needed.

## Scripts
- `npm run dev` – development
- `npm run build` – production build
- `npm run start` – start production server
- `npm run lint` – lint
