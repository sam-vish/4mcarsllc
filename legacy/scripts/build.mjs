/* ---------------------------------------------------------------------------
   Build: dealer-config.json + src/ templates  ->  dist/

   Everything a visitor reads is rendered here, at build time, so the page works
   with JavaScript disabled (and so A2P validators and crawlers see the real
   content). src/app.js is left with behaviour only.

   Outputs:
     dist/index.html              the landing page
     dist/privacy-policy.html     ) static compliance pages, no JS,
     dist/terms-of-service.html   ) resolvable at the root
     dist/sms-disclosure.html     )
     dist/assets/site.css         Tailwind, purged + minified
     dist/assets/app.js           behaviour
     dist/img/*                   from public/
     dist/i18n/*.json             phase-2 dictionaries
     dist/ghl-embed.html          single self-contained file for a GHL page
     dist/robots.txt, sitemap.xml
--------------------------------------------------------------------------- */
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const p = (...s) => path.join(ROOT, ...s);
const read = (...s) => readFileSync(p(...s), "utf8");
const warnings = [];
const warn = (m) => warnings.push(m);

const CFG = JSON.parse(read("dealer-config.json"));
const D = CFG.dealer;
const LOCALE = (CFG.i18n && CFG.i18n.defaultLocale) || "en";

/* ------------------------------- helpers -------------------------------- */
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Every config string may be "text" or { en: "…", es: "…" } — see i18n notes
// in dealer-config.json. The build renders the default locale.
const t = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v[LOCALE] ?? v.en ?? "" : v ?? "");

const money = (n) => "$" + Number(n).toLocaleString("en-US");
const milesFmt = (n) => (n == null ? "Mileage on listing" : Number(n).toLocaleString("en-US") + " mi");
const isPlaceholder = (v) => !v || /^REPLACE|^GHL_WEBHOOK_URL$|X{4,}/.test(String(v));
const asset = (v) => (CFG.assets.base || "") + v;
const SITE_URL = String(CFG.site.url || "").replace(/\/+$/, "");

const hexToRgb = (hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) throw new Error(`theme color must be a 6-digit hex, got "${hex}"`);
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/* --------------------------------- icons --------------------------------
   Lucide, inlined at build time from lucide-static. No icon library ships to
   the browser. {{ICON:name:tailwind classes}} in a template becomes an <svg>.
------------------------------------------------------------------------- */
const ICON_ALIASES = { "check-circle-2": "circle-check-big" };
const ICON_DIR = p("node_modules", "lucide-static", "icons");
const iconCache = new Map();

function icon(name, classes = "") {
  const file = (ICON_ALIASES[name] || name) + ".svg";
  if (!iconCache.has(file)) {
    const full = path.join(ICON_DIR, file);
    if (!existsSync(full)) throw new Error(`unknown lucide icon "${name}" (looked for ${file})`);
    iconCache.set(
      file,
      readFileSync(full, "utf8")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/\s+/g, " ")
        .replace(/class="[^"]*"/, "")
        .trim()
    );
  }
  const cls = classes.replace(/\s+/g, " ").trim();
  return iconCache
    .get(file)
    .replace("<svg ", `<svg class="${esc(cls)}" aria-hidden="true" focusable="false" `);
}

/* ------------------------------ components ------------------------------
   Markup for the repeated items. This is the same template-literal rendering
   the reference did at runtime, moved to build time.
------------------------------------------------------------------------- */
const dcUrl = (key) => D.dc[key] || D.dc.inventory;

const navLink = (cls) => (item) => {
  const href = item.href || dcUrl(item.key);
  return `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer" class="${cls}">${esc(t(item.label))}</a>`;
};

const railCard = (v, i) => `
      <a href="${esc(v.url || D.dc.inventory)}" target="_blank" rel="noopener noreferrer" class="group w-[78vw] shrink-0 overflow-hidden rounded-lg border border-white/10 bg-asphalt sm:w-[340px]">
        <div class="relative">
          <img src="${esc(asset(v.img))}" alt="${esc(t(v.title))}" width="900" height="675" loading="lazy" decoding="async" class="aspect-[4/3] w-full object-cover" />
          <p class="tag absolute bottom-3 left-3 rounded-sm bg-brand px-3 py-1.5 text-3xl text-white">${money(v.price)}</p>
        </div>
        <div class="p-5">
          <h3 class="font-display text-2xl font-bold leading-tight text-white">${esc(t(v.title))}</h3>
          <p class="mt-1.5 text-sm text-smoke">${esc(milesFmt(v.miles))} · ${esc(t(v.spec))}</p>
          <span class="mt-4 inline-flex items-center gap-1.5 font-display text-base font-semibold uppercase tracking-wide text-steel group-hover:text-white">View photos &amp; CarFax ${icon("arrow-up-right", "h-4 w-4")}</span>
        </div>
      </a>`;

