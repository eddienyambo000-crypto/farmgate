import "server-only";

/**
 * Testimonials. Seed data for now; becomes Supabase-backed (admin-managed) when
 * keys are configured. The owner can add/edit/remove these from the admin panel.
 */
export interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  quoteRw: string | null;
  rating: number; // 1–5
  role: string; // "Buyer" | "Keeper"
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Jean Bosco",
    location: "Kicukiro, Kigali",
    quote:
      "I found a healthy dairy cow without dealing with brokers. Farmgate confirmed everything and arranged delivery to my farm. Fair price, no stress.",
    quoteRw: null,
    rating: 5,
    role: "Buyer",
  },
  {
    id: "t2",
    name: "Claudine M.",
    location: "Nyagatare",
    quote:
      "As a keeper, Farmgate brings me serious buyers only. No time wasted, no haggling games. My goats sell faster now.",
    quoteRw: null,
    rating: 5,
    role: "Keeper",
  },
  {
    id: "t3",
    name: "Eric N.",
    location: "Musanze",
    quote:
      "I bought broilers for my restaurant. The photos matched exactly, the birds were healthy, and the whole deal was handled professionally.",
    quoteRw: null,
    rating: 5,
    role: "Buyer",
  },
  {
    id: "t4",
    name: "Marie Claire U.",
    location: "Huye",
    quote:
      "Selling my pigs used to mean trusting strangers. With Farmgate I feel safe — they verify everyone and protect my contact details.",
    quoteRw: null,
    rating: 5,
    role: "Keeper",
  },
];

export async function getTestimonials(): Promise<Testimonial[]> {
  const { isSupabaseConfigured } = await import("../supabase/config");
  if (isSupabaseConfigured()) {
    const { createSupabasePublicClient } = await import("../supabase/public");
    const { mapTestimonial } = await import("./map");
    const c = createSupabasePublicClient();
    const { data } = await c
      .from("fg_public_testimonials")
      .select("*")
      .order("sort", { ascending: true });
    return (data ?? []).map(mapTestimonial);
  }
  return TESTIMONIALS;
}
