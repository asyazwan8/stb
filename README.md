# Sarawak AI Photobooth

A kiosk demo for the **Sarawak Tourism Board**, built for a **9:16 vertical
kiosk** (1080×1920, large floor-standing panel). A visitor picks a culture,
learns what the traditional dress means, takes a photo, and gets their face
composited into an authentic reference portrait — then scans a QR code to take
it home.

Built as a pitch demo, so parts are deliberately marked **Coming soon**: three of
the four ethnic groups, and every costume hotspot except the headgear.

---

## Swapping in the real assets

The repo ships with clearly-marked **placeholder artwork** so the app builds and
runs end to end. Replace these three files — keep the filenames identical — and
push; Vercel redeploys automatically.

| Path | What it should be |
| --- | --- |
| `public/brand/stb-masthead.png` | The official "SARAWAK — Gateway to Borneo" lockup (transparent PNG, roughly 3:1) |
| `app/icon.png` | Optional — the browser-tab mark (square PNG) |
| `public/references/iban-female.*` | The Iban *Ngepan Indu* reference portrait (portrait orientation) |
| `public/references/iban-male.*` | The Iban *Ngepan Lelaki* reference portrait (portrait orientation) |

`.jpg`, `.png` and `.webp` all work for the references — update the `image` path
in `lib/ethnics.ts` to match the extension you upload, and set `aspect` to the
file's real pixel dimensions so the hotspot overlay stays aligned.

### Destination photography

Four **landscape** photos drive the attract loop and the loading screen. Drop
them into `public/places/` with these exact filenames:

| File | Place |
| --- | --- |
| `borneo-cultures-museum.jpg` | Borneo Cultures Museum, Kuching |
| `sarawak-cultural-village.jpg` | Sarawak Cultural Village, Santubong |
| `bako-national-park.jpg` | Bako National Park |
| `semenggoh-wildlife-centre.jpg` | Semenggoh Wildlife Centre |

Landscape, roughly 16:9, 1600×900 or larger. They are shown as an editorial
band at their natural aspect — **never cropped to the portrait panel** — so the
whole frame is always visible. The place list in `lib/places.ts` is the single
source of truth; the placeholder generator reads it directly.

### After replacing a reference photo

Two things may need a nudge in `lib/ethnics.ts`:

1. **`aspect`** — set `{ w, h }` to the new photo's pixel dimensions. This keeps
   the hotspot overlay aligned.
2. **Hotspot coordinates** — open the learn screen with `?calibrate=1`, tap the
   photo, and read the `x` / `y` percentages off the overlay (they're also
   logged to the console). Paste them into the matching hotspot.

## Configuration

| Variable | Required | Notes |
| --- | --- | --- |
| `FAL_KEY` | **yes** | fal.ai API key. Without it the kiosk shows a clear "not configured" message instead of crashing. |
| `FAL_MODEL` | no | Defaults to `fal-ai/nano-banana-pro/edit`. Set to `fal-ai/nano-banana-2/edit` for a faster but less identity-faithful swap. |

Set `FAL_KEY` in **Vercel → Project → Settings → Environment Variables** (all
environments), then redeploy.

## How the face swap works

1. `POST /api/swap` reads the chosen reference portrait off disk, inlines it as a
   data URI, and submits it with the visitor's photo to the fal queue. It returns
   a `requestId` immediately.
2. The client polls `GET /api/swap/[requestId]` every 2s.
3. `GET /api/image?src=…` proxies the finished image from fal so downloads are
   same-origin (iOS Safari won't reliably save a cross-origin blob). The proxy is
   host-allowlisted to fal's own media hosts.

The reference is inlined rather than linked because a Vercel preview deployment
can sit behind deployment protection, which would make fal's fetch 401.

The prompt in `lib/fal.ts` states **two explicit preserve-lists** — identity from
the selfie, costume and setting from the reference — because the usual failure
mode is trading one for the other.

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run typecheck
node scripts/generate-placeholders.mjs   # fill in any MISSING placeholder art
```

The generator also runs automatically before every build (`prebuild`). It only
ever creates files that are **absent**, so real assets are never overwritten —
which is what lets a fresh clone build without any binaries present.

The camera needs HTTPS or `localhost`. On a tablet, use the deployed URL.

## Kiosk layout

The whole UI scales from one number. `app/globals.css` sets the root font size
from the width of the 9:16 stage, and because Tailwind's spacing and type
scales are rem-based, everything follows:

```css
html:has(.kiosk-stage) {
  font-size: clamp(10px, calc(var(--stage-w) / var(--kiosk-divisor)), 34px);
}
```

- **`--kiosk-divisor` is the knob** — smaller means a bigger UI. At 1080 wide it
  lands a ~25px root, sized for viewing from about a metre.
- On any screen that isn't 9:16 the app **letterboxes** to an exact 9:16 column
  against a dark surround, so a laptop preview shows what the real kiosk looks
  like. On a phone the cap never binds and it fills the screen.
- The scale is scoped to the kiosk page; `/p` keeps a normal 16px phone base.
- `.kiosk-reach-bottom` keeps controls clear of the low band at the base of a
  floor-standing panel — nothing interactive sits flush to the bottom edge.

## Notes for the demo

- Every screen fits without scrolling at 1080×1920.
- The result screen clears itself after 90 seconds.
- Visitor photos are sent once to fal to create the portrait and are not stored
  by this app.
- **The cultural copy in `lib/ethnics.ts` should be reviewed by STB or a cultural
  adviser before the demo.** Names and spellings vary between regions.
