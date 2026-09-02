import raw from "@/dealer-config.json";

/* ---------------------------------------------------------------------------
   dealer-config.json is the single source of truth for this dealer. Swapping
   that file (plus dropping new photos into public/) re-brands the whole site —
   nothing dealer-specific is hardcoded in app/ or components/.

   The only things that do NOT live there are secrets and third-party ids:
   those are environment variables. See .env.example.
--------------------------------------------------------------------------- */

export type Hours = {
  label: string;
  value: string;
  days: string[];
  opens: string;
  closes: string;
};

export type Vehicle = {
  title: string;
  price: number;
  miles: number | null;
  spec: string;
  img: string;
  url: string | null;
};

export type HeroSlide = { src: string; caption: string; alt: string };
export type NavItem = { label: string; key: string; href?: string };
export type BrowseCard = { title: string; note: string; key: string; icon: string };
export type Step = { title: string; body: string };
export type Faq = { q: string; a: string };
export type Review = { name: string; quote: string; lang?: string };

export const config = raw;
export const dealer = raw.dealer;
export const site = raw.site;
export const assets = raw.assets;

export const hours = raw.dealer.hours as Hours[];
export const nav = raw.nav as NavItem[];
export const browse = raw.browse as BrowseCard[];
export const steps = raw.steps as Step[];
export const faqs = raw.faqs as Faq[];
export const reviews = (raw.reviews?.items ?? []) as Review[];
export const featured = raw.featured.vehicles as Vehicle[];
export const heroSlides = raw.assets.hero.slides as HeroSlide[];

/** Canonical origin. Env wins so preview/production deploys stay correct. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  raw.site.url ||
  "http://localhost:3000"
).replace(/\/+$/, "");

/** Absolute URL for og:image, JSON-LD and the sitemap. */
export const absolute = (path: string) => SITE_URL + path;

/** DealerCenter deep link for a nav/browse key, falling back to inventory. */
export const dc = raw.dealer.dc as Record<string, string>;
export const dcUrl = (key: string) => dc[key] ?? dc.inventory;

export const money = (n: number) => "$" + Number(n).toLocaleString("en-US");

export const milesFmt = (n: number | null) =>
  n == null ? "Mileage on listing" : Number(n).toLocaleString("en-US") + " mi";

/** Google Maps embed for the visit section. */
export const mapEmbedUrl =
  "https://www.google.com/maps?q=" +
  encodeURIComponent(`${raw.dealer.address.line1} ${raw.dealer.address.line2}`) +
  "&output=embed";

/** "#RRGGBB" -> "215 25 32", the channel triple Tailwind needs for bg-brand/15. */
export function hexToRgbChannels(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`theme color must be a 6-digit hex, got "${hex}"`);
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export const brandTokens = {
  brand: raw.theme.brand,
  brandHover: raw.theme.brandHover,
  brandRgb: hexToRgbChannels(raw.theme.brand),
  brandHoverRgb: hexToRgbChannels(raw.theme.brandHover),
};
