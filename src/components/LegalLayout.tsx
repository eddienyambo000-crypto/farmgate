export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-grain">
      <header className="border-b border-line bg-cream/50">
        <div className="container-page py-12 lg:py-16">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">Last updated {updated}</p>
        </div>
      </header>
      <div className="container-page py-12 lg:py-16">
        <div className="mx-auto max-w-2xl space-y-6 leading-relaxed text-ink-soft [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_h2]:pt-2 [&_a]:text-forest-deep [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
          {children}
        </div>
      </div>
    </div>
  );
}
