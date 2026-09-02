"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";

import { assets, dealer, dcUrl, nav } from "@/lib/config";

/* The nav mirrors the dealer's existing DealerCenter site 1:1 and deep-links
   to it — we do not rebuild any of those pages. */
export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-asphalt/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        <a href="#top" className="flex items-center" aria-label={`${dealer.name} home`}>
          <Image
            src={assets.logo}
            alt={assets.logoAlt}
            width={190}
            height={45}
            priority
            className="h-9 w-auto object-contain sm:h-11"
          />
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {nav.map((item) => (
            <a
              key={item.key}
              href={item.href ?? dcUrl(item.key)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-lg font-semibold text-chalk hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <a
            href={`tel:${dealer.phoneTel}`}
            className="flex items-center gap-2 font-display text-lg font-semibold text-chalk hover:text-white"
          >
            <Phone className="h-4 w-4 text-brand" aria-hidden="true" />
            <span>{dealer.phoneDisplay}</span>
          </a>
          <a
            href={dealer.dc.apply}
            target="_blank"
            rel="noopener noreferrer"
            className="brand-btn rounded-md px-5 py-2.5 font-display text-lg font-bold uppercase tracking-wide text-white transition-colors"
          >
            Apply online
          </a>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-chalk lg:hidden"
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className="border-t border-white/10 bg-asphalt px-5 py-5 lg:hidden"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          <nav className="flex flex-col gap-4" aria-label="Main (mobile)">
            {nav.map((item) => (
              <a
                key={item.key}
                href={item.href ?? dcUrl(item.key)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-2xl font-semibold text-chalk"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href={`tel:${dealer.phoneTel}`}
            className="mt-5 flex items-center gap-2 font-display text-xl font-semibold text-chalk"
          >
            <Phone className="h-4 w-4 text-brand" aria-hidden="true" />
            <span>{dealer.phoneDisplay}</span>
          </a>
          <a
            href={dealer.dc.apply}
            target="_blank"
            rel="noopener noreferrer"
            className="brand-btn mt-4 block rounded-md px-5 py-3 text-center font-display text-lg font-bold uppercase tracking-wide text-white"
          >
            Apply online
          </a>
        </div>
      ) : null}
    </header>
  );
}
