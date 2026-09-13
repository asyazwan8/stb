/**
 * Slices the supplied hornbill artwork sheet into individual transparent PNGs.
 *
 *   1. Drop the sheet at  public/hornbill/sheet.png  (or .jpg/.jpeg/.webp)
 *   2. npm run hornbills
 *
 * It separates birds from background, groups the remaining pixels into
 * connected blobs, then crops each as hornbill-1.png … hornbill-N.png,
 * ordered top-to-bottom then left-to-right.
 *
 * Background detection adapts to the sheet:
 *   - transparent sheet -> keyed on alpha alone
 *   - opaque sheet      -> the background COLOUR is sampled from the border
 *                          rather than assumed
 *
 * Both matter. An earlier version assumed a white background and produced a
 * single full-sheet blob when handed a black-background sheet; it also treated
 * every near-white pixel as background, which would have eaten the white tail
 * feathers. Sampling the border, and preferring alpha when present, fixes both.
 *
 * The fill runs inward from the border, so enclosed markings inside a bird
 * stay opaque regardless of their colour.
 */
import sharp from "sharp";
import { readdir, writeFile } from "node:fs/promises";

const DIR = new URL("../public/hornbill/", import.meta.url);
const COLOUR_TOLERANCE = 26; // per-channel distance from the sampled background
const MIN_BLOB_PIXELS = 900; // ignore specks and stray anti-aliasing
/** A detached piece this-much enclosed by a bird's box belongs to that bird. */
const CONTAINMENT = 0.55;

async function findSheet() {
  const names = await readdir(DIR);
  const hit = names.find((n) => /^sheet\.(png|jpe?g|webp)$/i.test(n));
  if (!hit) {
    console.log(
      "No hornbill sheet found. Drop the artwork at public/hornbills/sheet.png and re-run.",
    );
    process.exit(0);
  }
  return new URL(hit, DIR).pathname;
}

