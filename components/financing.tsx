import { ArrowUpRight, MessageCircle } from "lucide-react";

import { dealer } from "@/lib/config";

const STATS = [
  { value: "$1,500", label: "Down to start" },
  { value: "ITIN", label: "Or passport accepted" },
  { value: "All", label: "Credit tiers reviewed" },
];

export default function Financing() {
  return (
    <section id="financing" className="border-y border-white/10 bg-tarmac py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="steel-rule w-24" />
        <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="font-display text-5xl font-black uppercase leading-none text-white sm:text-6xl">
              Financing that works with your situation
            </h2>
            <p className="mt-5 max-w-xl text-lg text-steel">
              No social? No problem. We finance with a passport or ITIN, and we work with first-time
              buyers and every credit tier. Start with as little as $1,500 down.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={dealer.dc.apply}
                target="_blank"
                rel="noopener noreferrer"
                className="brand-btn inline-flex items-center justify-center gap-2 rounded-md px-7 py-4 font-display text-xl font-bold uppercase tracking-wide text-white transition-colors"
              >
                <span>Apply online now</span>
                <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href={dealer.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/30 px-7 py-4 font-display text-xl font-bold uppercase tracking-wide text-white hover:border-white hover:bg-white/5"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                <span>Ask on WhatsApp</span>
              </a>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {STATS.map((s) => (
              <div key={s.value} className="rounded-lg border border-white/10 bg-asphalt p-6">
                <p className="tag text-5xl text-white">{s.value}</p>
                <p className="mt-2 font-display text-lg font-semibold uppercase tracking-wide text-steel">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
