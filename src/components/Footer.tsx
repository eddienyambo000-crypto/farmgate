import Link from "next/link";
import { SITE } from "@/lib/site";
import { CATEGORY_LIST } from "@/lib/categories";
import { getSettings } from "@/lib/data/settings";
import { MapPinIcon, WhatsAppIcon } from "./icons";

export async function Footer() {
  const year = new Date().getFullYear();
  const settings = await getSettings();
  return (
    <footer className="mt-auto border-t border-forest-deep/20 bg-forest-dark text-cream/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <p className="font-display text-2xl font-extrabold text-white">
            Farmgate <span className="text-gold">Rwanda</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/70">
            Rwanda&apos;s livestock marketplace. Buy and sell healthy animals
            direct from verified keepers — fair prices, no middlemen.
          </p>
          <p className="mt-5 flex items-center gap-2 text-sm text-cream/70">
            <MapPinIcon className="h-4 w-4 shrink-0 text-gold" />
            {SITE.platform.location}
          </p>
        </div>

        <nav aria-label="Marketplace">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">
            Marketplace
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {CATEGORY_LIST.map((c) => (
              <li key={c.type}>
                <Link
                  href={`/livestock/${c.type}`}
                  className="text-cream/70 transition-colors hover:text-white"
                >
                  {c.plural}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">
            Farmgate
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/how-it-works" className="text-cream/70 hover:text-white">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/sell" className="text-cream/70 hover:text-white">
                Sell Your Animal
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-cream/70 hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/trust-safety" className="text-cream/70 hover:text-white">
                Trust &amp; Safety
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">
            Get in touch
          </p>
          <p className="mt-4 text-sm text-cream/70">
            Questions about buying or listing an animal? Message the Farmgate
            team — we handle every enquiry directly.
          </p>
          <a
            href={`https://wa.me/${settings.contactWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius)] bg-gold px-4 py-2.5 text-sm font-semibold text-forest-dark transition-colors hover:bg-white"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Chat on WhatsApp
          </a>
          <p className="mt-4 text-sm">
            <a
              href={`mailto:${settings.contactEmail}`}
              className="text-cream/70 transition-colors hover:text-white"
            >
              {settings.contactEmail}
            </a>
          </p>
          {(settings.instagram || settings.facebook) && (
            <div className="mt-3 flex gap-4 text-sm">
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/70 hover:text-white"
                >
                  Instagram
                </a>
              )}
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/70 hover:text-white"
                >
                  Facebook
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream/55 sm:flex-row">
          <p>
            © {year} {SITE.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-cream">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-cream">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
