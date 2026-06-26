import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SITE } from "@/lib/site";
import { getSettings } from "@/lib/data/settings";
import { SettingsProvider } from "@/lib/settings-context";
import { LanguageProvider } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { DockNav } from "@/components/DockNav";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Rwanda's Livestock Marketplace`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "buy livestock Rwanda",
    "gura amatungo",
    "cattle for sale Rwanda",
    "goats for sale Kigali",
    "animal marketplace Rwanda",
    "Farmgate Rwanda",
    "buy cattle Rwanda",
    "livestock Bugesera",
  ],
  authors: [{ name: SITE.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_RW",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — Rwanda's Livestock Marketplace`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Rwanda's Livestock Marketplace`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <OrganizationJsonLd />
        <SettingsProvider value={settings}>
          <LanguageProvider>
            <SmoothScroll />
            {settings.announcement && (
              <div className="bg-forest-deep px-4 py-2 text-center text-sm font-medium text-cream">
                {settings.announcement}
              </div>
            )}
            <Navbar />
            <main className="flex-1 pb-20 lg:pb-0">{children}</main>
            <Footer />
            <WhatsAppFab />
            <DockNav />
          </LanguageProvider>
        </SettingsProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
