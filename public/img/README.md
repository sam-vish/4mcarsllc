# Image slots

Every file here is a **named slot**. The paths are read from
`dealer-config.json` (`assets.*` and `featured.vehicles[].img`) — drop a real
photo in at the same filename, no code change. `next/image` handles the
resizing and format conversion, so ship the largest version you have.

The hero photos live one folder up in **`public/hero/`** — that folder is the
hero catalogue, and its order and captions are set by `assets.hero.slides` in
`dealer-config.json`, not by filename.

The inventory rail now runs on **real dealer photos**, named for the vehicle
(`2024-toyota-tundra-double-cab.jpg`) rather than numbered slots. To add a
vehicle: drop the photo here with a kebab-case name and add an entry to
`featured.vehicles`. The old `vehicle-01…08.jpg` placeholder plates are
archived at `legacy/placeholder-img/`.

`warranty.jpg` is a crop of the dealer's own 2015 Ram 2500 lot photo. Swap it
for a real inspection shot when one exists.

**Resolution:** the current rail photos are 640×480. A card is 340px wide, so
on a 2× display they are being upscaled slightly. They look fine, but ask the
dealer for the full-size originals when convenient.

| File | Size | Aspect | What goes here |
|---|---|---|---|
| `warranty.jpg` | 1400 × 1120 | 5:4 | Inspection bay, engine bay, or a tech working on a vehicle — proof the 3-month warranty is real work, not a sticker. *Currently a crop of `hero/2015-ram-2500.jpg` as a stand-in.* |
| rail photos, e.g. `2024-toyota-tundra-double-cab.jpg` | 900 × 675 target | 4:3 | One per entry in `featured.vehicles`. Three-quarter front, on the lot, same angle throughout. Any 4:3 photo works; the card crops to 4:3 regardless. |
| `og.jpg` | 1200 × 630 | 1.91:1 | Social share card. Already built: dark ground, logo, "Trucks, Jeeps & 4x4s · Landstreet Rd, Orlando". Redo it if the tagline changes. |
| `logo.png` | 760 wide | — | Transparent PNG, light-on-dark. Trimmed from the dealer's supplied mark. |
| `favicon.png` | 512 × 512 | 1:1 | The mark on brand red. |
| `apple-touch-icon.png` | 180 × 180 | 1:1 | Same, iOS home screen. |

## Before you drop photos in

- **Keep the dimensions.** `<img>` width/height attributes are baked into the
  HTML from `dealer-config.json` to hold layout space and keep CLS at zero. If a
  real photo is a different size, update `assets.hero.width` / `.height` (and the
  same for `warranty`) to match, or crop to the size above.
- **Compress.** Aim under 250 KB each for the vehicle cards, under 400 KB for the
  hero. `sips -Z 1600 -s formatOptions 80 photo.jpg --out hero.jpg` is enough.
- **Real photos only.** No stock imagery of cars the dealer does not have.
