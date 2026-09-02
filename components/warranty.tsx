import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";

import { assets, dealer } from "@/lib/config";

const POINTS = [
  "Inspected before listing: runs, drives, cold A/C, no leaks",
  "Clean titles, CarFax available on every listing",
  "3 months of coverage included in the price",
];

export default function Warranty() {
  return (
    <section id="warranty" className="hatch py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <div className="steel-rule w-24" />
          <h2 className="mt-5 font-display text-5xl font-black uppercase leading-none text-white sm:text-6xl">
            Every car leaves with a 3-month warranty
          </h2>
          <p className="mt-5 max-w-xl text-lg text-steel">
            Most small lots sell as-is. We don&apos;t. Every vehicle at {dealer.shortName} is inspected
            before it&apos;s listed and covered for three months after you drive off, so the first oil
            change isn&apos;t the first surprise.
          </p>
          <ul className="mt-7 space-y-3 text-chalk">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <Check className="mt-1 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <a
            href={dealer.dc.warranty}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-md border border-white/30 px-6 py-3 font-display text-lg font-bold uppercase tracking-wide text-white hover:border-white hover:bg-white/5"
          >
            <span>Read the warranty details</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <div className="relative">
          <Image
            src={assets.warranty.src}
            alt={assets.warranty.alt}
            width={assets.warranty.width}
            height={assets.warranty.height}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="aspect-[5/4] w-full rounded-lg object-cover"
          />
          <div className="absolute -bottom-5 -left-3 rounded-md bg-brand px-6 py-4 sm:-left-6">
            <p className="tag text-6xl text-white">
              3<span className="text-3xl">mo</span>
            </p>
            <p className="mt-1 font-display font-semibold uppercase tracking-wider text-white">
              Warranty included
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
