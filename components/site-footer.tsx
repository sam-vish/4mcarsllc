import Image from "next/image";
import Link from "next/link";
import { Instagram, MapPin, MessageCircle } from "lucide-react";

import { assets, dcUrl, dealer, hours, nav } from "@/lib/config";

export const LEGAL_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/sms-disclosure", label: "SMS Disclosure" },
];

export default function SiteFooter() {
  const footerNav = [{ label: "Home", key: "home", href: dealer.dc.home }, ...nav];

  return (
    <footer className="border-t border-white/10 bg-asphalt">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Image
              src={assets.logo}
              alt={assets.logoAlt}
              width={190}
              height={45}
              className="h-11 w-auto object-contain"
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-smoke">
              Used trucks, Jeeps, SUVs and cars on Landstreet Rd, Orlando. 3-month warranty, financing
              with passport or ITIN. Hablamos español.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href={dealer.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-steel hover:border-brand hover:text-white"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={dealer.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-steel hover:border-brand hover:text-white"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={dealer.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Google Business Profile"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-steel hover:border-brand hover:text-white"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-wider text-steel">
              Visit us
            </h2>
            <p className="mt-4 text-sm text-chalk">
              {dealer.address.line1}
              <br />
              {dealer.address.line2}
            </p>
            <a
              href={`tel:${dealer.phoneTel}`}
              className="mt-3 block font-display text-xl font-semibold text-white"
            >
              {dealer.phoneDisplay}
            </a>
            <dl className="mt-4 grid max-w-xs grid-cols-[auto_1fr] gap-x-5 gap-y-1 text-sm text-smoke">
              {hours.map((h) => (
                <div key={h.label} className="contents">
                  <dt className="font-semibold">{h.label}</dt>
                  <dd>{h.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-wider text-steel">
              Quick links
            </h2>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm text-smoke" aria-label="Footer">
              {footerNav.map((item) => (
                <a
                  key={item.key}
                  href={item.href ?? dcUrl(item.key)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-smoke sm:flex-row">
          <p>
            © {new Date().getFullYear()} {dealer.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-4">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
