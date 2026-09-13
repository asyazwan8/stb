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
import { PLACES } from "./places.data.mjs";

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
function referenceSvg({ w, h, title, subtitle, filename, accent }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a2a1c"/>
      <stop offset="55%" stop-color="#241a12"/>
      <stop offset="100%" stop-color="#160f0a"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="26%" r="55%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="planks" width="${w}" height="46" patternUnits="userSpaceOnUse">
      <rect width="${w}" height="46" fill="none"/>
      <line x1="0" y1="45" x2="${w}" y2="45" stroke="#000" stroke-opacity="0.25" stroke-width="2"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <rect y="${h * 0.72}" width="${w}" height="${h * 0.28}" fill="url(#planks)"/>

  <!-- figure silhouette -->
  <g fill="#000" fill-opacity="0.42">
    <ellipse cx="${w / 2}" cy="${h * 0.27}" rx="${w * 0.1}" ry="${h * 0.075}"/>
    <path d="M ${w * 0.5} ${h * 0.345}
             C ${w * 0.3} ${h * 0.4}, ${w * 0.26} ${h * 0.56}, ${w * 0.29} ${h * 0.74}
             L ${w * 0.71} ${h * 0.74}
             C ${w * 0.74} ${h * 0.56}, ${w * 0.7} ${h * 0.4}, ${w * 0.5} ${h * 0.345} Z"/>
  </g>
  <!-- headgear hint -->
  <g stroke="${accent}" stroke-opacity="0.6" stroke-width="5" fill="none">
    <path d="M ${w * 0.34} ${h * 0.21} L ${w * 0.5} ${h * 0.115} L ${w * 0.66} ${h * 0.21}"/>
    <path d="M ${w * 0.38} ${h * 0.2} L ${w * 0.42} ${h * 0.14}"/>
    <path d="M ${w * 0.5} ${h * 0.19} L ${w * 0.5} ${h * 0.125}"/>
    <path d="M ${w * 0.62} ${h * 0.2} L ${w * 0.58} ${h * 0.14}"/>
  </g>

  <rect x="${w * 0.08}" y="${h * 0.8}" width="${w * 0.84}" height="${h * 0.13}" rx="18" fill="#000" fill-opacity="0.55" stroke="${accent}" stroke-opacity="0.5" stroke-width="3" stroke-dasharray="12 10"/>
  <text x="${w / 2}" y="${h * 0.852}" fill="#ffffff" font-family="Liberation Sans, DejaVu Sans" font-size="${Math.round(w * 0.052)}" font-weight="bold" text-anchor="middle">${title}</text>
  <text x="${w / 2}" y="${h * 0.888}" fill="#e8d9c4" font-family="Liberation Sans, DejaVu Sans" font-size="${Math.round(w * 0.033)}" text-anchor="middle">${subtitle}</text>
  <text x="${w / 2}" y="${h * 0.918}" fill="${accent}" font-family="DejaVu Sans Mono" font-size="${Math.round(w * 0.029)}" text-anchor="middle">${filename}</text>
</svg>`;
}

/** Abstract layered-ridge wash standing in for destination photography. */
function placeSvg({ w, h, from, to, name }) {
  const ridge = (yBase, opacity, amp) => {
    const pts = [];
    for (let i = 0; i <= 10; i += 1) {
      const x = (w / 10) * i;
      const y = yBase + Math.sin(i * 0.9 + amp) * amp * 26;
      pts.push(`${x.toFixed(0)},${y.toFixed(0)}`);
    }
    return `<polygon points="0,${h} ${pts.join(" ")} ${w},${h}" fill="#000" fill-opacity="${opacity}"/>`;
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${to}"/>
      <stop offset="100%" stop-color="${from}"/>
    </linearGradient>
    <radialGradient id="sun" cx="70%" cy="24%" r="34%">
      <stop offset="0%" stop-color="#ffe9c2" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#ffe9c2" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <rect width="${w}" height="${h}" fill="url(#sun)"/>
  <circle cx="${w * 0.7}" cy="${h * 0.26}" r="${h * 0.055}" fill="#fff3dc" fill-opacity="0.8"/>
  ${ridge(h * 0.58, 0.16, 1.2)}
  ${ridge(h * 0.68, 0.26, 2.1)}
  ${ridge(h * 0.79, 0.4, 0.6)}
  <rect y="${h * 0.86}" width="${w}" height="${h * 0.14}" fill="#000" fill-opacity="0.55"/>
  <text x="${w * 0.5}" y="${h * 0.94}" fill="#ffffff" font-family="DejaVu Sans Mono" font-size="${Math.round(h * 0.032)}" text-anchor="middle" opacity="0.75">placeholder — replace with a photo of ${name}</text>
</svg>`;
}

const svg = (markup) => Buffer.from(markup);

async function main() {
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

  if (await missing("references/iban-female.jpg"))
    await sharp(
    svg(
      referenceSvg({
        w: 843,
        h: 1265,
        title: "PLACEHOLDER",
        subtitle: "Iban — Ngepan Indu (female)",
        filename: "public/references/iban-female.jpg",
        accent: "#f2a030",
      }),
    ),
  )
    .resize({ width: 562 })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(new URL("references/iban-female.jpg", OUT).pathname);

  if (await missing("references/iban-male.jpg"))
    await sharp(
    svg(
      referenceSvg({
        w: 768,
        h: 1280,
        title: "PLACEHOLDER",
        subtitle: "Iban — Ngepan Lelaki (male)",
        filename: "public/references/iban-male.jpg",
        accent: "#ea6a25",
      }),
    ),
  )
    .resize({ width: 512 })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(new URL("references/iban-male.jpg", OUT).pathname);

  for (const place of PLACES) {
    if (!(await missing(`places/${place.id}.jpg`))) continue;
    await sharp(
      svg(placeSvg({ w: 1080, h: 1440, from: place.from, to: place.to, name: place.name })),
    )
      .resize({ width: 480 })
      .jpeg({ quality: 68, mozjpeg: true })
      .toFile(new URL(`places/${place.id}.jpg`, OUT).pathname);
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
