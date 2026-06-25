import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getGuideBySlug, getGuideSlugs, getGuides } from "@/lib/data/guides";
import { formatDate } from "@/lib/format";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getGuideSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "Guide not found" };
  return {
    title: guide.title,
    description: guide.excerpt,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.excerpt,
      images: guide.coverImage ? [{ url: guide.coverImage }] : undefined,
      publishedTime: guide.publishedAt,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const related = (await getGuides()).filter((g) => g.id !== guide.id).slice(0, 3);

  return (
    <article className="bg-grain">
      <ArticleJsonLd
        title={guide.title}
        description={guide.excerpt}
        image={guide.coverImage}
        url={`/guides/${guide.slug}`}
        published={guide.publishedAt}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Guides", url: "/guides" },
          { name: guide.title, url: `/guides/${guide.slug}` },
        ]}
      />

      <header className="border-b border-line bg-cream/50">
        <div className="container-page max-w-3xl py-10 lg:py-14">
          <nav className="mb-4 text-sm text-ink-muted">
            <Link href="/guides" className="hover:text-forest-deep">
              Guides
            </Link>{" "}
            / <span className="text-ink-soft">{guide.title}</span>
          </nav>
          <p className="text-xs font-medium uppercase tracking-wide text-gold-deep">
            {guide.readMins} min read · {formatDate(guide.publishedAt)}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink text-balance sm:text-4xl">
            {guide.title}
          </h1>
        </div>
      </header>

      <div className="container-page max-w-3xl py-10 lg:py-12">
        {guide.coverImage && (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)] border border-line shadow-[var(--shadow-md)]">
            <Image
              src={guide.coverImage}
              alt={guide.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <div className="prose-fg">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{guide.body}</ReactMarkdown>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-page max-w-3xl border-t border-line py-10">
          <h2 className="font-display text-xl font-bold text-ink">More guides</h2>
          <ul className="mt-4 space-y-2">
            {related.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="inline-flex items-center gap-1 font-medium text-forest-deep hover:text-forest"
                >
                  {g.title} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
