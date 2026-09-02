# 4M Cars LLC — landing page

A lead-capture front door for **4M Cars LLC**, 1543 W Landstreet Rd, Orlando FL.
Not a dealer site: inventory, VDPs, CarFax, credit application, warranty and
contact all stay on their DealerCenter site at <https://www.4mcars.com>, and
every inventory or finance action here deep-links there in a new tab.

This page owns exactly: hero, featured inventory rail, warranty and financing
messaging, the test-drive lead form → GoHighLevel, FAQ, map, footer, and the
three SMS-compliance pages.

**Next.js 15 (App Router) + React 19 + Tailwind + TypeScript.**

## Quick start

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run start     # serve the production build
npm run lint
```

No environment variables are required to run it. Everything third-party is
opt-in — see [Integrations](#integrations).

## How it is put together

```
dealer-config.json          the only file you edit for a new dealer
lib/config.ts               typed accessors + derived values over that JSON
tailwind.config.js          shared automotive palette + the two dealer tokens
app/
  layout.tsx                fonts, metadata, AutoDealer JSON-LD, brand tokens
  page.tsx                  the landing page, composed from components/
  globals.css               Tailwind entry + hatch / steel-rule / rail / tag
  api/lead/route.ts         test-drive form intake → GoHighLevel
  privacy-policy/           ) the three compliance pages, one route each
  terms-of-service/         )
  sms-disclosure/           )
  robots.ts, sitemap.ts     generated from the config
