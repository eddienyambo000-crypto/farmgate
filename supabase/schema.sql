-- ============================================================================
-- Farmgate Rwanda — Supabase schema v2  (ALL objects prefixed `fg_`)
-- ----------------------------------------------------------------------------
-- Everything is namespaced with `fg_` (tables, views, enums, functions,
-- policies) and storage buckets with `fg-`, so this is fully isolated and can
-- run safely inside a SHARED Supabase project alongside other apps without any
-- name collisions. Run once in the SQL editor. Safe to re-run.
--
-- Security model (defense in depth):
--   * The anon role (browser) READS only through fg_public_* SECURITY DEFINER
--     views (safe columns only — never a seller's phone/email). It may INSERT
--     inquiries/applications but never SELECT them.
--   * The authenticated ADMIN is recognised via fg_admins; fg_is_admin() gates
--     every write/read on the base tables.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------- enums -----------------------------------------------------------
do $$ begin create type fg_animal_type as enum
  ('cattle','goat','sheep','pig','chicken','rabbit');
exception when duplicate_object then null; end $$;

do $$ begin create type fg_listing_status as enum
  ('pending','active','sold','rejected');
exception when duplicate_object then null; end $$;

do $$ begin create type fg_inquiry_status as enum
  ('new','contacted','viewing_scheduled','closed_won','closed_lost');
exception when duplicate_object then null; end $$;

-- ---------- helpers ---------------------------------------------------------
create or replace function fg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table if not exists fg_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email   text not null,
  created_at timestamptz not null default now()
);

create or replace function fg_is_admin(uid uuid)
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (select 1 from fg_admins where user_id = uid);
$$;

