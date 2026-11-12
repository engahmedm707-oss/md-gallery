-- RLS policies for MD Gallery
-- Assumes 0001_init.sql applied

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.item_images enable row level security;
alter table public.purchase_eligibility_requests enable row level security;
alter table public.purchase_eligibility enable row level security;
alter table public.reviews enable row level security;
alter table public.review_replies enable row level security;
alter table public.wall_posts enable row level security;
alter table public.site_settings enable row level security;

-- PROFILES
create policy "profiles_select_own_or_admin" on public.profiles for select
  using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "profiles_insert_self" on public.profiles for insert
  with check (auth.uid() = id);
create policy "profiles_update_self_or_admin" on public.profiles for update
  using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));

-- CATEGORIES
create policy "categories_public_read_visible" on public.categories for select
  using (is_visible = true or public.is_admin(auth.uid()));
create policy "categories_admin_write" on public.categories for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ITEMS
create policy "items_public_read_visible" on public.items for select
  using (is_visible = true or public.is_admin(auth.uid()));
create policy "items_admin_write" on public.items for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ITEM IMAGES
create policy "item_images_public_read" on public.item_images for select
  using (exists (select 1 from public.items i where i.id = item_id and (i.is_visible = true or public.is_admin(auth.uid()))));
create policy "item_images_admin_write" on public.item_images for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- PURCHASE ELIGIBILITY REQUESTS
create policy "per_select_own_or_admin" on public.purchase_eligibility_requests for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "per_insert_own" on public.purchase_eligibility_requests for insert
  with check (auth.uid() = user_id and status = 'pending');
create policy "per_update_admin" on public.purchase_eligibility_requests for update
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- PURCHASE ELIGIBILITY
create policy "pe_select_own_or_admin" on public.purchase_eligibility for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "pe_admin_write" on public.purchase_eligibility for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- REVIEWS
create policy "reviews_public_read_approved" on public.reviews for select
  using (status = 'approved' or auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "reviews_insert_own_pending" on public.reviews for insert
  with check (auth.uid() = user_id and status = 'pending');
create policy "reviews_admin_moderate" on public.reviews for update
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "reviews_admin_delete" on public.reviews for delete
  using (public.is_admin(auth.uid()));

-- REVIEW REPLIES
create policy "replies_public_read_approved" on public.review_replies for select
  using (status = 'approved' or auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "replies_insert_own_pending" on public.review_replies for insert
  with check (
    auth.uid() = user_id and status = 'pending'
    and exists (select 1 from public.reviews r where r.id = review_id and r.status = 'approved')
  );
create policy "replies_admin_moderate" on public.review_replies for update
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "replies_admin_delete" on public.review_replies for delete
  using (public.is_admin(auth.uid()));

-- WALL POSTS
create policy "wall_public_read_approved" on public.wall_posts for select
  using (status = 'approved' or auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "wall_insert_eligible_pending" on public.wall_posts for insert
  with check (
    auth.uid() = user_id and status = 'pending'
    and public.has_purchase_eligibility(auth.uid(), item_id)
  );
create policy "wall_admin_moderate" on public.wall_posts for update
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "wall_admin_delete" on public.wall_posts for delete
  using (public.is_admin(auth.uid()));

-- SITE SETTINGS
create policy "site_settings_public_read" on public.site_settings for select using (true);
create policy "site_settings_admin_write" on public.site_settings for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Storage policies note:
-- Create buckets: item-images (public read recommended), wall-images.
-- Apply storage.objects policies in Supabase dashboard/SQL:
--   - public read on item-images objects
--   - authenticated insert to wall-images path prefix auth.uid()/... 
--   - admin full control via is_admin(auth.uid()) lookup on profiles
-- (Exact storage SQL depends on project; include in setup docs.)
