-- MD Gallery initial schema
-- Run in Supabase SQL editor or via supabase db push

create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type public.user_role as enum ('admin', 'customer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.discount_type as enum ('none', 'percentage', 'fixed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.review_type as enum ('platform', 'product');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.moderation_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.request_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)), 'customer')
  on conflict (id) do update set email = excluded.email;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_ar text not null,
  description_en text,
  description_ar text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

-- Items
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  sku text,
  slug text unique,
  is_visible boolean not null default true,
  is_featured boolean not null default false,
  name_en text not null,
  name_ar text not null,
  short_description_en text,
  short_description_ar text,
  description_en text,
  description_ar text,
  material_en text,
  material_ar text,
  dimensions_en text,
  dimensions_ar text,
  color_en text,
  color_ar text,
  technique_craft_en text,
  technique_craft_ar text,
  care_instructions_en text,
  care_instructions_ar text,
  availability_note_en text,
  availability_note_ar text,
  notes_en text,
  notes_ar text,
  price_egp numeric(12,2) not null check (price_egp >= 0),
  currency text not null default 'EGP',
  discount_type public.discount_type not null default 'none',
  discount_value numeric(12,2) not null default 0 check (discount_value >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint discount_percentage_range check (discount_type <> 'percentage' or discount_value <= 100),
  constraint discount_fixed_range check (discount_type <> 'fixed' or discount_value <= price_egp)
);
create index if not exists items_category_visible_idx on public.items(category_id, is_visible);
create trigger items_updated_at before update on public.items
  for each row execute function public.set_updated_at();

-- Item images (1+)
create table if not exists public.item_images (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  alt_en text,
  alt_ar text,
  created_at timestamptz not null default now()
);
create index if not exists item_images_item_sort_idx on public.item_images(item_id, sort_order);

-- Purchase eligibility requests (Option 2)
create table if not exists public.purchase_eligibility_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  purchase_reference text not null,
  proof_note text,
  status public.request_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists per_user_status_idx on public.purchase_eligibility_requests(user_id, status);
create trigger per_updated_at before update on public.purchase_eligibility_requests
  for each row execute function public.set_updated_at();

-- Granted eligibility
create table if not exists public.purchase_eligibility (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  granted_by uuid references public.profiles(id),
  source_request_id uuid references public.purchase_eligibility_requests(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);
create index if not exists pe_user_item_idx on public.purchase_eligibility(user_id, item_id);

-- Reviews (platform or product)
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  type public.review_type not null,
  item_id uuid references public.items(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text not null,
  status public.moderation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_review_item check (type <> 'product' or item_id is not null)
);
create index if not exists reviews_type_item_status_idx on public.reviews(type, item_id, status);
create trigger reviews_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();

-- Review replies
create table if not exists public.review_replies (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  status public.moderation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists review_replies_review_status_idx on public.review_replies(review_id, status);
create trigger review_replies_updated_at before update on public.review_replies
  for each row execute function public.set_updated_at();

-- Wall posts
create table if not exists public.wall_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  image_path text not null,
  caption text,
  status public.moderation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists wall_posts_status_item_idx on public.wall_posts(status, item_id);
create trigger wall_posts_updated_at before update on public.wall_posts
  for each row execute function public.set_updated_at();

-- Site settings (single-row / key config)
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  whatsapp_number text not null default '01151515676',
  whatsapp_number_intl text not null default '201151515676',
  instagram_url text,
  facebook_url text,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Helper: is admin
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles p where p.id = uid and p.role = 'admin');
$$;

-- Helper: has purchase eligibility
create or replace function public.has_purchase_eligibility(uid uuid, p_item_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.purchase_eligibility pe where pe.user_id = uid and pe.item_id = p_item_id);
$$;
