/**
 * Generates stand-in artwork so the app builds and demos end-to-end before the
 * real Sarawak Tourism Board assets are dropped in.
 *
 * Run: node scripts/generate-placeholders.mjs
 *
 * Every file it writes is meant to be REPLACED. See README.md > "Swapping in
 * the real assets".
 */
import sharp from "sharp";
import { access, mkdir, writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";

/**
 * Read the destination list straight out of lib/places.ts.
 *
 * This used to be a hand-mirrored copy, which silently went stale the moment
 * the real destinations landed and left the generator writing art under the
 * old filenames. One source of truth instead — the file is a plain literal,
 * and a mismatch here fails the build loudly rather than quietly.
 */
async function loadPlaces() {
  const src = await readFile(new URL("../lib/places.ts", import.meta.url), "utf8");
  const body = src.slice(src.indexOf("export const PLACES"));
  const field = (block, name) =>
    block.match(new RegExp(`${name}:\\s*"([^"]*)"`))?.[1];

  const places = [...body.matchAll(/\{([^{}]*)\}/g)]
    .map((m) => m[1])
    .map((block) => ({
      id: field(block, "id"),
      name: field(block, "name"),
      image: field(block, "image"),
      from: field(block, "from"),
      to: field(block, "to"),
    }))
    .filter((p) => p.id && p.name && p.image && p.from && p.to);

  if (places.length === 0) {
    throw new Error("Could not parse any places out of lib/places.ts");
  }
  return places;
}

const OUT = new URL("../public/", import.meta.url);
const APP = new URL("../app/", import.meta.url);

/**
 * Never overwrite a real asset. Once STB's actual photography is dropped in,
 * this script must quietly do nothing — it runs on every build (see the
 * "prebuild" script) so that a fresh clone or a file-upload deploy still has
 * artwork to render.
 */
async function missing(relative, base = OUT) {
  try {
    await access(new URL(relative, base));
    return false;
  } catch {
    return true;
  }
}

/**
 * A reference counts as present under any common extension. STB supplied PNGs
 * where the stand-ins were JPEGs; without this the build would happily write a
 * placeholder .jpg alongside the real .png and the app would show the wrong one.
 */
async function missingReference(base) {
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    if (!(await missing(`references/${base}${ext}`))) return false;
  }
  return true;
}

const LETTERS = [
  ["S", "#e4272c"],
  ["A", "#f2a030"],
  ["R", "#1276bc"],
  ["A", "#8cc63f"],
  ["W", "#ea6a25"],
  ["A", "#4b8fc9"],
  ["K", "#009e4f"],
];

/** Browser-tab mark. Kept simple so it still reads at 32px. */
function iconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#ea6a25"/>
  <text x="256" y="368" fill="#ffffff" font-family="DejaVu Serif" font-size="340" font-weight="bold" text-anchor="middle">S</text>
</svg>`;
}

/** Typographic stand-in for the "Gateway to Borneo" masthead lockup. */
function mastheadSvg() {
  const w = 1723;
  const h = 565;
  const size = 300;
  const tracking = 214;
  const startX = w / 2 - ((LETTERS.length - 1) * tracking) / 2;
  const letters = LETTERS.map(
    ([ch, fill], i) =>
      `<text x="${startX + i * tracking}" y="330" fill="${fill}" font-family="Liberation Sans, DejaVu Sans" font-size="${size}" font-weight="bold" text-anchor="middle">${ch}</text>`,
  ).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="none"/>
  ${letters}
  <text x="${w / 2}" y="480" fill="#111111" font-family="DejaVu Serif" font-size="108" letter-spacing="6" text-anchor="middle">GATEWAY TO BORNEO</text>
</svg>`;
}