// Slide 1 carries a real src (it is the LCP image); the rest carry data-src and
// are fetched by app.js only when they are about to be shown.
const heroSlide = (v, i, all) => `
        <img ${i === 0 ? `src="${esc(asset(v.src))}" fetchpriority="high"` : `data-src="${esc(asset(v.src))}"`} alt="${esc(t(v.alt))}" width="${CFG.assets.hero.width}" height="${CFG.assets.hero.height}" decoding="async"
          data-hero-slide data-caption="${esc(t(v.caption))}" aria-hidden="${i === 0 ? "false" : "true"}"
          aria-roledescription="slide" aria-label="${i + 1} of ${all.length}: ${esc(t(v.caption))}"
          class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${i === 0 ? "opacity-100" : "opacity-0"}" />`;

const heroDot = (v, i) => `
            <button type="button" data-hero-dot="${i}" aria-label="Show ${esc(t(v.caption))}" aria-current="${i === 0}" class="h-1.5 w-6 rounded-sm transition-colors ${i === 0 ? "bg-brand" : "bg-white/35 hover:bg-white/60"}"></button>`;

const browseCard = (b) => `
      <a href="${esc(dcUrl(b.key))}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-4 rounded-lg border border-white/10 bg-asphalt p-5 hover:border-brand">
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand/15 text-brand">${icon(b.icon, "h-5 w-5")}</span>
        <span><span class="block font-display text-xl font-bold text-white">${esc(t(b.title))}</span><span class="block text-sm text-smoke">${esc(t(b.note))}</span></span>
      </a>`;

const stepCard = (s, i) => `
      <li class="rounded-lg border border-white/10 bg-tarmac p-6">
        <span class="tag text-5xl text-brand">${i + 1}</span>
        <h3 class="mt-3 font-display text-2xl font-bold text-white">${esc(t(s.title))}</h3>
        <p class="mt-2 text-sm leading-relaxed text-steel">${esc(t(s.body))}</p>
      </li>`;

const faqItem = (f) => `
      <details class="group py-4">
        <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl font-semibold text-white">
          ${esc(t(f.q))}${icon("plus", "h-5 w-5 shrink-0 text-steel transition-transform group-open:rotate-45")}
        </summary>
        <p class="mt-3 max-w-2xl leading-relaxed text-steel">${esc(t(f.a))}</p>
      </details>`;

// Renders both states. REVIEWS stays empty until the dealer supplies real
// Google reviews — never invent quotes, ratings or counts.
const reviewsBlock = () => {
  const items = (CFG.reviews && CFG.reviews.items) || [];
  if (!items.length) {
    return `<p class="text-steel md:col-span-3">Reviews from real ${esc(D.shortName)} customers will appear here. Until then, read them directly on Google.</p>`;
  }
  return items
    .map(
      (r) => `
      <figure class="rounded-lg border border-white/10 bg-asphalt p-6">
        <blockquote class="text-chalk">“${esc(t(r.quote))}”</blockquote>
        <figcaption class="mt-5 text-sm font-semibold text-steel">${esc(r.name)} · Google review</figcaption>
      </figure>`
    )
    .join("");
};

const hoursList = () =>
  D.hours.map((h) => `<dt class="font-semibold">${esc(t(h.label))}</dt><dd>${esc(t(h.value))}</dd>`).join("");

/* ------------------------------- JSON-LD --------------------------------
   Real, verifiable facts only. No aggregateRating / reviewCount — the dealer
   has not supplied reviews and we do not invent social proof.
------------------------------------------------------------------------- */
function jsonLd() {
  const dealer = {
    "@type": "AutoDealer",
    "@id": SITE_URL + "/#dealer",
    name: D.name,
    legalName: D.legalName || D.name,
    url: SITE_URL + "/",
    telephone: D.phoneTel,
    email: D.email,
    image: SITE_URL + asset(CFG.assets.og),
    logo: SITE_URL + asset(CFG.assets.logo),
    address: {
      "@type": "PostalAddress",
      streetAddress: D.address.street,
      addressLocality: D.address.city,
      addressRegion: D.address.region,
      postalCode: D.address.postalCode,
      addressCountry: D.address.country,
    },
    hasMap: D.mapsUrl,
    knowsLanguage: D.languages,
    sameAs: [D.instagram, D.tiktok, D.googleReviewsUrl, D.dc.home].filter(Boolean),
    openingHoursSpecification: D.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
  };
  const faq = {
    "@type": "FAQPage",
    "@id": SITE_URL + "/#faq",
    mainEntity: CFG.faqs.map((f) => ({
      "@type": "Question",
      name: t(f.q),
      acceptedAnswer: { "@type": "Answer", text: t(f.a) },
    })),
  };
  const graph = { "@context": "https://schema.org", "@graph": [dealer, faq] };
  return `<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, "\\u003c")}</script>`;
}

