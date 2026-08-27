import Script from "next/script";

/**
 * Google Analytics 4 for Farmgate Rwanda.
 *
 * The Measurement ID is public by design (it ships in every page's HTML on any
 * GA site), so we bake in a default and also allow an env override. We only load
 * gtag in production so local dev traffic never pollutes the client's reports.
 * GA4 Enhanced Measurement tracks SPA route changes via History events, so no
 * per-navigation code is needed.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-46LCY5W2Y6";

export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production" || !GA_ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
