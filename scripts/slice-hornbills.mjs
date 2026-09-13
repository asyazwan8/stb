/**
 * Slices the supplied hornbill artwork sheet into individual transparent PNGs.
 *
 *   1. Drop the sheet at  public/hornbills/sheet.png  (or .jpg/.jpeg/.webp)
 *   2. npm run hornbills
 *
 * It finds each bird by flood-filling the white background away, groups the
 * remaining pixels into connected blobs, then crops and writes each blob as
 * hornbill-1.png … hornbill-N.png ordered top-to-bottom, left-to-right.
 *
 * Flood-filling inward from the border (rather than simply treating every
 * white pixel as background) is what keeps the white tail bands and eyes
 * inside each bird opaque.
 */
import sharp from "sharp";
import { readdir, writeFile } from "node:fs/promises";

const DIR = new URL("../public/hornbills/", import.meta.url);
const WHITE_CUTOFF = 236; // any channel above this counts as background
const MIN_BLOB_PIXELS = 900; // ignore specks and stray anti-aliasing

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

  const isBackgroundish = (i) =>
    data[i + 3] < 16 ||
    (data[i] > WHITE_CUTOFF &&
      data[i + 1] > WHITE_CUTOFF &&
      data[i + 2] > WHITE_CUTOFF);

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

  // Group the remaining foreground into connected blobs (8-way).
  const seen = new Uint8Array(W * H);
  const blobs = [];
  for (let start = 0; start < W * H; start++) {
    if (bg[start] || seen[start]) continue;
    let minX = W, minY = H, maxX = 0, maxY = 0, n = 0;
    const queue = [start];
    seen[start] = 1;
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
          queue.push(q);
        }
      }
    }
    if (n >= MIN_BLOB_PIXELS) blobs.push({ minX, minY, maxX, maxY, n });
  }

  if (!blobs.length) {
    console.error("No shapes found in the sheet — is the background white?");
    process.exit(1);
  }

  // Merge blobs that overlap horizontally and vertically (a bird split into
  // separate colour shapes still belongs to one bird).
  const merged = [];
  for (const b of blobs.sort((p, q) => q.n - p.n)) {
    const host = merged.find(
      (m) =>
        b.minX <= m.maxX + 12 &&
        b.maxX >= m.minX - 12 &&
        b.minY <= m.maxY + 12 &&
        b.maxY >= m.minY - 12,
    );
    if (host) {
      host.minX = Math.min(host.minX, b.minX);
      host.minY = Math.min(host.minY, b.minY);
      host.maxX = Math.max(host.maxX, b.maxX);
      host.maxY = Math.max(host.maxY, b.maxY);
    } else {
      merged.push({ ...b });
    }
  }

  // Reading order: top-to-bottom in rows, then left-to-right.
  const rowHeight = H / 6;
  merged.sort(
    (a, b) =>
      Math.floor(a.minY / rowHeight) - Math.floor(b.minY / rowHeight) ||
      a.minX - b.minX,
  );

  // Background becomes transparent so the birds sit on any colour.
  const out = Buffer.from(data);
  for (let p = 0; p < W * H; p++) if (bg[p]) out[p * C + 3] = 0;
  const cutout = sharp(out, { raw: { width: W, height: H, channels: C } });

  const pad = 4;
  let i = 0;
  for (const b of merged) {
    i += 1;
    const left = Math.max(0, b.minX - pad);
    const top = Math.max(0, b.minY - pad);
    const w = Math.min(W - left, b.maxX - b.minX + 1 + pad * 2);
    const h = Math.min(H - top, b.maxY - b.minY + 1 + pad * 2);
    await cutout
      .clone()
      .extract({ left, top, width: w, height: h })
      .png({ compressionLevel: 9 })
      .toFile(new URL(`hornbill-${i}.png`, DIR).pathname);
    console.log(`  hornbill-${i}.png  ${w}x${h}`);
  }

  await writeFile(
    new URL("README.txt", DIR),
    `Generated by scripts/slice-hornbills.mjs from sheet.*\n\nRe-run "npm run hornbills" after replacing the sheet.\nPoses are numbered top-to-bottom, left-to-right and referenced by\n<Hornbill pose={n} /> in the screens.\n`,
  );
  console.log(`\nSliced ${i} hornbills into public/hornbills/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
