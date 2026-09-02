import { Gauge, Sparkles, Truck, Wallet, type LucideProps } from "lucide-react";

/* browse[].icon in dealer-config.json is a lucide name; this is the whitelist
   of names that config is allowed to use. Add to it when you add a card. */
const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  wallet: Wallet,
  truck: Truck,
  gauge: Gauge,
  sparkles: Sparkles,
};

export default function BrowseIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" focusable="false" />;
}
