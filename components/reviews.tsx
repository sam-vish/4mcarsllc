import { ArrowUpRight } from "lucide-react";

import { dealer, reviews } from "@/lib/config";

/* Renders both states. reviews.items in dealer-config.json stays empty until
   the dealer supplies real Google reviews — never invent quotes, ratings or
   counts. */
export default function Reviews() {
  return (
    <section id="reviews" className="border-y border-white/10 bg-tarmac py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="steel-rule w-24" />
        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="font-display text-5xl font-black uppercase leading-none text-white sm:text-6xl">
            What buyers say
          </h2>
          <a
            href={dealer.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-display text-lg font-semibold text-steel hover:text-white"
          >
            <span>Read our Google reviews</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.length === 0 ? (
            <p className="text-steel md:col-span-3">
              Reviews from real {dealer.shortName} customers will appear here. Until then, read them
              directly on Google.
            </p>
          ) : (
            reviews.map((r) => (
              <figure key={r.name + r.quote} className="rounded-lg border border-white/10 bg-asphalt p-6">
                <blockquote className="text-chalk">&ldquo;{r.quote}&rdquo;</blockquote>
                <figcaption className="mt-5 text-sm font-semibold text-steel">
                  {r.name} · Google review
                </figcaption>
              </figure>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
