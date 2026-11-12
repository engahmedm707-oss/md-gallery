-- Seed categories and (optional) settings for MD Gallery
-- Run after 0001_init.sql

insert into public.categories (slug, name_en, name_ar, description_en, description_ar, sort_order, is_visible) values
  ('paintings', 'Paintings', 'لوحات', 'Original and curated paintings', 'لوحات أصلية ومختارة', 1, true),
  ('tables', 'Tables', 'طاولات', 'Handcrafted and designer tables', 'طاولات مصنوعة ومصممة بعناية', 2, true),
  ('crochet', 'Crochet Items', 'مشغولات كروشيه', 'Handmade crochet creations', 'إبداعات كروشيه يدوية', 3, true),
  ('handmade-decor', 'Handmade Decor', 'ديكور يدوي', 'Decor pieces made by hand', 'قطع ديكور مصنوعة يدوياً', 4, true),
  ('accessories', 'Accessories', 'إكسسوارات', 'Unique accessories', 'إكسسوارات مميزة', 5, true),
  ('gifts', 'Gifts', 'هدايا', 'Thoughtful gift items', 'هدايا مميزة', 6, true),
  ('custom-orders', 'Custom Orders', 'طلبات خاصة', 'Custom-made pieces on request', 'قطع مصممة حسب الطلب', 7, true)
on conflict (slug) do nothing;

insert into public.site_settings (id, whatsapp_number, whatsapp_number_intl)
values (1, '01151515676', '201151515676')
on conflict (id) do update set
  whatsapp_number = excluded.whatsapp_number,
  whatsapp_number_intl = excluded.whatsapp_number_intl;
