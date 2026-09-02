import AnnouncementBar from "@/components/announcement-bar";
import Faq from "@/components/faq";
import Financing from "@/components/financing";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import Inventory from "@/components/inventory";
import LeadForm from "@/components/lead-form";
import Reviews from "@/components/reviews";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import Visit from "@/components/visit";
import Warranty from "@/components/warranty";
import { dealer, faqs, SITE_URL } from "@/lib/config";

/* The FAQ rich result is scoped to this page, so it lives here rather than in
   the root layout with the AutoDealer graph. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": SITE_URL + "/#faq",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-asphalt"
      >
        Skip to content
      </a>

      <AnnouncementBar />
      <SiteHeader />

      <main id="top">
        <Hero />
        <Inventory />
        <Warranty />
        <Financing />
        <HowItWorks />
        <Reviews />
        <LeadForm />
        <Faq />
        <Visit />
      </main>

      <SiteFooter />

      {/* Crawlable fallback for A2P validators (no-JS) */}
      <noscript>
        <div style={{ padding: 16, color: "#F2F1EE", background: "#1C1D20" }}>
          <p>
            {dealer.name} — {dealer.address.line1}, {dealer.address.line2} — {dealer.phoneDisplay} —{" "}
            {dealer.email}
          </p>
          <p>
            By providing your phone number you agree to receive text messages from {dealer.name}.
            Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP
            for help. Consent is not a condition of purchase. No mobile information will be shared
            with third parties or affiliates for marketing purposes.
          </p>
          <p>
            <a href="/privacy-policy">Privacy Policy</a> |{" "}
            <a href="/terms-of-service">Terms of Service</a> |{" "}
            <a href="/sms-disclosure">SMS Disclosure</a>
          </p>
        </div>
      </noscript>
    </>
  );
}
