/**
 * Central UI string dictionary.
 *
 * Every translatable piece of CHROME (nav, buttons, labels, section copy) lives
 * here so Kinyarwanda is trivial to correct in ONE place. The English (`en`)
 * column is authoritative; the Kinyarwanda (`rw`) column is a best-effort
 * starting point that the owner/Eddie can refine without touching components.
 *
 * Dynamic CONTENT (listing titles, guide bodies, testimonials) is NOT here — it
 * carries its own optional `*_rw` fields entered from the admin panel, with a
 * fall-back to English when empty (see `pickLang` in ./index).
 *
 * To fix a Kinyarwanda string: edit only the `rw` value below.
 */
export type Lang = "en" | "rw";

export const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "rw", label: "Kinyarwanda", native: "Ikinyarwanda" },
];

type Entry = { en: string; rw: string };

export const DICT = {
  // Nav
  "nav.browse": { en: "Browse Animals", rw: "Reba Amatungo" },
  "nav.how": { en: "How It Works", rw: "Uko Bikorwa" },
  "nav.sell": { en: "Sell Your Animal", rw: "Gurisha Itungo" },
  "nav.guides": { en: "Guides", rw: "Inama" },
  "nav.about": { en: "About", rw: "Abo Turi Bo" },
  "nav.home": { en: "Home", rw: "Ahabanza" },
  "nav.find": { en: "Find", rw: "Shakisha" },

  // Common actions
  "cta.browse": { en: "Browse animals", rw: "Reba amatungo" },
  "cta.viewAll": { en: "View all animals", rw: "Reba amatungo yose" },
  "cta.startSelling": { en: "Start selling", rw: "Tangira kugurisha" },
  "cta.request": { en: "Request this animal", rw: "Saba iri tungo" },
  "cta.learnMore": { en: "Learn more", rw: "Menya byinshi" },
  "cta.findAnimal": { en: "Find your animal", rw: "Shaka itungo ryawe" },

  // Hero
  "hero.eyebrow": {
    en: "Rwanda's first online livestock marketplace",
    rw: "Isoko rya mbere ry'amatungo kuri internet mu Rwanda",
  },
  "hero.title1": { en: "Healthy animals,", rw: "Amatungo mazima," },
  "hero.title2": { en: "direct from the farm.", rw: "ava ku murima." },
  "hero.subtitle": {
    en: "Buy cattle, goats, pigs, chickens and rabbits from verified Rwandan keepers. Fair prices, real photos, vaccination records — and no middlemen taking a cut.",
    rw: "Gura inka, ihene, ingurube, inkoko n'urukwavu ku borozi bemewe. Ibiciro bikwiye, amafoto nyakuri, inkingo — nta munyacuruzi uri hagati.",
  },
  "hero.searchPlaceholder": {
    en: "Search cattle, goats, district…",
    rw: "Shakisha inka, ihene, akarere…",
  },

  // Sections
  "section.categories.eyebrow": { en: "Browse by animal", rw: "Hitamo itungo" },
  "section.categories.title": {
    en: "What are you looking for?",
    rw: "Ushaka iki?",
  },
  "section.featured.eyebrow": { en: "Featured listings", rw: "Amatungo ahitanwemo" },
  "section.featured.title": {
    en: "Animals ready for a new home",
    rw: "Amatungo ategereje nyirayo mushya",
  },
  "section.trust.eyebrow": { en: "Why Farmgate", rw: "Kuki Farmgate" },
  "section.trust.title": {
    en: "A marketplace built on trust",
    rw: "Isoko ryubakiye ku kwizerana",
  },

  // Listing
  "listing.price": { en: "Price", rw: "Igiciro" },
  "listing.negotiable": { en: "Price negotiable", rw: "Igiciro kiravugwaho" },
  "listing.verified": { en: "Verified", rw: "Byemejwe" },
  "listing.interested": { en: "Interested in this animal?", rw: " Urashaka iri tungo?" },
  "listing.vaccinated": { en: "Vaccinated", rw: "Yakingiwe" },

  // Footer / misc
  "footer.tagline": {
    en: "Rwanda's livestock marketplace. Buy and sell healthy animals direct from verified keepers — no middlemen.",
    rw: "Isoko ry'amatungo mu Rwanda. Gura kandi ugurishe amatungo mazima ku borozi bemewe — nta munyacuruzi.",
  },
  "lang.switch": { en: "Language", rw: "Ururimi" },
} as const;

export type DictKey = keyof typeof DICT;

export function translate(key: DictKey, lang: Lang): string {
  const entry: Entry = DICT[key];
  return entry[lang] || entry.en;
}
