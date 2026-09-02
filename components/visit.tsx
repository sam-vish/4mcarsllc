import { Mail, MapPin, Navigation, Phone } from "lucide-react";

import { dealer, hours, mapEmbedUrl } from "@/lib/config";

export default function Visit() {
  return (
    <section id="visit" className="hatch py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="steel-rule w-24" />
          <h2 className="mt-5 font-display text-5xl font-black uppercase leading-none text-white sm:text-6xl">
            Come see us on Landstreet
          </h2>
          <p className="mt-4 text-steel">
            Inside the Landstreet Automall, south of the airport. Pull in, walk the lot, no appointment
            needed.
          </p>
          <address className="mt-7 space-y-4 not-italic text-chalk">
            <p className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
              <span>
                {dealer.address.line1}
                <br />
                {dealer.address.line2}
              </span>
            </p>
            <p className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
              <a href={`tel:${dealer.phoneTel}`} className="font-semibold hover:text-white">
                {dealer.phoneDisplay}
              </a>
            </p>
            <p className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
              <a href={`mailto:${dealer.email}`} className="hover:text-white">
                {dealer.email}
              </a>
            </p>
          </address>
          <dl className="mt-7 grid max-w-sm grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-chalk">
            {hours.map((h) => (
              <div key={h.label} className="contents">
                <dt className="font-semibold">{h.label}</dt>
                <dd>{h.value}</dd>
              </div>
            ))}
          </dl>
          <a
            href={dealer.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-md border border-white/30 px-6 py-3 font-display text-lg font-bold uppercase tracking-wide text-white hover:border-white hover:bg-white/5"
          >
            <span>Get directions</span>
            <Navigation className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <div className="overflow-hidden rounded-lg border border-white/10">
          <iframe
            title={`Map to ${dealer.name} at ${dealer.address.line1}, ${dealer.address.line2}`}
            src={mapEmbedUrl}
            className="h-[360px] w-full grayscale invert-[.92] contrast-[.9] lg:h-full"
            loading="lazy"
            width={600}
            height={360}
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
