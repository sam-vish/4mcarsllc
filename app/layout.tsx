import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";

import ThirdParty from "@/components/third-party";
import { assets, brandTokens, dealer, site, SITE_URL, absolute } from "@/lib/config";

import "./globals.css";

/* Self-hosted at build time by next/font — no render-blocking request to
   fonts.googleapis.com, and no layout shift. */
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: site.title,
  description: site.description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: {
    icon: assets.favicon,
    apple: assets.appleTouchIcon,
  },
  openGraph: {
    siteName: dealer.name,
    title: site.ogTitle,
    description: site.ogDescription,
    type: "website",
    url: "/",
    locale: "en_US",
    images: [
      {
        url: assets.og,
        width: 1200,
        height: 630,
        alt: `${dealer.name} — trucks, Jeeps and 4x4s on ${dealer.address.street}, ${dealer.address.city}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.ogTitle,
    description: site.ogDescription,
    images: [assets.og],
  },
};

export const viewport: Viewport = {
  themeColor: "#1C1D20",
};

/* ---------------------------------------------------------------------------
   Real, verifiable facts only. No aggregateRating / reviewCount — the dealer
   has not supplied reviews and we do not invent social proof.
--------------------------------------------------------------------------- */
function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AutoDealer",
        "@id": SITE_URL + "/#dealer",
        name: dealer.name,
        legalName: dealer.legalName || dealer.name,
        url: SITE_URL + "/",
        telephone: dealer.phoneTel,
        email: dealer.email,
        image: absolute(assets.og),
        logo: absolute(assets.logo),
        address: {
          "@type": "PostalAddress",
          streetAddress: dealer.address.street,
          addressLocality: dealer.address.city,
          addressRegion: dealer.address.region,
          postalCode: dealer.address.postalCode,
          addressCountry: dealer.address.country,
        },
        hasMap: dealer.mapsUrl,
        knowsLanguage: dealer.languages,
        sameAs: [
          dealer.instagram,
          dealer.tiktok,
          dealer.googleReviewsUrl,
          dealer.dc.home,
        ].filter(Boolean),
        openingHoursSpecification: dealer.hours.map((h) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: h.days,
          opens: h.opens,
          closes: h.closes,
        })),
      },
    ],
  };
}

/* ---------------------------------------------------------------------------
   DEVELOPMENT ONLY — never shipped to production (see the NODE_ENV guard).

   Some browser extensions rewrite the DOM between the HTML arriving and React
   hydrating, stamping their own attributes (`bis_skin_checked="1"`,
   `__processed_<uuid>__`) onto hundreds of elements. React then compares its
   tree against markup the server never sent and logs a full-page hydration
   error. The site is not affected — visitors without that extension never see
   it, and it cannot occur in production because this script is the only thing
   that would run there and it does not.

   This strips those attributes as fast as they appear. The observer is
   registered in <head>, so it is running before the body is parsed; its
   callbacks flush as microtasks, well before the hydration pass. It is a
   race in principle, and if an extension re-stamps an element mid-hydration a
   warning can still slip through — the real fix is to disable the extension
   for localhost.
--------------------------------------------------------------------------- */
const STRIP_EXTENSION_ATTRS =
  process.env.NODE_ENV === "production"
    ? null
    : `(function(){
  var JUNK = /^(bis_|__processed_)/;
  function clean(node){
    if (!node || node.nodeType !== 1) return;
    var attrs = node.attributes;
    for (var i = attrs.length - 1; i >= 0; i--) {
      if (JUNK.test(attrs[i].name)) node.removeAttribute(attrs[i].name);
    }
  }
  function sweep(root){
    clean(root);
    if (root.querySelectorAll) {
      var all = root.querySelectorAll("*");
      for (var i = 0; i < all.length; i++) clean(all[i]);
    }
  }
  new MutationObserver(function(records){
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      if (r.type === "attributes") clean(r.target);
      else for (var j = 0; j < r.addedNodes.length; j++) sweep(r.addedNodes[j]);
    }
  }).observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true
  });
  sweep(document.documentElement);
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const tokens = [
    `--brand: ${brandTokens.brand};`,
    `--brand-hover: ${brandTokens.brandHover};`,
    `--brand-rgb: ${brandTokens.brandRgb};`,
    `--brand-hover-rgb: ${brandTokens.brandHoverRgb};`,
  ].join("");

  return (
    // suppressHydrationWarning covers attributes some browser extensions stamp
    // directly onto <html>/<body> (bis_register, __processed_<uuid>__) before
    // React hydrates. It applies to these two elements only, not their
    // descendants — the script below handles the rest.
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable}`}
      suppressHydrationWarning
    >
      <head>
        {STRIP_EXTENSION_ATTRS ? (
          <script dangerouslySetInnerHTML={{ __html: STRIP_EXTENSION_ATTRS }} />
        ) : null}
        <style>{`:root{${tokens}}`}</style>
        <script
          type="application/ld+json"
          // Server-rendered from dealer-config.json — no user input reaches this.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body
        className="min-h-screen bg-asphalt font-sans text-chalk selection:bg-brand/50"
        suppressHydrationWarning
      >
        {children}
        <ThirdParty />
      </body>
    </html>
  );
}
