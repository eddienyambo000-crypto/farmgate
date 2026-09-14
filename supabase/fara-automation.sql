-- ============================================================================
-- Farmgate × Fara — automation schema for the Farmgate Supabase project
-- ----------------------------------------------------------------------------
-- Run in the SQL editor, as the default `postgres` role, AFTER:
--   1. supabase/schema.sql
--   2. supabase/migrate-categories.sql
-- Safe to re-run. If migrate-categories.sql is ever re-run, re-run this file
-- afterwards: that script drops and recreates fg_public_listings, which drops
-- Fara's grant on it.
--
-- What this adds
--   1. `ops` schema — Fara's memory: leads, conversation history, follow-up
--      queue, knowledge vectors, campaign creatives, want-list, marketplace
--      events and weekly price history. Not exposed to the Data
--      API: the browser (anon / authenticated) can never read a conversation.
--   2. `source` + `session_id` on fg_inquiries and fg_seller_applications, so a
--      lead Fara captures is the same row the admin panel already works from.
--   3. Three triggers that keep both sides in sync with no extra workflow:
--        - Fara creates an inquiry           -> her lead is linked to it
--        - the team changes status in /admin -> Fara's lead stage follows, so
--          she stops following up with someone a human is handling
--        - a listing goes live, changes price or sells -> Fara hears about
--          it (want-list alerts, price-drop follow-ups)
--   4. `fara_agent` — the only role Fara's n8n server uses. Reads the public
--      marketplace views, inserts inquiries/applications marked source='fara',
--      and owns `ops`. It cannot see a keeper's phone number, cannot read any
--      website-form lead, and cannot write a row posing as one.
--
-- The role is created WITHOUT a password. Give it one separately, in the SQL
-- editor only (see the handoff) — never commit it.
-- ============================================================================

create extension if not exists vector with schema extensions;
create schema if not exists ops;


-- ---------- the role n8n connects as ----------------------------------------
do $$ begin
  create role fara_agent nologin noinherit;
exception when duplicate_object then null; end $$;

-- `ops` first: Fara's memory and vector nodes use unqualified table names, so
-- they resolve here. `extensions` so the pgvector type and <=> operator resolve.
alter role fara_agent set search_path = ops, public, extensions;


-- ---------- link columns on the website's lead tables -----------------------
alter table fg_inquiries
  add column if not exists source text not null default 'website',
  add column if not exists session_id text;

alter table fg_seller_applications
  add column if not exists source text not null default 'website',
  add column if not exists session_id text;

