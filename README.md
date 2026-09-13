# Sarawak AI Photobooth

A kiosk demo for the **Sarawak Tourism Board**. A visitor picks a culture, learns
what the traditional dress means, takes a photo, and gets their face composited
into an authentic reference portrait — then scans a QR code to take it home.

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
| `public/references/iban-female.jpg` | The Iban *Ngepan Indu* reference portrait (portrait orientation) |
| `public/references/iban-male.jpg` | The Iban *Ngepan Lelaki* reference portrait (portrait orientation) |

Optionally drop real destination photography into `public/places/` as
`mulu.jpg`, `bako.jpg`, `kuching.jpg`, `santubong.jpg` — these fill the loading
screen and need no code change.

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
node scripts/generate-placeholders.mjs   # regenerate placeholder artwork
```

The camera needs HTTPS or `localhost`. On a tablet, use the deployed URL.

## Notes for the demo

- Designed for a **tablet in portrait**. Every screen fits without scrolling.
- The result screen clears itself after 90 seconds.
- Visitor photos are sent once to fal to create the portrait and are not stored
  by this app.
- **The cultural copy in `lib/ethnics.ts` should be reviewed by STB or a cultural
  adviser before the demo.** Names and spellings vary between regions.