-- ---------- sellers (contacts private) --------------------------------------
create table if not exists fg_sellers (
  id            uuid primary key default gen_random_uuid(),
  display_name  text not null,
  full_name     text not null,
  phone         text not null,
  whatsapp      text,
  email         text,
  district      text not null,
  sector        text not null default '',
  bio           text default '',
  bio_rw        text,
  photo_url     text,
  verified      boolean not null default false,
  status        text not null default 'active',
  subscription_plan  text,
  subscription_until date,
  member_since  date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
drop trigger if exists trg_fg_sellers_updated on fg_sellers;
create trigger trg_fg_sellers_updated before update on fg_sellers
  for each row execute function fg_set_updated_at();

-- ---------- listings --------------------------------------------------------
create table if not exists fg_listings (
  id            uuid primary key default gen_random_uuid(),
  seller_id     uuid not null references fg_sellers(id) on delete cascade,
  slug          text not null unique,
  title         text not null,
  title_rw      text,
  animal_type   fg_animal_type not null,
  breed         text not null default '',
  age_label     text not null default '',
  weight_kg     numeric,
  gender        text not null default 'mixed',
  purpose       text not null default 'general',
  price_rwf     integer not null check (price_rwf >= 0),
  negotiable    boolean not null default false,
  description   text not null default '',
  description_rw text,
  vaccinated    boolean not null default false,
  health_notes  text,
  health_notes_rw text,
  images        text[] not null default '{}',
  district      text not null,
  sector        text not null default '',
  status        fg_listing_status not null default 'pending',
  featured      boolean not null default false,
  featured_until date,
  views         integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
drop trigger if exists trg_fg_listings_updated on fg_listings;
create trigger trg_fg_listings_updated before update on fg_listings
  for each row execute function fg_set_updated_at();
create index if not exists idx_fg_listings_status   on fg_listings(status);
create index if not exists idx_fg_listings_type     on fg_listings(animal_type);
create index if not exists idx_fg_listings_district on fg_listings(district);

-- ---------- inquiries (buyer leads) -----------------------------------------
create table if not exists fg_inquiries (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid references fg_listings(id) on delete set null,
  listing_title text,
  buyer_name    text not null,
  buyer_phone   text not null,
  buyer_district text not null,
  message       text default '',
  notes         text default '',
  status        fg_inquiry_status not null default 'new',
  created_at    timestamptz not null default now()
);
create index if not exists idx_fg_inquiries_status  on fg_inquiries(status);
create index if not exists idx_fg_inquiries_created on fg_inquiries(created_at);

-- ---------- seller applications ---------------------------------------------
create table if not exists fg_seller_applications (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  phone        text not null,
  district     text not null,
  animal_type  text not null,
  animal_count text default '',
  details      text default '',
  created_at   timestamptz not null default now()
);

-- ---------- testimonials ----------------------------------------------------
create table if not exists fg_testimonials (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  location   text not null default '',
  role       text not null default 'Buyer',
  quote      text not null,
  quote_rw   text,
  rating     int not null default 5 check (rating between 1 and 5),
  photo_url  text,
  published  boolean not null default true,
  sort       int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- guides / blog ---------------------------------------------------
create table if not exists fg_guides (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  title_rw     text,
  excerpt      text not null default '',
  excerpt_rw   text,
  body         text not null default '',
  body_rw      text,
  cover_image  text,
  author       text not null default 'Farmgate',
  tags         text[] not null default '{}',
  read_mins    int not null default 4,
  published    boolean not null default false,
  published_at timestamptz not null default now(),
  views        int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists trg_fg_guides_updated on fg_guides;
create trigger trg_fg_guides_updated before update on fg_guides
  for each row execute function fg_set_updated_at();

-- ---------- site settings (singleton row id = 1) ----------------------------
create table if not exists fg_site_settings (
  id               int primary key default 1 check (id = 1),
  logo_url         text,
  hero_title       text,
  hero_title_rw    text,
  hero_subtitle    text,
  hero_subtitle_rw text,
  contact_phone    text,
  contact_email    text,
  contact_whatsapp text,
  socials          jsonb not null default '{}',
  stats            jsonb not null default '{}',
  announcement     text,
  announcement_rw  text,
  featured_ids     text[] not null default '{}',
  updated_at       timestamptz not null default now()
);
insert into fg_site_settings (id) values (1) on conflict (id) do nothing;
drop trigger if exists trg_fg_settings_updated on fg_site_settings;
create trigger trg_fg_settings_updated before update on fg_site_settings
  for each row execute function fg_set_updated_at();

create or replace function fg_increment_listing_views(p_id uuid)
returns void language sql as $$
  update fg_listings set views = views + 1 where id = p_id;
$$;

-- ============================================================================
-- Row-Level Security
-- ============================================================================
alter table fg_admins              enable row level security;
alter table fg_sellers             enable row level security;
alter table fg_listings            enable row level security;
alter table fg_inquiries           enable row level security;
alter table fg_seller_applications enable row level security;
alter table fg_testimonials        enable row level security;
alter table fg_guides              enable row level security;
alter table fg_site_settings       enable row level security;

drop policy if exists fg_inquiries_insert_anon on fg_inquiries;
create policy fg_inquiries_insert_anon on fg_inquiries for insert to anon, authenticated
  with check (
    char_length(buyer_name) between 2 and 120 and
    char_length(buyer_phone) between 9 and 15 and
    char_length(buyer_district) between 2 and 60
  );

drop policy if exists fg_applications_insert_anon on fg_seller_applications;
create policy fg_applications_insert_anon on fg_seller_applications for insert to anon, authenticated
  with check (char_length(full_name) between 2 and 120 and char_length(phone) between 9 and 15);

do $$
declare t text;
begin
  foreach t in array array[
    'fg_admins','fg_sellers','fg_listings','fg_inquiries','fg_seller_applications',
    'fg_testimonials','fg_guides','fg_site_settings'
  ] loop
    execute format('drop policy if exists %I_admin_all on %I;', t, t);
    execute format(
      'create policy %I_admin_all on %I for all to authenticated
         using (fg_is_admin(auth.uid())) with check (fg_is_admin(auth.uid()));', t, t);
  end loop;
end $$;

-- ============================================================================
-- Public views — the ONLY marketplace read path for the browser.
-- ============================================================================
create or replace view fg_public_sellers as
  select id, display_name, district, sector, verified, member_since, bio, bio_rw, photo_url
  from fg_sellers where status = 'active';

create or replace view fg_public_listings as
  select
    l.id, l.seller_id, l.slug, l.title, l.title_rw, l.animal_type, l.breed,
    l.age_label, l.weight_kg, l.gender, l.purpose, l.price_rwf, l.negotiable,
    l.description, l.description_rw, l.vaccinated, l.health_notes, l.health_notes_rw,
    l.images, l.district, l.sector, l.status, l.featured, l.views, l.created_at,
    s.display_name as seller_display_name, s.district as seller_district,
    s.verified as seller_verified, s.member_since as seller_member_since,
    s.bio as seller_bio, s.bio_rw as seller_bio_rw, s.photo_url as seller_photo_url
  from fg_listings l join fg_sellers s on s.id = l.seller_id
  where l.status in ('active','sold');

create or replace view fg_public_testimonials as
  select id, name, location, role, quote, quote_rw, rating, photo_url, sort
  from fg_testimonials where published = true;

create or replace view fg_public_guides as
  select id, slug, title, title_rw, excerpt, excerpt_rw, body, body_rw,
         cover_image, author, tags, read_mins, published_at, views
  from fg_guides where published = true;

revoke all on fg_sellers, fg_listings, fg_testimonials, fg_guides from anon, authenticated;
grant select on fg_public_sellers, fg_public_listings, fg_public_testimonials, fg_public_guides
  to anon, authenticated;
grant select on fg_site_settings to anon, authenticated;
drop policy if exists fg_settings_public_read on fg_site_settings;
create policy fg_settings_public_read on fg_site_settings for select to anon, authenticated
  using (true);

-- ============================================================================
-- Storage — public-read buckets for animal photos + brand assets (fg- prefix).
-- ============================================================================
insert into storage.buckets (id, name, public) values
  ('fg-listings','fg-listings',true), ('fg-brand','fg-brand',true)
on conflict (id) do nothing;

drop policy if exists fg_storage_public_read on storage.objects;
create policy fg_storage_public_read on storage.objects for select to anon, authenticated
  using (bucket_id in ('fg-listings','fg-brand'));

drop policy if exists fg_storage_admin_write on storage.objects;
create policy fg_storage_admin_write on storage.objects for all to authenticated
  using (bucket_id in ('fg-listings','fg-brand') and fg_is_admin(auth.uid()))
  with check (bucket_id in ('fg-listings','fg-brand') and fg_is_admin(auth.uid()));

-- ============================================================================
-- After running this: Authentication → Users → Add user (email + password,
-- Auto Confirm). Then register that user as a Farmgate admin:
--   insert into fg_admins (user_id, email)
--   values ('<auth-user-uuid>', 'owner@farmgaterwanda.com');
-- ============================================================================