/* ------------------------------- templating ------------------------------ */
function render(tpl, map) {
  const out = tpl
    .replace(/\{\{ICON:([a-z0-9-]+):([^}]*)\}\}/g, (_, name, cls) => icon(name, cls))
    .replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, key) => (key in map ? map[key] : m));
  const left = out.match(/\{\{[A-Z0-9_:-]+\}\}/g);
  if (left) throw new Error(`unresolved template tokens: ${[...new Set(left)].join(", ")}`);
  return out;
}

/* --------------------------------- CSS ---------------------------------- */
function buildCss() {
  const brand = CFG.theme.brand;
  const brandHover = CFG.theme.brandHover;
  const tokens = [
    `--brand: ${brand};`,
    `--brand-hover: ${brandHover};`,
    `--brand-rgb: ${hexToRgb(brand)};`,
    `--brand-hover-rgb: ${hexToRgb(brandHover)};`,
  ].join("\n  ");

  mkdirSync(p(".build"), { recursive: true });
  writeFileSync(p(".build", "styles.css"), read("src", "styles.css").replace("/* @@BRAND_TOKENS@@ */", tokens));

  const bin = p("node_modules", ".bin", "tailwindcss");
  if (!existsSync(bin)) throw new Error("tailwindcss is not installed — run `npm install` first.");
  const res = spawnSync(bin, ["-i", ".build/styles.css", "-o", "dist/assets/site.css", "--minify"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  if (res.status !== 0) throw new Error("tailwind build failed:\n" + (res.stderr || res.stdout));
  return readFileSync(p("dist", "assets", "site.css"), "utf8");
}

/* --------------------------------- build --------------------------------- */
rmSync(p("dist"), { recursive: true, force: true });
mkdirSync(p("dist", "assets"), { recursive: true });

const css = buildCss();
const appJs = read("src", "app.js");
writeFileSync(p("dist", "assets", "app.js"), appJs);
cpSync(p("public"), p("dist"), { recursive: true, filter: (src) => !src.endsWith(".md") });
if (existsSync(p("src", "i18n"))) cpSync(p("src", "i18n"), p("dist", "i18n"), { recursive: true });

/* --- integrations: nothing third-party is emitted while ids are placeholders --- */
/* --- featured vehicles: hand-maintained by default, generated when flagged --- */
let featured = CFG.featured.vehicles;
let featuredAge = CFG.featured.lastRefreshed;
const auto = CFG.featured.autoFetch || {};
if (auto.enabled) {
  const cache = p("inventory.generated.json");
  if (!existsSync(cache)) {
    warn("featured.autoFetch is enabled but inventory.generated.json is missing — falling back to the hand-maintained list. Run `npm run refresh-inventory -- --enable`.");
  } else {
    const gen = JSON.parse(readFileSync(cache, "utf8"));
    if (!gen.vehicles || !gen.vehicles.length) {
      warn("inventory.generated.json has no vehicles — falling back to the hand-maintained list.");
    } else {
      featured = gen.vehicles;
      featuredAge = gen.fetchedAt.slice(0, 10);
    }
  }
}
const ageDays = Math.floor((Date.now() - Date.parse(featuredAge)) / 86400000);
if (ageDays > (auto.maxAgeDays || 14))
  warn(`Featured vehicles were last refreshed ${ageDays} days ago (${featuredAge}) — prices and mileage go stale fast.`);

const gtmId = CFG.integrations.gtmContainerId;
const gtmReal = !isPlaceholder(gtmId);
if (!gtmReal) warn(`GTM container id is a placeholder ("${gtmId}") — no analytics is injected.`);
if (isPlaceholder(CFG.integrations.ghlWidgetId)) warn("GHL chat widget id is a placeholder — the widget will not load.");
if (isPlaceholder(CFG.integrations.ghlLeadWebhookUrl))
  warn("GHL lead webhook is a placeholder — the form runs in DEMO MODE and sends nothing. Do not launch like this.");

const shared = {
  LANG: LOCALE,
  DEALER_NAME: esc(D.name),
  DEALER_SHORT_NAME: esc(D.shortName),
  PHONE_DISPLAY: esc(D.phoneDisplay),
  PHONE_TEL: esc(D.phoneTel),
  EMAIL: esc(D.email),
  ADDRESS_LINE1: esc(D.address.line1),
  ADDRESS_LINE2: esc(D.address.line2),
  SITE_URL: esc(SITE_URL),
  YEAR: String(new Date().getFullYear()),
  LOGO_SRC: esc(asset(CFG.assets.logo)),
  LOGO_ALT: esc(CFG.assets.logoAlt),
  FAVICON: esc(asset(CFG.assets.favicon)),
  APPLE_TOUCH_ICON: esc(asset(CFG.assets.appleTouchIcon)),
  STYLES_TAG: `<link rel="stylesheet" href="/assets/site.css" />`,
};

const indexMap = {
  ...shared,
  TITLE: esc(t(CFG.site.title)),
  DESCRIPTION: esc(t(CFG.site.description)),
  OG_TITLE: esc(t(CFG.site.ogTitle)),
  OG_DESCRIPTION: esc(t(CFG.site.ogDescription)),
  OG_IMAGE_ABSOLUTE: esc(SITE_URL + asset(CFG.assets.og)),
  INVENTORY_COUNT: esc(D.inventoryCount),
  WHATSAPP: esc(D.whatsapp),
  INSTAGRAM: esc(D.instagram),
  MAPS_URL: esc(D.mapsUrl),
  GOOGLE_REVIEWS_URL: esc(D.googleReviewsUrl),
  MAP_EMBED: esc(
    "https://www.google.com/maps?q=" + encodeURIComponent(`${D.address.line1} ${D.address.line2}`) + "&output=embed"
  ),
  DC_INVENTORY: esc(D.dc.inventory),
  DC_WARRANTY: esc(D.dc.warranty),
  DC_APPLY: esc(D.dc.apply),
  HERO_SLIDES: CFG.assets.hero.slides.map(heroSlide).join(""),
  HERO_DOTS: CFG.assets.hero.slides.map(heroDot).join(""),
  HERO_FIRST_CAPTION: esc(t(CFG.assets.hero.slides[0].caption)),
  HERO_INTERVAL: String(CFG.assets.hero.intervalMs),
  WARRANTY_SRC: esc(asset(CFG.assets.warranty.src)),
  WARRANTY_ALT: esc(CFG.assets.warranty.alt),
  WARRANTY_W: String(CFG.assets.warranty.width),
  WARRANTY_H: String(CFG.assets.warranty.height),
  NAV_DESKTOP: CFG.nav.map(navLink("font-display text-lg font-semibold text-chalk hover:text-white")).join(""),
  NAV_MOBILE: CFG.nav.map(navLink("font-display text-2xl font-semibold text-chalk")).join(""),
  NAV_FOOTER: [{ label: "Home", href: D.dc.home }, ...CFG.nav].map(navLink("hover:text-white")).join(""),
  RAIL: featured.map(railCard).join(""),
  BROWSE: CFG.browse.map(browseCard).join(""),
  STEPS: CFG.steps.map(stepCard).join(""),
  REVIEWS: reviewsBlock(),
  FAQ: CFG.faqs.map(faqItem).join(""),
  HOURS: hoursList(),
  JSONLD: jsonLd(),
  HEAD_GTM: gtmReal ? `<script>window.__GTM_ID__=${JSON.stringify(gtmId)};</script>` : "",
  BODY_GTM: gtmReal
    ? `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(
        gtmId
      )}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>`
    : "",
  // Only what app.js actually needs at runtime — no internal notes shipped.
  CONFIG_SCRIPT: `<script>window.DEALER_CONFIG=${JSON.stringify({
    site: { leadSource: CFG.site.leadSource },
    integrations: {
      ghlWidgetId: CFG.integrations.ghlWidgetId,
      ghlLeadWebhookUrl: CFG.integrations.ghlLeadWebhookUrl,
      leadSubmitMode: CFG.integrations.leadSubmitMode,
    },
    i18n: { defaultLocale: LOCALE, locales: CFG.i18n.locales, showToggle: CFG.i18n.showToggle },
  }).replace(/</g, "\\u003c")};</script>`,
  APP_SCRIPT: `<script src="/assets/app.js" defer></script>`,
};

const indexHtml = render(read("src", "index.html"), indexMap);
writeFileSync(p("dist", "index.html"), indexHtml);

/* ----------------------------- legal pages ------------------------------ */
const LEGAL = [
  { slug: "privacy-policy", title: "Privacy Policy", description: `How ${D.name} collects, uses and protects your information.` },
  { slug: "terms-of-service", title: "Terms of Service", description: `The terms that govern your use of the ${D.name} website.` },
  { slug: "sms-disclosure", title: "SMS Disclosure", description: `Text messaging program terms for ${D.name}: opt-in, frequency, rates, STOP and HELP.` },
];
const shell = read("src", "legal", "_shell.html");
for (const page of LEGAL) {
  const bodyMap = {
    ...shared,
    GOVERNING_STATE: esc(CFG.legal.governingState),
    GOVERNING_VENUE: esc(CFG.legal.governingVenue),
  };
  // Build notes (including the "keep verbatim" reminders) stay in src/ and
  // are stripped from the shipped page.
  const source = read("src", "legal", `${page.slug}.html`).replace(/<!--[\s\S]*?-->/g, "").trim();
  const body = render(source, bodyMap);
  writeFileSync(
    p("dist", `${page.slug}.html`),
    render(shell, {
      ...bodyMap,
      LEGAL_TITLE: esc(page.title),
      LEGAL_DESCRIPTION: esc(page.description),
      LEGAL_SLUG: page.slug,
      LEGAL_LAST_UPDATED: esc(CFG.legal.lastUpdated),
      LEGAL_BODY: body,
    })
  );
}

/* --------------------- single-file build for a GHL page ------------------ */
const embedBase = (CFG.assets.base || SITE_URL).replace(/\/+$/, "");
const embed = indexHtml
  .replace(indexMap.STYLES_TAG, `<style>${css}</style>`)
  .replace(indexMap.APP_SCRIPT, `<script>${appJs}</script>`)
  .replace(/(src|href)="\/(?!\/)/g, `$1="${embedBase}/`)
  // Same page at a second URL — canonical already points home, noindex makes sure.
  .replace('<meta name="robots" content="index, follow" />', '<meta name="robots" content="noindex, follow" />');
writeFileSync(p("dist", "ghl-embed.html"), embed);

/* ------------------------------ robots + sitemap ------------------------- */
writeFileSync(
  p("dist", "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /ghl-embed.html\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
);
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  p("dist", "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    ["", ...LEGAL.map((l) => l.slug + ".html")]
      .map((s) => `  <url><loc>${SITE_URL}/${s}</loc><lastmod>${today}</lastmod></url>`)
      .join("\n") +
    `\n</urlset>\n`
);

rmSync(p(".build"), { recursive: true, force: true });

/* ------------------ dealer-specific prose still in the template ------------
   Facts, brand and content lists all come from dealer-config.json. Marketing
   prose does not — it has to be rewritten per dealer, so it lives in
   src/index.html behind data-i18n keys. This lists the lines that name the
   current dealer, its city or its phone, so re-branding is a checklist rather
   than a hunt.
------------------------------------------------------------------------- */
const tell = [D.name, D.shortName, D.address.city, D.phoneDisplay]
  // distinctive words from the street address catch "on Landstreet", "the Landstreet Automall"
  .concat(D.address.street.split(/\s+/).filter((w) => w.length > 5))
  .filter(Boolean);
const copyKeys = [...read("src", "index.html").matchAll(/data-i18n(?:-html)?="([^"]+)"[^>]*>([\s\S]{0,400}?)</g)]
  .filter(([, , text]) => tell.some((w) => text.includes(w)))
  .map(([, key]) => key);

/* --------------------------------- report -------------------------------- */
const imageCount = () =>
  ["img", "hero"].reduce((n, d) => n + (existsSync(p("dist", d)) ? readdirSync(p("dist", d)).filter((f) => /\.(jpe?g|png|webp|avif|svg)$/i.test(f)).length : 0), 0);
const size = (f) => (readFileSync(p("dist", f)).length / 1024).toFixed(1) + " KB";
console.log(`\n  Built ${D.name} → dist/`);
console.log(`    index.html        ${size("index.html")}`);
console.log(`    assets/site.css   ${size("assets/site.css")}`);
console.log(`    assets/app.js     ${size("assets/app.js")}`);
console.log(`    ghl-embed.html    ${size("ghl-embed.html")}  (single file, for a GHL custom-HTML page)`);
console.log(`    ${LEGAL.length} compliance pages, ${imageCount()} images (${CFG.assets.hero.slides.length} hero slides), robots.txt, sitemap.xml`);
if (copyKeys.length) {
  console.log(`\n  Prose naming ${D.shortName} / ${D.address.city}, rewrite for a new dealer (src/index.html):`);
  console.log("    " + copyKeys.join(", "));
}
if (warnings.length) {
  console.log("\n  Before launch:");
  for (const w of warnings) console.log("    ! " + w);
}
console.log("");
