-- ============================================================================
-- FarmGate RW — Supabase schema + Row-Level Security
-- ----------------------------------------------------------------------------
-- Design goal: a buyer (the anonymous `anon` role used by the browser) can read
-- listings but can NEVER read a seller's contact details, and can write an
-- inquiry but never read inquiries. This is the platform's core leverage:
-- FarmGate owns every buyer<->seller connection.
--
-- The contact-hiding is enforced two ways that must BOTH hold:
--   1. RLS is enabled on every base table and `anon` is granted NO select policy
--      on `sellers` / `inquiries` / `seller_applications`.
--   2. The browser only ever reads through SECURITY DEFINER views that expose a
--      hand-picked set of safe columns. Even a crafted query against the base
--      tables returns nothing for `anon`.
--
-- Run this in the Supabase SQL editor.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------- enums -----------------------------------------------------------
do $$ begin
  create type animal_type as enum ('cattle','goat','sheep','pig','chicken','rabbit');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_status as enum ('pending','active','sold','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type inquiry_status as enum
    ('new','contacted','viewing_scheduled','closed_won','closed_lost');
exception when duplicate_object then null; end $$;

-- ---------- updated_at trigger ----------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- sellers (contacts live here — NEVER exposed to anon) -------------
create table if not exists sellers (
  id            uuid primary key default gen_random_uuid(),
  display_name  text not null,
  full_name     text not null,          -- private
  phone         text not null,          -- private
  whatsapp      text,                   -- private
  email         text,                   -- private
  district      text not null,
  sector        text not null,
  bio           text default '',
  photo_url     text,
  verified      boolean not null default false,
  member_since  date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
drop trigger if exists trg_sellers_updated on sellers;
create trigger trg_sellers_updated before update on sellers
  for each row execute function set_updated_at();

-- ---------- listings --------------------------------------------------------
create table if not exists listings (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid not null references sellers(id) on delete cascade,
  slug         text not null unique,
  title        text not null,
  animal_type  animal_type not null,
  breed        text not null,
  age_label    text not null,
  weight_kg    numeric,
  gender       text not null,
  purpose      text not null,
  price_rwf    integer not null check (price_rwf >= 0),
  negotiable   boolean not null default false,
  description  text not null default '',
  vaccinated   boolean not null default false,
  health_notes text,
  images       text[] not null default '{}',
  district     text not null,
  sector       text not null,
  status       listing_status not null default 'pending',
  featured     boolean not null default false,
  views        integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists trg_listings_updated on listings;
create trigger trg_listings_updated before update on listings
  for each row execute function set_updated_at();

create index if not exists idx_listings_status   on listings(status);
create index if not exists idx_listings_type      on listings(animal_type);
create index if not exists idx_listings_district  on listings(district);

-- ---------- inquiries (buyer leads — anon may INSERT, never SELECT) ----------
create table if not exists inquiries (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid references listings(id) on delete set null,
  buyer_name    text not null,
  buyer_phone   text not null,
  buyer_district text not null,
  message       text default '',
  status        inquiry_status not null default 'new',
  created_at    timestamptz not null default now()
);
create index if not exists idx_inquiries_status on inquiries(status);

-- ---------- seller applications (anon may INSERT, never SELECT) --------------
create table if not exists seller_applications (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  phone        text not null,
  district     text not null,
  animal_type  text not null,
  animal_count text default '',
  details      text default '',
  created_at   timestamptz not null default now()
);

-- ============================================================================
-- Row-Level Security
-- ============================================================================
alter table sellers              enable row level security;
alter table listings             enable row level security;
alter table inquiries            enable row level security;
alter table seller_applications  enable row level security;

-- No SELECT/INSERT/UPDATE policies are created for `anon` or `authenticated`
-- on `sellers`, `inquiries` or `seller_applications` reads. With RLS enabled
-- and no permissive policy, those roles get nothing. The service role (used by
-- trusted server code) bypasses RLS entirely.

-- Buyers may submit an inquiry (insert only, basic shape validation).
drop policy if exists inquiries_insert_anon on inquiries;
create policy inquiries_insert_anon on inquiries
  for insert to anon, authenticated
  with check (
    char_length(buyer_name)  between 2 and 120 and
    char_length(buyer_phone) between 9 and 15  and
    char_length(buyer_district) between 2 and 60
  );

-- Keepers may submit an application (insert only).
drop policy if exists applications_insert_anon on seller_applications;
create policy applications_insert_anon on seller_applications
  for insert to anon, authenticated
  with check (
    char_length(full_name) between 2 and 120 and
    char_length(phone)     between 9 and 15
  );

-- ============================================================================
-- Public views — the ONLY way the browser reads marketplace data.
-- SECURITY DEFINER (default for views): they run with the owner's rights and
-- expose exactly the safe columns below. Seller phone/whatsapp/email/full_name
-- are simply not selected, so they cannot leak.
-- ============================================================================
create or replace view public_sellers as
  select id, display_name, district, sector, verified, member_since,
         bio, photo_url
  from sellers;

create or replace view public_listings as
  select
    l.id, l.seller_id, l.slug, l.title, l.animal_type, l.breed, l.age_label,
    l.weight_kg, l.gender, l.purpose, l.price_rwf, l.negotiable, l.description,
    l.vaccinated, l.health_notes, l.images, l.district, l.sector, l.status,
    l.featured, l.views, l.created_at,
    s.display_name as seller_display_name,
    s.district     as seller_district,
    s.verified     as seller_verified,
    s.member_since as seller_member_since,
    s.bio          as seller_bio,
    s.photo_url    as seller_photo_url
  from listings l
  join sellers s on s.id = l.seller_id
  where l.status in ('active','sold');

-- Lock base tables away from the public roles; grant only the safe views.
revoke all on sellers, listings from anon, authenticated;
grant select on public_sellers, public_listings to anon, authenticated;

-- ============================================================================
-- Seed an initial keeper (FarmGate founder). Run once.
-- ============================================================================
-- insert into sellers (display_name, full_name, phone, whatsapp, district, sector, verified)
-- values ('Ferdinand N.', 'Ferdinand Nzabirinda', '250783358497', '250783358497',
--         'Bugesera', 'Nyamata', true);
