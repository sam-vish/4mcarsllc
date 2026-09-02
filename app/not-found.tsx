import Link from "next/link";

import { dealer } from "@/lib/config";

export default function NotFound() {
  return (
    <main className="hatch flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <p className="tag text-7xl text-brand">404</p>
      <h1 className="mt-4 font-display text-4xl font-black uppercase text-white sm:text-5xl">
        That page isn&apos;t on the lot
      </h1>
      <p className="mt-3 max-w-md text-steel">
        The link may be old. Head back to the home page, or browse the full inventory.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="brand-btn rounded-md px-7 py-4 font-display text-xl font-bold uppercase tracking-wide text-white transition-colors"
        >
          Back to home
        </Link>
        <a
          href={dealer.dc.inventory}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-white/30 px-7 py-4 font-display text-xl font-bold uppercase tracking-wide text-white hover:border-white hover:bg-white/5"
        >
          See the inventory
        </a>
      </div>
    </main>
  );
}
