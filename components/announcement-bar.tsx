import { ShieldCheck } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <aside
      aria-label="Dealer highlights"
      className="bg-brand px-4 py-2 text-center text-sm font-semibold text-white"
    >
      <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        <span>3-month warranty on every vehicle</span>
        <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-white/70 sm:block" />
        <span className="hidden sm:inline">Financing with passport or ITIN</span>
        <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-white/70 md:block" />
        <span className="hidden md:inline">Hablamos español</span>
      </span>
    </aside>
  );
}
