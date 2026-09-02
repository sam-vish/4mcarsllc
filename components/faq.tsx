import { Plus } from "lucide-react";

import { faqs } from "@/lib/config";

export default function Faq() {
  return (
    <section id="faq" className="border-y border-white/10 bg-tarmac py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="steel-rule w-24" />
        <h2 className="mt-5 font-display text-5xl font-black uppercase leading-none text-white sm:text-6xl">
          Questions, answered
        </h2>
        <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {faqs.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl font-semibold text-white">
                {f.q}
                <Plus
                  className="h-5 w-5 shrink-0 text-steel transition-transform group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-steel">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