/** Obvious placeholder for a traditional reference portrait. */
function referenceSvg({ w, h, title, subtitle, filename }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#f6f5f2"/>
  <g fill="#111111" fill-opacity="0.08">
    <ellipse cx="${w / 2}" cy="${h * 0.3}" rx="${w * 0.11}" ry="${h * 0.08}"/>
    <path d="M ${w * 0.5} ${h * 0.375}
             C ${w * 0.3} ${h * 0.43}, ${w * 0.26} ${h * 0.58}, ${w * 0.29} ${h * 0.76}
             L ${w * 0.71} ${h * 0.76}
             C ${w * 0.74} ${h * 0.58}, ${w * 0.7} ${h * 0.43}, ${w * 0.5} ${h * 0.375} Z"/>
  </g>
  <g stroke="#ef9521" stroke-width="4" fill="none" stroke-linecap="round">
    <path d="M ${w * 0.34} ${h * 0.235} L ${w * 0.5} ${h * 0.14} L ${w * 0.66} ${h * 0.235}"/>
    <path d="M ${w * 0.5} ${h * 0.215} L ${w * 0.5} ${h * 0.15}"/>
  </g>
  <rect x="${w * 0.08}" y="${h * 0.81}" width="${w * 0.84}" height="${h * 0.12}" rx="10" fill="none" stroke="#111111" stroke-opacity="0.25" stroke-width="2" stroke-dasharray="10 8"/>
  <text x="${w / 2}" y="${h * 0.858}" fill="#111111" font-family="Liberation Sans, DejaVu Sans" font-size="${Math.round(w * 0.05)}" font-weight="bold" text-anchor="middle">${title}</text>
  <text x="${w / 2}" y="${h * 0.891}" fill="#6b6b6b" font-family="Liberation Sans, DejaVu Sans" font-size="${Math.round(w * 0.031)}" text-anchor="middle">${subtitle}</text>
  <text x="${w / 2}" y="${h * 0.919}" fill="#6b6b6b" font-family="DejaVu Sans Mono" font-size="${Math.round(w * 0.026)}" text-anchor="middle">${filename}</text>
</svg>`;
}

/** Neutral stand-in for destination photography. */
function placeSvg({ w, h, name }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#f6f5f2"/>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="none" stroke="#111111" stroke-opacity="0.12" stroke-width="2"/>
  <line x1="${w * 0.34}" y1="${h * 0.6}" x2="${w * 0.66}" y2="${h * 0.6}" stroke="#ef9521" stroke-width="3" stroke-linecap="round"/>
  <text x="${w * 0.5}" y="${h * 0.5}" fill="#111111" font-family="Liberation Sans, DejaVu Sans" font-size="${Math.round(h * 0.075)}" font-weight="bold" text-anchor="middle">${name}</text>
  <text x="${w * 0.5}" y="${h * 0.72}" fill="#6b6b6b" font-family="DejaVu Sans Mono" font-size="${Math.round(h * 0.042)}" text-anchor="middle">placeholder photo</text>
</svg>`;
}

const svg = (markup) => Buffer.from(markup);

async function main() {
  const PLACES = await loadPlaces();

  await mkdir(new URL("brand/", OUT), { recursive: true });
  await mkdir(new URL("references/", OUT), { recursive: true });
  await mkdir(new URL("places/", OUT), { recursive: true });

  if (await missing("icon.png", APP))
    await sharp(svg(iconSvg()))
      .png({ palette: true, colors: 8, compressionLevel: 9 })
      .toFile(new URL("icon.png", APP).pathname);

  // Flat colour art — a small palette keeps the stand-in tiny.
  if (await missing("brand/stb-masthead.png"))
    await sharp(svg(mastheadSvg()))
    .resize({ width: 1000 })
    .png({ palette: true, colors: 16, compressionLevel: 9, effort: 10 })
    .toFile(new URL("brand/stb-masthead.png", OUT).pathname);

  if (await missingReference("iban-female"))
    await sharp(
    svg(
      referenceSvg({
        w: 843,
        h: 1265,
        title: "PLACEHOLDER",
        subtitle: "Iban — Ngepan Indu (female)",
        filename: "public/references/iban-female.jpeg",
      }),
    ),
  )
    .resize({ width: 562 })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(new URL("references/iban-female.jpg", OUT).pathname);

  if (await missingReference("iban-male"))
    await sharp(
    svg(
      referenceSvg({
        w: 768,
        h: 1280,
        title: "PLACEHOLDER",
        subtitle: "Iban — Ngepan Lelaki (male)",
        filename: "public/references/iban-male.jpeg",
      }),
    ),
  )
    .resize({ width: 512 })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(new URL("references/iban-male.jpg", OUT).pathname);

  for (const place of PLACES) {
    // Keyed off the real path, so a photo whose filename differs from its id
    // still counts as present.
    const file = place.image.replace(/^\/+/, "").replace(/^places\//, "");
    if (!(await missing(`places/${file}`))) continue;
    await sharp(
      svg(placeSvg({ w: 1600, h: 1200, name: place.name })),
    )
      .resize({ width: 800 })
      .jpeg({ quality: 70, mozjpeg: true })
      .toFile(new URL(`places/${file}`, OUT).pathname);
  }

  if (await missing("references/README.txt"))
    await writeFile(
    new URL("references/README.txt", OUT),
    "Replace iban-female.jpg and iban-male.jpg with the real Sarawak Tourism Board\nreference portraits. Keep the filenames identical. Portrait orientation, ideally\n1000-1600px on the long edge, JPEG. After replacing, check the headgear hotspot\nstill lines up: open the learn screen with ?calibrate=1 and tap to read new\ncoordinates, then update lib/ethnics.ts.\n",
  );

  console.log("Placeholder check complete (existing assets left untouched).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
