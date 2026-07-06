-- Dynamic categories: table + enum->text migration + public view + RLS.
create table if not exists fg_categories (
  slug text primary key,
  label text not null,
  label_rw text,
  plural text not null,
  blurb text default '',
  synonyms text default '',
  sort int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_fg_categories_updated on fg_categories;
create trigger trg_fg_categories_updated before update on fg_categories
  for each row execute function fg_set_updated_at();

insert into fg_categories (slug,label,label_rw,plural,blurb,synonyms,sort) values
 ('cattle','Cattle','Inka','Cattle','Dairy cows, calves & breeding stock','cow cows bull bulls calf heifer dairy beef inka',1),
 ('goat','Goats','Ihene','Goats','Meat, breeding & dairy goats','goats kid buck doe ihene',2),
 ('sheep','Sheep','Intama','Sheep','Healthy sheep for meat & breeding','lamb lambs mutton ram ewe intama',3),
 ('pig','Pigs','Ingurube','Pigs','Piglets, sows & fattened pigs','pigs swine pork piglet sow boar ingurube',4),
 ('chicken','Chickens','Inkoko','Chickens','Broilers, layers & chicks','chickens hen hens broiler broilers layer layers poultry chick inkoko',5),
 ('rabbit','Rabbits','Urukwavu','Rabbits','Breeding & meat rabbit breeds','rabbits bunny kit urukwavu',6)
on conflict (slug) do nothing;

-- Migrate fg_listings.animal_type from enum -> text (drop dependent view first).
drop view if exists fg_public_listings;
alter table fg_listings alter column animal_type type text using animal_type::text;

create or replace view fg_public_listings as
  select l.id, l.seller_id, l.slug, l.title, l.title_rw, l.animal_type, l.breed, l.age_label,
    l.weight_kg, l.gender, l.purpose, l.price_rwf, l.negotiable, l.description, l.description_rw,
    l.vaccinated, l.health_notes, l.health_notes_rw, l.images, l.district, l.sector, l.status,
    l.featured, l.views, l.created_at, s.display_name as seller_display_name,
    s.district as seller_district, s.verified as seller_verified,
    s.member_since as seller_member_since, s.bio as seller_bio, s.bio_rw as seller_bio_rw,
    s.photo_url as seller_photo_url
  from fg_listings l join fg_sellers s on s.id = l.seller_id where l.status in ('active','sold');
grant select on fg_public_listings to anon, authenticated;

alter table fg_categories enable row level security;
create or replace view fg_public_categories as
  select slug,label,label_rw,plural,blurb,synonyms,sort from fg_categories where active = true;
grant select on fg_public_categories to anon, authenticated;
drop policy if exists fg_categories_admin_all on fg_categories;
create policy fg_categories_admin_all on fg_categories for all to authenticated
  using (fg_is_admin(auth.uid())) with check (fg_is_admin(auth.uid()));

create or replace function fg_increment_listing_views(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update fg_listings set views = views + 1 where id = p_id;
$$;
