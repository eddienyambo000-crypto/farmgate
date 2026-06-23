# FarmGate RW — Rwanda's Livestock Marketplace

A production-grade marketplace connecting verified animal keepers with buyers
across Rwanda. Buyers browse cattle, goats, pigs, chickens, sheep and rabbits,
then request an animal **through the platform** — seller contact details are
never exposed. FarmGate owns every buyer↔seller connection, which is the core of
the business model.

## Tech stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **TypeScript** (strict)
- **Tailwind CSS v4**
- **Supabase** (Postgres + RLS) — optional; the app runs on seed data without it

## The leverage model (read this first)

The single most important rule: **the public never sees a seller's contact
details.** It is enforced in two independent layers so it can't leak by accident:

1. **Type system** — public code can only touch `PublicSeller` / `PublicListing`
   ([`src/lib/types.ts`](src/lib/types.ts)), which have no phone/email fields.
   Contacts live in `SellerContact`, imported only by server-only modules.
2. **Database** — `sellers` / `inquiries` have RLS enabled with no read policy
   for the `anon` role. The browser reads only through the `public_listings` /
   `public_sellers` security-definer views, which select safe columns only. See
   [`supabase/schema.sql`](supabase/schema.sql).

Every buyer interest becomes a row in `inquiries` (anon can INSERT, never
SELECT). The FarmGate team routes the deal from the admin dashboard.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

No environment variables are required for local development — the app uses seed
data ([`src/lib/data/seed.ts`](src/lib/data/seed.ts)) and in-memory stores.

## Going live with Supabase

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. Copy `.env.example` → `.env.local` and fill in the Supabase keys + admin
   credentials.
4. Swap the seed queries in [`src/lib/data/listings.ts`](src/lib/data/listings.ts)
   for the `public_listings` view (single, isolated layer).

## Admin

`/admin` — manage buyer leads, keeper applications, listings and verification.
Protected by a signed, httpOnly cookie (`ADMIN_PASSWORD` / `ADMIN_SECRET`).
Excluded from search engines via `robots.ts`.

## Project structure

```
src/
  app/                Next.js routes (marketplace, content, admin)
  components/          UI components (server + client)
  lib/
    actions/          Server Actions (inquiry, seller, auth)
    data/             Data-access layer + seed + in-memory stores
    supabase/         Supabase clients + config
    types.ts          Public vs. private domain types (contact gating)
supabase/schema.sql   Postgres schema + RLS + public views
```

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint
