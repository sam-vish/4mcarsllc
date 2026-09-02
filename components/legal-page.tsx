import Image from "next/image";
import Link from "next/link";

import { LEGAL_LINKS } from "@/components/site-footer";
import { assets, config, dealer } from "@/lib/config";

/* Shared shell for the three compliance pages. Their bodies are plain semantic
   HTML (h2 / p / ul / li) styled by the `.legal` block in globals.css, so the
   copy stays a dealer-neutral template. */
export default function LegalPage({ title, body }: { title: string; body: string }) {
  return (
    <>
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center" aria-label={`${dealer.name} home`}>
            <Image
              src={assets.logo}
              alt={assets.logoAlt}
              width={190}
              height={45}
              className="h-9 w-auto object-contain"
            />
          </Link>
          <Link href="/" className="font-display text-lg font-semibold text-steel hover:text-white">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="steel-rule w-24" />
        <h1 className="mt-5 font-display text-5xl font-black uppercase leading-none text-white sm:text-6xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-steel">Last updated: {config.legal.lastUpdated}</p>

        <div
          className="legal mt-10"
          // Authored in content/legal/*.ts and interpolated from
          // dealer-config.json — no user input reaches this.
          dangerouslySetInnerHTML={{ __html: body }}
        />

        <div className="mt-14 rounded-lg border border-white/10 bg-tarmac p-6">
          <h2 className="font-display text-2xl font-bold uppercase text-white">Contact us</h2>
          <address className="mt-3 space-y-1 not-italic text-steel">
            <p className="font-semibold text-chalk">{dealer.name}</p>
            <p>
              {dealer.address.line1}
              <br />
              {dealer.address.line2}
            </p>
            <p>
              <a href={`tel:${dealer.phoneTel}`} className="underline hover:text-white">
                {dealer.phoneDisplay}
              </a>
            </p>
            <p>
              <a href={`mailto:${dealer.email}`} className="underline hover:text-white">
                {dealer.email}
              </a>
            </p>
          </address>
        </div>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 px-5 py-8 text-xs text-smoke sm:flex-row sm:px-8">
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
      </footer>
    </>
  );
}
