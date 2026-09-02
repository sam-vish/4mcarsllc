"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

import BrowseIcon from "@/components/browse-icon";
import { browse, dcUrl, dealer, featured, milesFmt, money } from "@/lib/config";

export default function Inventory() {
  const rail = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 700), behavior: "smooth" });
  };

  return (
    <section id="inventory" className="border-y border-white/10 bg-tarmac py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="steel-rule w-24" />
        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-5xl font-black uppercase leading-none text-white sm:text-6xl">
              Just landed
            </h2>
            <p className="mt-3 max-w-xl text-steel">
              Real prices, real mileage, no &ldquo;call for price.&rdquo; Tap a vehicle to see photos,
              CarFax and the window sticker on our inventory site.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Previous vehicles"
              aria-controls="inventory-rail"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-white/20 text-white hover:bg-white/5"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Next vehicles"
              aria-controls="inventory-rail"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-white/20 text-white hover:bg-white/5"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          id="inventory-rail"
          ref={rail}
          tabIndex={0}
          role="group"
          aria-label="Featured vehicles"
          className="rail mt-10 -mx-5 flex gap-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:px-0"
        >
          {featured.map((v) => (
            <a
              key={v.title}
              href={v.url ?? dealer.dc.inventory}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-[78vw] shrink-0 overflow-hidden rounded-lg border border-white/10 bg-asphalt sm:w-[340px]"
            >
              <div className="relative">
                <Image
                  src={v.img}
                  alt={v.title}
                  width={900}
                  height={675}
                  sizes="(min-width: 640px) 340px, 78vw"
                  className="aspect-[4/3] w-full object-cover"
                />
                <p className="tag absolute bottom-3 left-3 rounded-sm bg-brand px-3 py-1.5 text-3xl text-white">
                  {money(v.price)}
                </p>
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl font-bold leading-tight text-white">{v.title}</h3>
                <p className="mt-1.5 text-sm text-smoke">
                  {milesFmt(v.miles)} · {v.spec}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-display text-base font-semibold uppercase tracking-wide text-steel group-hover:text-white">
                  View photos &amp; CarFax
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Browse shortcuts → DealerCenter sort/filter URLs */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {browse.map((b) => (
            <a
              key={b.title}
              href={dcUrl(b.key)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-lg border border-white/10 bg-asphalt p-5 hover:border-brand"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand/15 text-brand">
                <BrowseIcon name={b.icon} className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-display text-xl font-bold text-white">{b.title}</span>
                <span className="block text-sm text-smoke">{b.note}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