async function main() {
  const sheet = await findSheet();
  const { data, info } = await sharp(sheet)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  // Prefer alpha when the sheet actually carries transparency; otherwise sample
  // the background colour from the border instead of assuming it is white.
  let transparentPixels = 0;
  for (let p = 0; p < W * H; p++) if (data[p * C + 3] < 16) transparentPixels++;
  const useAlpha = transparentPixels > W * H * 0.15;

  let isBackgroundish;
  if (useAlpha) {
    isBackgroundish = (i) => data[i + 3] < 16;
    console.log("Background: transparency");
  } else {
    const samples = [[], [], []];
    const note = (x, y) => {
      const i = (y * W + x) * C;
      for (let c = 0; c < 3; c++) samples[c].push(data[i + c]);
    };
    for (let x = 0; x < W; x += 3) note(x, 0), note(x, H - 1);
    for (let y = 0; y < H; y += 3) note(0, y), note(W - 1, y);
    const bgColour = samples.map((v) => v.sort((a, b) => a - b)[v.length >> 1]);
    isBackgroundish = (i) =>
      data[i + 3] < 16 ||
      (Math.abs(data[i] - bgColour[0]) <= COLOUR_TOLERANCE &&
        Math.abs(data[i + 1] - bgColour[1]) <= COLOUR_TOLERANCE &&
        Math.abs(data[i + 2] - bgColour[2]) <= COLOUR_TOLERANCE);
    console.log(`Background: colour rgb(${bgColour.join(",")})`);
  }

  // Flood fill the outer background so enclosed white stays part of the bird.
  const bg = new Uint8Array(W * H);
  const stack = [];
  for (let x = 0; x < W; x++) {
    stack.push(x, x + (H - 1) * W);
  }
  for (let y = 0; y < H; y++) {
    stack.push(y * W, W - 1 + y * W);
  }
  while (stack.length) {
    const p = stack.pop();
    if (bg[p]) continue;
    if (!isBackgroundish(p * C)) continue;
    bg[p] = 1;
    const x = p % W;
    const y = (p / W) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < W - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - W);
    if (y < H - 1) stack.push(p + W);
  }

  // Group the remaining foreground into connected blobs (8-way), recording
  // which blob owns each pixel. The labels are what let a crop be masked down
  // to its own bird — without them a rectangular crop also carries slices of
  // whichever neighbours overlap its bounding box.
  const seen = new Uint8Array(W * H);
  const labels = new Int32Array(W * H).fill(-1);
  const blobs = [];
  for (let start = 0; start < W * H; start++) {
    if (bg[start] || seen[start]) continue;
    const id = blobs.length;
    let minX = W, minY = H, maxX = 0, maxY = 0, n = 0;
    const queue = [start];
    seen[start] = 1;
    labels[start] = id;
    while (queue.length) {
      const p = queue.pop();
      const x = p % W;
      const y = (p / W) | 0;
      n++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const q = nx + ny * W;
          if (seen[q] || bg[q]) continue;
          seen[q] = 1;
          labels[q] = id;
          queue.push(q);
        }
      }
    }
    blobs.push({ id, minX, minY, maxX, maxY, n });
  }

  const keep = blobs.filter((b) => b.n >= MIN_BLOB_PIXELS);
  if (!keep.length) {
    console.error("No shapes found in the sheet.");
    process.exit(1);
  }

  // Reunite pieces of one bird that the fill split apart — a tail tip cut off
  // by a band of background-coloured feather, say.
  //
  // Merging on mere PROXIMITY joined neighbouring birds, because these poses
  // have wide wings whose bounding boxes overlap even when the birds do not
  // touch. So a piece is only absorbed when it is largely INSIDE a bigger
  // bird's box, which reunites split parts without swallowing neighbours.
  const overlap = (a, m) => {
    const w = Math.min(a.maxX, m.maxX) - Math.max(a.minX, m.minX) + 1;
    const h = Math.min(a.maxY, m.maxY) - Math.max(a.minY, m.minY) + 1;
    if (w <= 0 || h <= 0) return 0;
    return (w * h) / ((a.maxX - a.minX + 1) * (a.maxY - a.minY + 1));
  };
  const merged = [];
  for (const b of keep.sort((p, q) => q.n - p.n)) {
    const host = merged.find((m) => m.n > b.n && overlap(b, m) >= CONTAINMENT);
    if (host) {
      host.minX = Math.min(host.minX, b.minX);
      host.minY = Math.min(host.minY, b.minY);
      host.maxX = Math.max(host.maxX, b.maxX);
      host.maxY = Math.max(host.maxY, b.maxY);
      host.n += b.n;
      host.members.add(b.id);
    } else {
      merged.push({ ...b, members: new Set([b.id]) });
    }
  }

  // Reading order: top-to-bottom in rows, then left-to-right.
  const rowHeight = H / 6;
  merged.sort(
    (a, b) =>
      Math.floor(a.minY / rowHeight) - Math.floor(b.minY / rowHeight) ||
      a.minX - b.minX,
  );

  const pad = 4;
  let i = 0;
  for (const b of merged) {
    i += 1;
    const left = Math.max(0, b.minX - pad);
    const top = Math.max(0, b.minY - pad);
    const w = Math.min(W - left, b.maxX - b.minX + 1 + pad * 2);
    const h = Math.min(H - top, b.maxY - b.minY + 1 + pad * 2);

    // Copy just this bird's pixels; everything else in the box is cleared,
    // so an overlapping neighbour cannot bleed into the crop.
    const crop = Buffer.alloc(w * h * C);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const src = ((top + y) * W + (left + x)) * C;
        const dst = (y * w + x) * C;
        if (b.members.has(labels[(top + y) * W + (left + x)])) {
          crop[dst] = data[src];
          crop[dst + 1] = data[src + 1];
          crop[dst + 2] = data[src + 2];
          crop[dst + 3] = data[src + 3];
        }
      }
    }

    await sharp(crop, { raw: { width: w, height: h, channels: C } })
      .png({ compressionLevel: 9 })
      .toFile(new URL(`hornbill-${i}.png`, DIR).pathname);
    console.log(`  hornbill-${i}.png  ${w}x${h}`);
  }

  await writeFile(
    new URL("README.txt", DIR),
    `Generated by scripts/slice-hornbills.mjs from sheet.*\n\nRe-run "npm run hornbills" after replacing the sheet.\nPoses are numbered top-to-bottom, left-to-right and referenced by\n<Hornbill pose={n} /> in the screens.\n`,
  );
  console.log(`\nSliced ${i} hornbills into public/hornbill/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
