"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, FileBadge, Languages, ShieldCheck } from "lucide-react";

import { assets, dealer, heroSlides } from "@/lib/config";

/* ---------------------------------------------------------------------------
   Hero catalogue.

   Cross-fades through the lot photos on a timer, with arrows, dots, arrow-key
   stepping and swipe. Slide 1 is the LCP image and is given priority; the rest
   are lazy, so eight slides cost one image on first load.

   The timer stops for good on the first manual step (that is the pause
   mechanism), and never starts at all under prefers-reduced-motion.
--------------------------------------------------------------------------- */
export default function Hero() {
  const slides = heroSlides;
  const interval = assets.hero.intervalMs;

  const [index, setIndex] = useState(0);
  const [rotating, setRotating] = useState(true);
  const [paused, setPaused] = useState(false);
  const swipeX = useRef<number | null>(null);

  const step = useCallback((by: number) => {
    setRotating(false);
    setIndex((i) => (i + by + slides.length) % slides.length);
  }, [slides.length]);

  const goTo = useCallback((i: number) => {
    setRotating(false);
    setIndex(i);
  }, []);

  useEffect(() => {
    if (slides.length < 2 || !rotating || paused) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      interval
    );
    return () => window.clearInterval(id);
  }, [rotating, paused, interval, slides.length]);

  // Stop burning frames (and data) while the tab is in the background.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <section className="hatch relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-end gap-10 px-5 pb-10 pt-14 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:pb-14 lg:pt-20">
        <div className="rise">
          <p className="font-display text-xl font-semibold text-steel">
            {dealer.address.street.replace(/^\d+\s+/, "")}, {dealer.address.city}
          </p>
          <h1 className="mt-3 font-display text-6xl font-black uppercase leading-[0.88] tracking-tight text-white sm:text-7xl lg:text-8xl">
            Trucks, Jeeps,
            <br />
            and 4x4s
            <br />
            built for Florida.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-steel">
            {dealer.inventoryCount} used trucks, Jeeps, SUVs and cars on the lot right now, every one
            with a 3-month warranty. Financing with a passport or ITIN, from $1,500 down. Come see it,
            drive it, and drive it home.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={dealer.dc.inventory}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-btn inline-flex items-center justify-center gap-2 rounded-md px-7 py-4 font-display text-xl font-bold uppercase tracking-wide text-white transition-colors"
            >
              <span>See all {dealer.inventoryCount} vehicles</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="#test-drive"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/30 px-7 py-4 font-display text-xl font-bold uppercase tracking-wide text-white transition-colors hover:border-white hover:bg-white/5"
            >
              Book a test drive
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-smoke">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" aria-hidden="true" />
              <span>3-month warranty</span>
            </span>
            <span className="flex items-center gap-2">
              <FileBadge className="h-4 w-4 text-brand" aria-hidden="true" />
              <span>Passport / ITIN financing</span>
            </span>
            <span className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-brand" aria-hidden="true" />
              <span>English &amp; Spanish</span>
            </span>
          </div>
        </div>

        <div
          className="relative"
          role="group"
          aria-roledescription="carousel"
          aria-label="Vehicles on the lot"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              step(-1);
            }
            if (e.key === "ArrowRight") {
              e.preventDefault();
              step(1);
            }
          }}
          onPointerDown={(e) => {
            swipeX.current = e.pointerType === "mouse" ? null : e.clientX;
          }}
          onPointerUp={(e) => {
            if (swipeX.current === null) return;
            const dx = e.clientX - swipeX.current;
            swipeX.current = null;
            if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
          }}
          onPointerCancel={() => {
            swipeX.current = null;
          }}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-tarmac">
            {slides.map((slide, i) => (
              <Image
                key={slide.src}
                src={slide.src}
                alt={slide.alt}
                width={assets.hero.width}
                height={assets.hero.height}
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                sizes="(min-width: 1024px) 55vw, 100vw"
                aria-hidden={i !== index}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${slides.length}: ${slide.caption}`}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}

            {/* Keeps the caption and dots legible over any photo */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-asphalt/80 to-transparent"
            />
          </div>

          {/* bottom-9 clears the address strip burned into the dealer's photos */}
          <div className="absolute bottom-9 left-4 rounded-md bg-asphalt/90 px-4 py-3">
            <p className="font-display text-sm font-semibold uppercase tracking-wider text-steel">
              {assets.hero.captionEyebrow}
            </p>
            <p className="font-display text-2xl font-bold text-white">{slides[index].caption}</p>
          </div>

          {slides.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous vehicle"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md border border-white/25 bg-asphalt/80 text-white backdrop-blur transition-colors hover:bg-asphalt"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next vehicle"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md border border-white/25 bg-asphalt/80 text-white backdrop-blur transition-colors hover:bg-asphalt"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="absolute bottom-9 right-4 hidden items-end gap-1.5 pb-1 sm:flex">
                {slides.map((slide, i) => (
                  <button
                    key={slide.src}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Show ${slide.caption}`}
                    aria-current={i === index}
                    className={`h-1.5 w-6 rounded-sm transition-colors ${
                      i === index ? "bg-brand" : "bg-white/35 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
