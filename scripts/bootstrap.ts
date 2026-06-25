/**
 * One-time bootstrap of the live Supabase backend:
 *   1. verify the fg_ schema exists
 *   2. create the admin auth user (Ferdinand) + register in fg_admins
 *   3. seed sellers, listings, testimonials, guides (only if empty)
 *
 * Run:  npx tsx scripts/bootstrap.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { SELLERS, SELLER_CONTACTS, LISTINGS } from "../src/lib/data/seed";
import { TESTIMONIALS } from "../src/lib/data/testimonials";
import { GUIDES } from "../src/lib/data/guides";

// ---- load .env.local ----
const env: Record<string, string> = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const domain = env.ADMIN_EMAIL_DOMAIN || "farmgaterwanda.com";
const ADMIN_EMAIL = `ferdinand23@${domain}`;
const ADMIN_PASSWORD = "Ferdinand##";

const db = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  // 1. schema check
  const { error: schemaErr } = await db.from("fg_site_settings").select("id").limit(1);
  if (schemaErr) {
    console.error("❌ Schema not found. Run supabase/schema.sql first.\n", schemaErr.message);
    process.exit(1);
  }
  console.log("✓ Schema present");

  // 2. admin user
  let userId: string | undefined;
  const created = await db.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { username: "Ferdinand23" },
  });
  if (created.error) {
    if (/already|registered|exists/i.test(created.error.message)) {
      const { data } = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
      userId = data.users.find((u) => u.email === ADMIN_EMAIL)?.id;
      console.log("• Admin user already existed");
    } else throw created.error;
  } else {
    userId = created.data.user?.id;
    console.log("✓ Created admin user", ADMIN_EMAIL);
  }
  if (!userId) throw new Error("Could not resolve admin user id");

  await db.from("fg_admins").upsert({ user_id: userId, email: ADMIN_EMAIL });
  console.log("✓ Registered admin in fg_admins");

  // 3. seed sellers (only if empty)
  const { count: sellerCount } = await db
    .from("fg_sellers")
    .select("id", { count: "exact", head: true });
  const idMap: Record<string, string> = {};

  if ((sellerCount ?? 0) === 0) {
    for (const key of Object.keys(SELLERS)) {
      const s = SELLERS[key];
      const c = SELLER_CONTACTS[key];
      const { data, error } = await db
        .from("fg_sellers")
        .insert({
          display_name: s.displayName,
          full_name: c.fullName,
          phone: c.phone,
          whatsapp: c.whatsapp,
          email: c.email,
          district: s.district,
          sector: s.sector,
          bio: s.bio,
          verified: s.verified,
          member_since: `${s.memberSince}-01`,
        })
        .select("id")
        .single();
      if (error) throw error;
      idMap[key] = data.id;
    }
    console.log(`✓ Seeded ${Object.keys(idMap).length} sellers`);

    // 4. seed listings
    const rows = LISTINGS.map((l) => ({
      seller_id: idMap[l.seller.id],
      slug: l.slug,
      title: l.title,
      animal_type: l.animalType,
      breed: l.breed,
      age_label: l.ageLabel,
      weight_kg: l.weightKg,
      gender: l.gender,
      purpose: l.purpose,
      price_rwf: l.priceRwf,
      negotiable: l.negotiable,
      description: l.description,
      vaccinated: l.vaccinated,
      health_notes: l.healthNotes,
      images: l.images,
      district: l.district,
      sector: l.sector,
      status: l.status,
      featured: l.featured,
      views: l.views,
      created_at: l.createdAt,
    }));
    const { error: lerr } = await db.from("fg_listings").insert(rows);
    if (lerr) throw lerr;
    console.log(`✓ Seeded ${rows.length} listings`);
  } else {
    console.log(`• Sellers already seeded (${sellerCount}) — skipping listings`);
  }

  // 5. testimonials
  const { count: tCount } = await db
    .from("fg_testimonials")
    .select("id", { count: "exact", head: true });
  if ((tCount ?? 0) === 0) {
    const { error } = await db.from("fg_testimonials").insert(
      TESTIMONIALS.map((t, i) => ({
        name: t.name,
        location: t.location,
        role: t.role,
        quote: t.quote,
        rating: t.rating,
        published: true,
        sort: i,
      })),
    );
    if (error) throw error;
    console.log(`✓ Seeded ${TESTIMONIALS.length} testimonials`);
  } else console.log(`• Testimonials already seeded (${tCount})`);

  // 6. guides
  const { count: gCount } = await db
    .from("fg_guides")
    .select("id", { count: "exact", head: true });
  if ((gCount ?? 0) === 0) {
    const { error } = await db.from("fg_guides").insert(
      GUIDES.map((g) => ({
        slug: g.slug,
        title: g.title,
        excerpt: g.excerpt,
        body: g.body,
        cover_image: g.coverImage,
        author: g.author,
        tags: g.tags,
        read_mins: g.readMins,
        published: g.published,
        published_at: g.publishedAt,
      })),
    );
    if (error) throw error;
    console.log(`✓ Seeded ${GUIDES.length} guides`);
  } else console.log(`• Guides already seeded (${gCount})`);

  console.log("\n✅ Bootstrap complete.");
  console.log(`   Admin login → username: Ferdinand23  (email ${ADMIN_EMAIL})`);
}

main().catch((e) => {
  console.error("Bootstrap failed:", e);
  process.exit(1);
});
