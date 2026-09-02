#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Option (b): pull the featured vehicles from DealerCenter automatically.

   STATUS: STUB, AND OFF BY DEFAULT. Option (a) — the hand-maintained
   featured.vehicles list in dealer-config.json — is what ships today.

   Why it is a stub: www.4mcars.com sits behind Cloudflare bot protection. A
   plain request gets HTTP 403 ("Attention Required", cf-ray header), and the
   inventory page is client-rendered on top of that, so there is nothing to
   parse from the HTML even if the request went through. Verified 2026-09-02.

   Three ways to finish it, best first:

     1. DealerCenter feed (RECOMMENDED). DealerCenter publishes inventory
        exports/feeds per account. Ask the dealer to enable one and paste the
        URL into featured.autoFetch.source. Add a parse() for its shape below.
        No scraping, no bot wall, stable schema.

     2. Their site's own data call. Open the live inventory page with DevTools
        on the Network tab and look for the XHR/fetch the listing grid uses,
        plus the window-sticker?inventoryid=<id> links on each card — the id in
        that query string is the VDP key. Add the endpoint as a strategy.

     3. Headless browser. Render the page with Playwright/Puppeteer and read
        the DOM. Works through Cloudflare's JS challenge, but it is the most
        fragile option and the heaviest to run on a schedule.

   Usage:
     node scripts/fetch-inventory.mjs --probe     see what each strategy returns
     node scripts/fetch-inventory.mjs --enable    fetch and write the cache

   Writes inventory.generated.json. The build only reads it when
   featured.autoFetch.enabled is true in dealer-config.json, so a half-finished
   fetcher can never quietly replace hand-checked listings.
--------------------------------------------------------------------------- */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CFG = JSON.parse(readFileSync(path.join(ROOT, "dealer-config.json"), "utf8"));
const AUTO = CFG.featured.autoFetch || {};
const args = new Set(process.argv.slice(2));
const PROBE = args.has("--probe");
const ENABLED = args.has("--enable") || process.env.INVENTORY_AUTOFETCH === "1";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

/* Each strategy: where to look, and how to turn the response into our shape.
   parse() returns [] until someone fills it in against a real payload. */
const STRATEGIES = [
  {
    name: "configured-feed",
    url: () => AUTO.source || null,
    parse(text) {
      // TODO: map the DealerCenter feed to our shape. Expect either JSON or XML.
      // Target shape, one per vehicle:
      //   { title, price: Number, miles: Number|null, spec, img, url }
      // img should be a local slot in public/img/ or an absolute CDN URL.
      // url should be the real VDP (…/window-sticker?inventoryid=<id> works).
      try {
        const data = JSON.parse(text);
        const rows = Array.isArray(data) ? data : data.vehicles || data.results || data.items || [];
        return rows.slice(0, 8).map((v, i) => ({
          title: [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ").trim(),
          price: Number(v.price ?? v.sellingPrice ?? 0) || null,
          miles: v.mileage != null ? Number(v.mileage) : v.odometer != null ? Number(v.odometer) : null,
          spec: [v.drivetrain || v.drive, v.transmission].filter(Boolean).join(" · ") || "See listing",
          img: v.photo || v.image || `/img/vehicle-${String(i + 1).padStart(2, "0")}.jpg`,
          url: v.vdpUrl || v.url || (v.inventoryId ? `${CFG.dealer.dc.home}window-sticker?inventoryid=${v.inventoryId}` : null),
        }));
      } catch {
        return []; // not JSON — add an XML branch when the real feed shape is known
      }
    },
  },
  {
    name: "inventory-page",
    url: () => CFG.dealer.dc.inventory,
    parse() {
      // Client-rendered behind Cloudflare — nothing parseable. Kept so --probe
      // reports the wall honestly instead of looking like a missing feature.
      return [];
    },
  },
];

async function attempt(s) {
  const url = s.url();
  if (!url) return { name: s.name, skipped: "no url configured" };
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json, text/xml, text/html" } });
    const text = await res.text();
    return {
      name: s.name,
      url,
      status: res.status,
      type: res.headers.get("content-type") || "",
      bytes: text.length,
      vehicles: res.ok ? s.parse(text) : [],
    };
  } catch (err) {
    return { name: s.name, url, error: err.message };
  }
}

const results = [];
for (const s of STRATEGIES) results.push(await attempt(s));

if (PROBE) {
  for (const r of results) {
    console.log(
      `  ${r.name.padEnd(18)} ${r.skipped || r.error || `${r.status} ${r.type.split(";")[0]} ${r.bytes}B → ${r.vehicles.length} vehicles`}`
    );
  }
  console.log("\n  Probe only — nothing written.");
  process.exit(0);
}

if (!ENABLED) {
  console.log(
    "\n  Automated inventory is off. featured.vehicles in dealer-config.json is the live source.\n" +
      "  Run with --probe to test the strategies, or --enable to fetch and write.\n"
  );
  process.exit(0);
}

const hit = results.find((r) => r.vehicles && r.vehicles.length);
if (!hit) {
  console.error("\n  No strategy returned vehicles — leaving the hand-maintained list alone.");
  for (const r of results) console.error(`    ${r.name}: ${r.skipped || r.error || r.status}`);
  process.exit(1);
}

writeFileSync(
  path.join(ROOT, "inventory.generated.json"),
  JSON.stringify({ fetchedAt: new Date().toISOString(), strategy: hit.name, vehicles: hit.vehicles }, null, 2) + "\n"
);
console.log(`\n  Wrote inventory.generated.json — ${hit.vehicles.length} vehicles via ${hit.name}.`);
console.log("  Set featured.autoFetch.enabled true in dealer-config.json for the build to use it.\n");