components/                 one file per section, client only where needed
content/legal/*.ts          dealer-neutral compliance bodies
public/img/, public/hero/   photos — see public/img/README.md
legacy/                     the previous static build system, kept for reference
```

Every section is a **server component** except the four that need browser state:
`hero` (carousel), `inventory` (rail scrolling), `site-header` (mobile menu) and
`lead-form`. So the cards, steps, FAQ, nav and hours are all in the HTML that
ships, and the page reads correctly with JavaScript off — which matters for A2P
campaign review, for crawlers, and for Lighthouse.

Fonts are self-hosted at build time by `next/font`, and icons come from
`lucide-react` and tree-shake to the handful actually used, so the page makes no
render-blocking third-party request.

## Re-branding for a new dealer

Two things change, and that is most of the job:

1. **`dealer-config.json`** — name, phone, address, hours, DealerCenter URLs,
   nav labels, featured vehicles, browse shortcuts, steps, FAQs, SEO copy, and
   `legal.governingState` / `governingVenue`.
2. **`theme.brand` / `theme.brandHover`** in that same file — the two hex values
   `app/layout.tsx` turns into `--brand`, `--brand-hover` and their rgb channel
   triples (the triples are what make `bg-brand/15` and `selection:bg-brand/50`
   work).

Then drop the new dealer's photos into `public/img/` and `public/hero/`.

Every dealer **fact** — name, phone, address, hours, links, brand color — comes
from the config, and no fact is hardcoded in `app/` or `components/`. What the
config cannot do is write the new dealer's **marketing prose**: the headline,
the warranty pitch, the "come see us" copy. That lives in the components, in
plain JSX, because a person has to rewrite it either way. The lines that name
this dealer, its city or its street:

| File | What to rewrite |
|---|---|
| `components/hero.tsx` | headline ("built for Florida"), body copy |
| `components/warranty.tsx` | the warranty pitch |
| `components/visit.tsx` | "Come see us on Landstreet", the automall line |
| `components/site-footer.tsx` | the footer blurb |
| `components/announcement-bar.tsx` | the three highlights |

## Integrations

All three are opt-in and all three fail *closed* — with the variable unset,
nothing third-party is requested and nothing is silently dropped. Copy
`.env.example` to `.env.local` to set them.

| Variable | What it does when set |
|---|---|
| `GHL_LEAD_WEBHOOK_URL` | The GoHighLevel inbound webhook the test-drive lead is forwarded to. **Server-side only** — it never reaches the browser. Unset, the lead is validated, logged in full server-side and confirmed to the visitor. |
| `NEXT_PUBLIC_GHL_WIDGET_ID` | Injects 4M's own GoHighLevel chat widget after the page is interactive. Ours, not DealerCenter's. |
| `NEXT_PUBLIC_GTM_ID` | Injects the GTM container after the page is interactive, plus the `<noscript>` iframe. No GA/gtag alongside it — tags belong inside the container. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for canonical tags, `og:url`, sitemap and JSON-LD. Falls back to `site.url` in the config. |

The browser posts to `/api/lead`, never straight to GoHighLevel, so the webhook
stays a secret and the visitor never hits a cross-origin failure. The route
validates name and phone, trims and caps every field, and forwards a payload
carrying both SMS consent booleans, `language`, a verbatim snapshot of the
consent text the visitor actually agreed to (for the A2P consent record), and
any `utm_*` / `gclid` / `fbclid` from the URL. A delivery failure is a real 502
and the form shows the inline error with the call/WhatsApp fallback; the whole
lead is written to the server log first, so an outage never loses a customer.

## Hero catalogue

The hero image is a catalogue of the dealer's own lot photos in `public/hero/`.
It cross-fades on a timer (`assets.hero.intervalMs`, 6s) and can be stepped with
the arrows, the dots, arrow keys, or a swipe on touch. Order, captions and alt
text all come from `assets.hero.slides` — filenames carry no meaning, so
reordering is a config edit.

Adding a slide is: drop the photo in `public/hero/`, add an entry.

- Slide 1 is the LCP image and gets `priority`; the rest are lazy, so eight
  slides cost one image on first load.
- The timer stops for good on the first manual step — that is the pause
  mechanism — and never starts under `prefers-reduced-motion`. It also pauses on
  hover, on focus, and while the tab is hidden.
- The caption fills the "On the lot now" badge, so the badge is true per slide.

## Featured inventory

`featured.vehicles` in `dealer-config.json` is the live source and is
**hand-maintained**. It is a snapshot of real listings and goes stale fast —
refresh it weekly and bump `featured.lastRefreshed`.

An automated refresh was stubbed in the old build and is archived at
`legacy/scripts/fetch-inventory.mjs`. `www.4mcars.com` sits behind Cloudflare bot
protection (plain requests get a 403) and the inventory grid is client-rendered,
so it needs either a DealerCenter feed URL or a headless browser before it does
anything real.

## Reviews

`reviews.items` is deliberately empty and the section renders an honest empty
state plus a link to Google. Add real reviews as `{ "name", "quote", "lang" }`
when the dealer supplies them. **Do not add ratings, review counts, or quotes
the dealer has not given us** — there is no `aggregateRating` in the structured
data for the same reason.

## Spanish

English-primary, with the Spanish cues in place (the form's language selector,
the FAQ, the "Hablamos español" copy). The previous build had a runtime
dictionary swap behind `data-i18n` attributes; it was never switched on, and it
does not survive the move to React components. The archived dictionary is at
`legacy/es.json`.

Doing it properly here means App Router i18n — a `[locale]` segment and
`next-intl` (or equivalent) — which is a real piece of work, not a config flag.
Treat it as the next feature, not as something half-wired in the current code.

## Compliance pages

`/privacy-policy`, `/terms-of-service` and `/sms-disclosure` are statically
prerendered and work with no JavaScript. The bodies live in `content/legal/*.ts`
as dealer-neutral templates; the dealer name, phone, address and governing state
interpolate from the config. The old `.html` URLs 301 to them.

The five carrier-required clauses are verbatim and must not be reworded: message
frequency varies · message and data rates may apply · reply STOP to opt out,
HELP for help · consent is not a condition of purchase · no mobile information
will be shared with third parties or affiliates for marketing purposes. The
same language is in the `<noscript>` block on the landing page so A2P validators
find it without running scripts.

**These are templates, not legal advice — have counsel review before launch.**

## Deploying

**Vercel** — zero config; it detects Next.js and runs `npm run build`. Set the
environment variables from `.env.example` in the project settings, and set
`NEXT_PUBLIC_SITE_URL` (or `site.url` in the config) to the real canonical URL —
it drives `og:image`, canonical, sitemap and JSON-LD.

Security headers (`X-Content-Type-Options`, `Referrer-Policy`,
`X-Frame-Options`) and the `.html` → clean-URL redirects are in
`next.config.mjs`.

## Before launch

- [ ] Decide the `*` on the advertised prices. The dealer's own listings write
      them as "$19,990 *"; the rail currently shows a clean "$19,990" because a
      bare asterisk with no disclosure text underneath is worse than none. If
      the asterisk means "plus tax, tag and dealer fee", give me that exact
      wording and it goes under the rail as a footnote.
- [ ] Re-add the two vehicles parked in `featured._pending` (2021 Hyundai
      Sonata SE, 2017 BMW X3) once real photos exist.
- [ ] Ask for full-resolution rail photos — the current set is 640×480 and is
      upscaled slightly on a 2× display.
- [ ] Swap `public/img/warranty.jpg` for an inspection-bay / tech-at-work shot
      when the dealer supplies one. It is currently a crop of their own 2015 Ram
      2500 lot photo.
- [ ] Confirm the street address with the dealer. The hero photos have
      "1543W LANDSTREET RD STE 901 ORLANDO FL 32824" burned in by the dealer
      themselves, which adds **Ste 901** to what the config currently says;
      directories also list 1455 Ste 405 and 1477 Ste A on W Landstreet Rd.
- [ ] Get a full-resolution `jeep-gladiator-lifted.jpg` — the supplied file is
      259x194 and will look soft at hero size. Until then, either accept it or
      delete that entry from `assets.hero.slides`.
- [ ] **Check the 2019 F-150 price** — $64,990 on a 101k-mile truck sits far
      outside the $16,990–$40,990 range of every other card, and it is the
      first vehicle a visitor sees.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the live domain.
- [ ] Set `GHL_LEAD_WEBHOOK_URL`, then submit a test lead and confirm it lands
      in the GHL sub-account with both consent booleans.
- [ ] Set `NEXT_PUBLIC_GHL_WIDGET_ID` and `NEXT_PUBLIC_GTM_ID`.
- [ ] Counsel reviews the three compliance pages.
- [ ] Refresh `featured.vehicles` and `featured.lastRefreshed`.