do $$ begin
  alter table fg_inquiries add constraint fg_inquiries_source_chk
    check (source in ('website', 'chat_widget', 'fara'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table fg_seller_applications add constraint fg_applications_source_chk
    check (source in ('website', 'chat_widget', 'fara'));
exception when duplicate_object then null; end $$;

create index if not exists idx_fg_inquiries_session
  on fg_inquiries (session_id) where session_id is not null;
create index if not exists idx_fg_applications_session
  on fg_seller_applications (session_id) where session_id is not null;


-- ---------- ops: people ------------------------------------------------------
-- One row per person Fara has spoken to. session_id is the identity key:
-- 'web:<id>' on the website, 'wa:2507XXXXXXXX' on WhatsApp later.
create table if not exists ops.leads (
  id               bigserial primary key,
  session_id       text unique not null,
  channel          text not null default 'web',
  user_ref         text,
  name             text,
  phone            text,
  district         text,
  animal_type      text,
  budget_rwf       integer,
  timeframe        text,
  intent           text    not null default 'unknown',  -- buyer | keeper | unknown
  score            integer not null default 0,          -- 0-100
  stage            text    not null default 'new',      -- new|cold|warm|hot|contacted|viewing_scheduled|closed_won|closed_lost
  campaign_tag     text,
  inquiry_id       uuid references public.fg_inquiries(id) on delete set null,
  followup_count   integer not null default 0,
  next_followup_at timestamptz,
  opted_out        boolean not null default false,
  last_message_at  timestamptz default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists leads_due_idx   on ops.leads (next_followup_at) where opted_out = false;
create index if not exists leads_stage_idx on ops.leads (stage);
create index if not exists leads_phone_idx on ops.leads (phone);


-- ---------- ops: what happened ------------------------------------------------
-- Append-only trail: every turn, score, follow-up, alert and status change.
create table if not exists ops.lead_events (
  id         bigserial primary key,
  session_id text not null,
  event_type text not null,  -- turn|scored|followup_sent|alert|outbound_queued|outbound_delivered|inquiry_status
  payload    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists lead_events_session_idx on ops.lead_events (session_id, created_at desc);
create index if not exists lead_events_type_idx    on ops.lead_events (event_type);


-- ---------- ops: knowledge sync + campaigns ---------------------------------
create table if not exists ops.knowledge_sources (
  url          text primary key,
  content_hash text not null,
  chunks       integer not null default 0,
  last_synced  timestamptz not null default now()
);

create table if not exists ops.campaign_creatives (
  id           bigserial primary key,
  listing_slug text,
  animal_type  text,
  variant      integer not null default 1,
  headline_en  text, body_en text,
  headline_rw  text, body_rw text,
  image_url    text,
  campaign_tag text unique not null,
  status       text not null default 'pending_review',
  created_at   timestamptz not null default now()
);


-- ---------- ops: conversation memory ----------------------------------------
-- Shape written by n8n's "Postgres Chat Memory" node (LangChain
-- PostgresChatMessageHistory). Table and column names must not change.
create table if not exists ops.ops_chat_memory (
  id         serial primary key,
  session_id text  not null,
  message    jsonb not null
);
create index if not exists ops_chat_memory_session_idx on ops.ops_chat_memory (session_id);


-- ---------- ops: knowledge vectors ------------------------------------------
-- Columns match n8n's PGVector node defaults. 1536 dims = text-embedding-3-small.
create table if not exists ops.ops_knowledge (
  id        uuid primary key default gen_random_uuid(),
  text      text,
  metadata  jsonb,
  embedding extensions.vector(1536)
);
create index if not exists ops_knowledge_embedding_idx
  on ops.ops_knowledge using hnsw (embedding extensions.vector_cosine_ops);


-- ---------- ops: want-list (buyers waiting for an animal) --------------------
-- When nothing matches, Fara saves what the person wants. When a matching
-- listing goes live, or an animal they asked about drops in price, the
-- follow-up engine tells them.
create table if not exists ops.want_list (
  id                       bigserial primary key,
  session_id               text not null references ops.leads(session_id) on delete cascade,
  animal_type              text not null,     -- fg_categories.slug
  district                 text,
  max_price_rwf            integer,
  notes                    text,
  active                   boolean not null default true,
  last_notified_listing_id uuid,              -- fg_listings.id Fara last told them about
  notified_at              timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index if not exists want_list_active_idx on ops.want_list (animal_type, district) where active;


-- ---------- ops: marketplace changes Fara reacts to --------------------------
-- Written by a trigger on fg_listings, so Fara never polls or diffs listings:
--   listed         a listing became active
--   price_changed  a live listing's price changed
--   sold           a listing was marked sold
-- The workflow that handles a row sets processed_at.
create table if not exists ops.listing_events (
  id            bigserial primary key,
  listing_id    uuid not null,                -- fg_listings.id (no FK: listings can be deleted)
  event_type    text not null check (event_type in ('listed', 'price_changed', 'sold')),
  animal_type   text,
  district      text,
  old_price_rwf integer,
  new_price_rwf integer,
  created_at    timestamptz not null default now(),
  processed_at  timestamptz
);
create index if not exists listing_events_pending_idx on ops.listing_events (created_at) where processed_at is null;


-- ---------- ops: weekly price history ----------------------------------------
-- Snapshots behind the weekly price report, so it can show a trend, not only
-- today's prices. district = '' is the all-districts row.
create table if not exists ops.price_snapshots (
  week_start       date    not null,
  animal_type      text    not null,
  district         text    not null default '',
  listings         integer not null,
  min_price_rwf    integer,
  median_price_rwf integer,
  max_price_rwf    integer,
  created_at       timestamptz not null default now(),
  primary key (week_start, animal_type, district)
);


-- ---------- privileges: ops belongs to Fara ---------------------------------
revoke all on schema ops from public, anon, authenticated;
revoke all on all tables in schema ops from public, anon, authenticated;

grant usage, create on schema ops to fara_agent;
grant select, insert, update on all tables in schema ops to fara_agent;
grant usage, select on all sequences in schema ops to fara_agent;
alter default privileges in schema ops grant select, insert, update on tables to fara_agent;
alter default privileges in schema ops grant usage, select on sequences to fara_agent;
-- A knowledge reload replaces the whole vector set (truncate, then re-embed).
-- Leads, events and conversations stay undeletable for Fara.
grant delete, truncate on ops.ops_knowledge to fara_agent;


-- ---------- privileges: the marketplace, as the browser sees it -------------
grant usage on schema public, extensions to fara_agent;
grant select on fg_public_listings, fg_public_categories, fg_public_guides to fara_agent;

-- Leads: Fara inserts, and reads back only its own rows (RETURNING id needs it).
grant insert on fg_inquiries, fg_seller_applications to fara_agent;
grant select (id, source, session_id, status, created_at) on fg_inquiries to fara_agent;
grant select (id, source, session_id, created_at) on fg_seller_applications to fara_agent;

drop policy if exists fg_inquiries_fara_insert on fg_inquiries;
create policy fg_inquiries_fara_insert on fg_inquiries for insert to fara_agent
  with check (
    source = 'fara' and session_id is not null and
    char_length(buyer_name) between 2 and 120 and
    char_length(buyer_phone) between 9 and 15
  );

drop policy if exists fg_inquiries_fara_select on fg_inquiries;
create policy fg_inquiries_fara_select on fg_inquiries for select to fara_agent
  using (source = 'fara');

drop policy if exists fg_applications_fara_insert on fg_seller_applications;
create policy fg_applications_fara_insert on fg_seller_applications for insert to fara_agent
  with check (
    source = 'fara' and session_id is not null and
    char_length(full_name) between 2 and 120 and
    char_length(phone) between 9 and 15
  );

drop policy if exists fg_applications_fara_select on fg_seller_applications;
create policy fg_applications_fara_select on fg_seller_applications for select to fara_agent
  using (source = 'fara');

-- The browser may not forge a Fara lead: without this, anyone with the anon key
-- could insert source='fara' rows and attach them to a real conversation.
drop policy if exists fg_inquiries_no_forged_fara on fg_inquiries;
create policy fg_inquiries_no_forged_fara on fg_inquiries as restrictive
  for insert to anon, authenticated
  with check (source <> 'fara');

drop policy if exists fg_applications_no_forged_fara on fg_seller_applications;
create policy fg_applications_no_forged_fara on fg_seller_applications as restrictive
  for insert to anon, authenticated
  with check (source <> 'fara');


-- ---------- sync 1: a Fara inquiry is linked to its lead --------------------
create or replace function ops.link_fara_inquiry()
returns trigger language plpgsql security definer set search_path = ops, public as $$
begin
  if new.source = 'fara' and new.session_id is not null then
    update ops.leads
       set inquiry_id = new.id, updated_at = now()
     where session_id = new.session_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_fg_inquiries_link_fara on fg_inquiries;
create trigger trg_fg_inquiries_link_fara
  after insert on fg_inquiries
  for each row execute function ops.link_fara_inquiry();


-- ---------- sync 2: the team's status changes steer Fara --------------------
-- contacted / viewing_scheduled -> a human has taken over, follow-ups stop
-- closed_won / closed_lost     -> finished, follow-up schedule cleared
-- back to new                  -> Fara's scorer takes over again
create or replace function ops.sync_inquiry_status()
returns trigger language plpgsql security definer set search_path = ops, public as $$
begin
  if new.session_id is null or new.status is not distinct from old.status then
    return new;
  end if;

  update ops.leads
     set stage = new.status::text,
         next_followup_at = case when new.status::text in ('closed_won', 'closed_lost')
                                 then null else next_followup_at end,
         updated_at = now()
   where session_id = new.session_id;

  insert into ops.lead_events (session_id, event_type, payload)
  values (new.session_id, 'inquiry_status',
          jsonb_build_object('inquiry_id', new.id, 'from', old.status, 'to', new.status));
  return new;
end $$;

drop trigger if exists trg_fg_inquiries_sync_fara on fg_inquiries;
create trigger trg_fg_inquiries_sync_fara
  after update of status on fg_inquiries
  for each row execute function ops.sync_inquiry_status();

-- ---------- sync 3: marketplace changes reach Fara --------------------------
-- Not fired by a data load run with session_replication_role = replica, so a
-- migration never floods Fara with "listed" events for existing stock.
create or replace function ops.record_listing_event()
returns trigger language plpgsql security definer set search_path = ops, public as $$
begin
  if tg_op = 'INSERT' then
    if new.status::text = 'active' then
      insert into ops.listing_events (listing_id, event_type, animal_type, district, new_price_rwf)
      values (new.id, 'listed', new.animal_type::text, new.district, new.price_rwf);
    end if;
    return new;
  end if;

  if new.status::text = 'active' and old.status::text <> 'active' then
    insert into ops.listing_events (listing_id, event_type, animal_type, district, new_price_rwf)
    values (new.id, 'listed', new.animal_type::text, new.district, new.price_rwf);
  elsif new.status::text = 'active' and old.price_rwf is distinct from new.price_rwf then
    insert into ops.listing_events (listing_id, event_type, animal_type, district, old_price_rwf, new_price_rwf)
    values (new.id, 'price_changed', new.animal_type::text, new.district, old.price_rwf, new.price_rwf);
  elsif new.status::text = 'sold' and old.status::text <> 'sold' then
    insert into ops.listing_events (listing_id, event_type, animal_type, district, old_price_rwf, new_price_rwf)
    values (new.id, 'sold', new.animal_type::text, new.district, old.price_rwf, new.price_rwf);
  end if;
  return new;
end $$;

drop trigger if exists trg_fg_listings_fara_events on fg_listings;
create trigger trg_fg_listings_fara_events
  after insert or update of status, price_rwf on fg_listings
  for each row execute function ops.record_listing_event();

revoke all on function ops.link_fara_inquiry(), ops.sync_inquiry_status(), ops.record_listing_event() from public;


-- ---------- verify ------------------------------------------------------------
-- Expect: ops_tables = 9, pgvector set, agent_role = fara_agent, sync_triggers = 3
select
  (select count(*) from information_schema.tables where table_schema = 'ops')  as ops_tables,
  (select extversion from pg_extension where extname = 'vector')                as pgvector,
  (select rolname from pg_roles where rolname = 'fara_agent')                   as agent_role,
  (select count(*) from pg_trigger
     where tgname in ('trg_fg_inquiries_link_fara', 'trg_fg_inquiries_sync_fara',
                      'trg_fg_listings_fara_events')) as sync_triggers;
