# Sarawak AI Photobooth

A kiosk demo for the **Sarawak Tourism Board**, built for a **9:16 vertical
kiosk** (1080×1920, large floor-standing panel). A visitor picks a culture,
learns what the traditional dress means, takes a photo, and gets their face
composited into an authentic reference portrait — then scans a QR code to take
it home.

Built as a pitch demo. Three ethnic groups are live — Iban, Bidayuh and Orang
Ulu, each with a female and a male look and every costume detail written up —
and Melanau is deliberately marked **Coming soon**.

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
| `public/references/bidayuh-female.png` | Bidayuh women's dress reference portrait |
| `public/references/bidayuh-male.png` | Bidayuh warrior's dress reference portrait |
| `public/references/orangulu-female.png` | Orang Ulu (Kenyah) dancer reference portrait |
| `public/references/orangulu-male.png` | Orang Ulu (Kenyah) warrior reference portrait |

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

**Any shape works.** They appear on the loading screen as a carousel of matted,
framed prints — each photo centred inside a fixed frame at its own aspect ratio
and **never cropped**, so the differing amount of surrounding mat is the point,
exactly as with real matted prints. The supplied set runs from 3:2 landscape to
square.

`lib/places.ts` is the single source of truth, and the filename does not have to
match the `id` — point `image` at whatever you upload. The placeholder generator
reads that file directly and keys off the image path.

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
| `FAL_PROMPT` | no | Leave unset for the default (`v3`): a new photograph of the visitor wearing the costume, in the reference's pose, scene and light. `v2` is a blended face swap that carries the visitor's skin tone onto the body; `v1` is the original face swap. Switch if a test run looks worse — no code change needed. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | for `/demo-qr` | Set automatically by Vercel's Upstash for Redis integration. See [Phone-controlled mode](#phone-controlled-mode-demo-qr). |

Set `FAL_KEY` in **Vercel → Project → Settings → Environment Variables** (all
environments), then redeploy.

## Phone-controlled mode (`/demo-qr`)

A second entry point where the visitor drives everything from their own phone
and the kiosk never needs a touch, so it also works on a plain display.

1. The kiosk shows a **Scan to start** QR code.
2. **The kiosk asks, the phone answers.** The big screen shows each question —
   the ethnic groups, the two looks, the dress with its hotspots — and the phone
   shows the choices. Every tap is echoed on both screens ("You chose **Iban**",
   "Bidayuh is coming soon"), and picking a costume detail on the phone opens
   its story on the kiosk.
3. The selfie is taken with the phone's camera.
4. The portrait appears on the kiosk with the usual download QR, which opens
   the same `/p` page. The phone's **I'm done** button clears the kiosk straight
   away; otherwise it clears itself after 90 seconds as usual.

The first phone to scan a code owns that session; anyone else who scans it is
told the screen is in use. A phone that goes quiet for four minutes frees the
kiosk, which then shows a fresh code. Reloading the phone resumes where it was.

### Setting it up on Vercel

The phone and kiosk meet through a small shared store, because Vercel
functions don't share memory:

1. **Vercel → Project → Storage → Create Database → Upstash for Redis**, and
   connect it to this project for all environments. For a kiosk that stays on,
   pick the **pay-as-you-go** plan (a monthly budget cap is a good idea) — see
   the note on polling below.
2. Redeploy. The integration sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`;
   a database made on upstash.com directly can use `UPSTASH_REDIS_REST_URL` /
   `UPSTASH_REDIS_REST_TOKEN` instead.

Until the store is connected, `/demo-qr` on Vercel shows a clear "not
connected" message rather than half-working. `/` is unaffected either way.

### Trying it locally

With no store configured, `npm run dev` keeps sessions in memory, so it works
with no setup on one machine. To scan with a real phone, both need the same
network and the camera needs HTTPS: run `npx next dev --experimental-https`
and open the kiosk at your computer's LAN address, not `localhost`.

### Notes

- **The selfie is never stored.** The phone posts it once and the server hands
  it straight to fal, as on the touch kiosk. The session holds only the choices,
  the fal queue id and the finished image URL, and expires after 20 minutes.
- The kiosk polls once a second during a session and every two seconds while
  idle — about 43K Redis reads a day, or roughly 1.3M a month if it never
  switches off. Upstash's free plan (500K commands a month at the time of
  writing) does not bill for more: it **stops**, and `/demo-qr` then shows
  "not connected" until the month resets. That is fine for a demo day or two;
  for a standing install, use pay-as-you-go (a few dollars a month at most) or
  switch the kiosk off overnight.
- No visitor can hold the kiosk for more than 15 minutes, and a phone that goes
  quiet for four frees it sooner.

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

## Design system

White ground, black type, and one accent: the gold sampled from the "A" of the
masthead, **`#EF9521`**.

**Gold is a fill, never text.** Measured against white it is 2.34:1 — far below
readable. As a button fill under black type it is 8.99:1. So buttons are gold
with black labels, and nothing is ever typeset in gold.

Type is a single family (Plus Jakarta Sans): headings are the same sans at
extra-bold with tight tracking, rather than a contrasting display serif.

Decoration comes from the **hornbill** — the bird Sarawak is named for — placed
in the white space of each screen at varying size and pose.

**Wording:** the UI says "ethnic group", never "culture". The two exceptions are
the proper nouns *Borneo Cultures Museum* and *Sarawak Cultural Village*, which
are the real names of real institutions.

## Hornbill artwork

The birds are sliced out of a single supplied artwork sheet:

1. Drop the sheet at `public/hornbill/sheet.png` (`.jpg`/`.jpeg`/`.webp` also work)
2. `npm run hornbills`

That writes `hornbill-1.png … hornbill-N.png`, numbered top-to-bottom then
left-to-right, cut out with transparent backgrounds.

The slicer adapts to the sheet: it keys on **alpha** when the artwork is
transparent, and otherwise **samples the background colour from the border**
rather than assuming white — an earlier version assumed white and returned one
full-sheet blob when handed a black-background sheet. It also masks each crop
to that bird's own pixels, so an overlapping neighbour cannot bleed into the
frame, and white markings *inside* a bird (the tail bands) stay opaque.

Screens reference poses by number, e.g. `<Hornbill pose={5} flip rotate={-6} />`.
If the artwork is absent the component removes itself, so the layout is designed
to read with or without the birds.

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
- **4K portrait TVs work at 100% scaling.** The root size is capped at 64px, so a
  2160-wide panel gets exactly double the 1080 layout. Icons are sized in
  `var(--px)`, a design pixel that grows with the stage the same way. 200% OS
  scaling also works and looks identical.
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
