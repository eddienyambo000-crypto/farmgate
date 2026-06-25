import { SITE } from "@/lib/site";

/** Renders a JSON-LD <script>. Server component, safe to embed anywhere. */
function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Organization + LocalBusiness + WebSite (with sitelinks search box). */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${SITE.url}/#organization`,
            name: SITE.name,
            url: SITE.url,
            description: SITE.description,
            email: SITE.platform.email,
            telephone: `+${SITE.platform.whatsapp}`,
            areaServed: { "@type": "Country", name: "Rwanda" },
            address: {
              "@type": "PostalAddress",
              addressRegion: "Eastern Province",
              addressCountry: "RW",
            },
          },
          {
            "@type": "WebSite",
            "@id": `${SITE.url}/#website`,
            url: SITE.url,
            name: SITE.name,
            publisher: { "@id": `${SITE.url}/#organization` },
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE.url}/animals?search={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          },
        ],
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          item: `${SITE.url}${it.url}`,
        })),
      }}
    />
  );
}

export function FaqJsonLd({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((it) => ({
          "@type": "Question",
          name: it.q,
          acceptedAnswer: { "@type": "Answer", text: it.a },
        })),
      }}
    />
  );
}

export function ItemListJsonLd({
  urls,
}: {
  urls: string[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: urls.map((u, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE.url}${u}`,
        })),
      }}
    />
  );
}

export function ProductJsonLd({
  name,
  description,
  image,
  price,
  url,
  available,
  category,
}: {
  name: string;
  description: string;
  image: string;
  price: number;
  url: string;
  available: boolean;
  category: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        image: image.startsWith("http") ? image : `${SITE.url}${image}`,
        category,
        offers: {
          "@type": "Offer",
          price,
          priceCurrency: "RWF",
          availability: available
            ? "https://schema.org/InStock"
            : "https://schema.org/SoldOut",
          url: `${SITE.url}${url}`,
          areaServed: "RW",
          seller: { "@id": `${SITE.url}/#organization` },
        },
      }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  image,
  url,
  published,
  modified,
}: {
  title: string;
  description: string;
  image: string | null;
  url: string;
  published: string;
  modified?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        image: image
          ? image.startsWith("http")
            ? image
            : `${SITE.url}${image}`
          : undefined,
        datePublished: published,
        dateModified: modified ?? published,
        author: { "@id": `${SITE.url}/#organization` },
        publisher: { "@id": `${SITE.url}/#organization` },
        mainEntityOfPage: `${SITE.url}${url}`,
      }}
    />
  );
}
