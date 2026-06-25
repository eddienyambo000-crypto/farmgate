import "server-only";

/**
 * Guides / blog — the organic-SEO engine. Seed content now; becomes
 * Supabase-backed and admin-editable when keys are configured. Bodies are
 * Markdown. RW fields are optional (owner fills from admin).
 */
export interface Guide {
  id: string;
  slug: string;
  title: string;
  titleRw: string | null;
  excerpt: string;
  excerptRw: string | null;
  body: string; // markdown
  bodyRw: string | null;
  coverImage: string | null;
  author: string;
  publishedAt: string;
  published: boolean;
  readMins: number;
  tags: string[];
}

export const GUIDES: Guide[] = [
  {
    id: "g1",
    slug: "how-to-buy-a-healthy-dairy-cow-in-rwanda",
    title: "How to Buy a Healthy Dairy Cow in Rwanda",
    titleRw: null,
    excerpt:
      "Everything a first-time buyer needs to know before buying a dairy cow in Rwanda — breeds, prices, health checks, and how to avoid getting cheated.",
    excerptRw: null,
    bodyRw: null,
    coverImage: "/animals/cattle-1.jpg",
    author: "Farmgate",
    publishedAt: "2026-06-20T08:00:00Z",
    published: true,
    readMins: 6,
    tags: ["cattle", "dairy", "buying guide"],
    body: `Buying a dairy cow is one of the biggest investments a Rwandan farmer can make. Done right, a good Friesian or Friesian-cross can produce 15–25 litres of milk a day. Done wrong, you lose money on an unhealthy or low-yield animal. Here's how to buy smart.

## 1. Choose the right breed

- **Friesian (Holstein):** highest milk yield, needs good feed and care.
- **Friesian-cross / Ankole-cross:** hardier, lower feed needs, still strong yield — often the best value in Rwanda.
- **Local (Ankole):** very hardy, lower milk yield, great for tough conditions.

## 2. Check the health

Always confirm:

- Vaccination and deworming records
- Clear eyes, clean nose, no coughing
- Healthy udder with four working quarters
- Good body condition (not too thin)

## 3. Know a fair price

Prices vary by breed, age and milk yield. A productive dairy cow typically ranges from RWF 600,000 to over RWF 1,000,000. Calves cost far less. **Never let a broker inflate the price** — on Farmgate you buy direct from verified keepers.

## 4. Arrange safe transport

Moving cattle needs care. Farmgate helps arrange trusted transport so your cow arrives safely.

> **Buy with confidence:** every cow on Farmgate is listed by a verified keeper, with real photos and health details. [Browse cattle now](/animals?type=cattle).`,
  },
  {
    id: "g2",
    slug: "goat-farming-in-rwanda-beginners-guide",
    title: "Goat Farming in Rwanda: A Beginner's Guide",
    titleRw: null,
    excerpt:
      "Goats are one of the easiest and most profitable animals to start with in Rwanda. Here's how to choose, buy and raise them.",
    excerptRw: null,
    bodyRw: null,
    coverImage: "/animals/goat-3.jpg",
    author: "Farmgate",
    publishedAt: "2026-06-18T08:00:00Z",
    published: true,
    readMins: 5,
    tags: ["goats", "farming", "beginner"],
    body: `Goats are a smart first animal: low cost, fast-breeding, and always in demand for meat. Whether for income or family use, here's how to start.

## Why goats?

- Affordable to buy and feed
- Breed quickly — your herd grows fast
- Strong, steady demand for goat meat in Rwanda

## Choosing your goats

- **Boer-cross:** fast growth, excellent for meat.
- **Local breeds:** hardy and cheap, great for beginners.

Look for healthy animals: bright eyes, good appetite, no limping, and a vaccination record.

## Feeding & care

Goats thrive on pasture, crop residues and a little supplement. Provide clean water, shelter from rain, and deworm regularly.

> Ready to start your herd? [Browse goats from verified keepers](/animals?type=goat).`,
  },
  {
    id: "g3",
    slug: "raising-broiler-chickens-for-profit-in-rwanda",
    title: "Raising Broiler Chickens for Profit in Rwanda",
    titleRw: null,
    excerpt:
      "Broiler chickens give one of the fastest returns in livestock farming. Here's how to buy chicks and raise them for profit.",
    excerptRw: null,
    bodyRw: null,
    coverImage: "/animals/chicken-1.jpg",
    author: "Farmgate",
    publishedAt: "2026-06-15T08:00:00Z",
    published: true,
    readMins: 5,
    tags: ["chickens", "poultry", "business"],
    body: `Broilers are ready for market in just 6–8 weeks, making them one of the fastest ways to earn from livestock in Rwanda.

## Start with healthy chicks

Buy vaccinated chicks from a trusted source. On Farmgate, every listing shows the keeper's details and the birds' health status.

## The essentials

- **Brooding:** keep chicks warm for the first weeks.
- **Feed:** quality starter then finisher feed drives fast growth.
- **Biosecurity:** clean housing prevents disease wiping out your flock.

## Selling

Restaurants and resellers buy broilers in bulk. List your mature birds on Farmgate to reach serious buyers fast.

> [Browse chickens and chicks](/animals?type=chicken) from verified keepers near you.`,
  },
];

const sbConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

export async function getGuides(): Promise<Guide[]> {
  if (sbConfigured()) {
    const { createSupabasePublicClient } = await import("../supabase/public");
    const { mapGuide } = await import("./map");
    const c = createSupabasePublicClient();
    const { data } = await c
      .from("fg_public_guides")
      .select("*")
      .order("published_at", { ascending: false });
    return (data ?? []).map(mapGuide);
  }
  return GUIDES.filter((g) => g.published).sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  if (sbConfigured()) {
    const { createSupabasePublicClient } = await import("../supabase/public");
    const { mapGuide } = await import("./map");
    const c = createSupabasePublicClient();
    const { data } = await c
      .from("fg_public_guides")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data ? mapGuide(data) : null;
  }
  return GUIDES.find((g) => g.slug === slug && g.published) ?? null;
}

export async function getGuideSlugs(): Promise<string[]> {
  if (sbConfigured()) {
    const { createSupabasePublicClient } = await import("../supabase/public");
    const c = createSupabasePublicClient();
    const { data } = await c.from("fg_public_guides").select("slug");
    return (data ?? []).map((r) => String(r.slug));
  }
  return GUIDES.filter((g) => g.published).map((g) => g.slug);
}
