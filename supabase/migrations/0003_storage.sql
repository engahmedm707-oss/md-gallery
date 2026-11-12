-- Storage buckets & policies for MD Gallery
-- Apply after 0001_init.sql and 0002_rls.sql.
--
-- The server actions use the service role for uploads after checking the
-- signed-in user (admin / eligible customer), so the app works even if these
-- policies are not applied. The policies below add defence in depth for any
-- future direct-from-browser uploads.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('item-images', 'item-images', true, 10485760,
   array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']),
  ('wall-images', 'wall-images', true, 10485760,
   array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for the catalogue and approved wall images.
drop policy if exists "item_images_public_read" on storage.objects;
create policy "item_images_public_read" on storage.objects
  for select using (bucket_id = 'item-images');

drop policy if exists "wall_images_public_read" on storage.objects;
create policy "wall_images_public_read" on storage.objects
  for select using (bucket_id = 'wall-images');

-- Admins may manage item images.
drop policy if exists "item_images_admin_write" on storage.objects;
create policy "item_images_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'item-images' and public.is_admin(auth.uid()))
  with check (bucket_id = 'item-images' and public.is_admin(auth.uid()));

-- Customers may upload only into their own wall folder. Eligibility for the
-- specific item is enforced when the wall_posts row is inserted.
drop policy if exists "wall_images_user_insert" on storage.objects;
create policy "wall_images_user_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'wall-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "wall_images_admin_write" on storage.objects;
create policy "wall_images_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'wall-images' and public.is_admin(auth.uid()))
  with check (bucket_id = 'wall-images' and public.is_admin(auth.uid()));