/**
 * Sarawak ornament, drawn as fine-line SVG.
 *
 * Two sources, both Iban: the *bunga terung* — the aubergine-flower spiral
 * traditionally tattooed on the shoulder — and the hooked, mirrored geometry
 * of *pua kumbu* weaving. Kept to hairlines so they read as structure rather
 * than decoration, and never placed where they compete with photography.
 *
 * Pure SVG: no dependency, no raster assets, scales with the kiosk.
 */

/** The bunga terung spiral, as a single stroked path. */
function Spiral({ className = "" }: { className?: string }) {
  return (
    <path
      className={className}
      d="M50 14
         C 69 14, 84 29, 84 48
         C 84 65, 70 78, 53 78
         C 38 78, 26 66, 26 51
         C 26 38, 36 28, 49 28
         C 60 28, 69 37, 69 48
         C 69 57, 62 64, 53 64
         C 45 64, 39 58, 39 50
         C 39 44, 44 39, 50 39"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  );
}

/**
 * Corner mark for the gallery frame — a hooked pua kumbu bracket with a small
 * spiral eye. Rotated into each of the four corners by the caller.
 */
export function MotifCorner({
  className = "",
  size = 22,
}: {
  className?: string;
  size?: number | string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M2 14 L2 2 L14 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 20 C8 13, 13 8, 20 8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="20" cy="20" r="1.6" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

/**
 * Slim rule under a heading — a mirrored hook pair either side of a spiral eye.
 */
export function MotifDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 16"
      fill="none"
      aria-hidden
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d="M4 8 H88 C96 8, 100 4, 104 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M236 8 H152 C144 8, 140 12, 136 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="120" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M120 1.5 V0.5 M120 15.5 V14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Oversized pale watermark for the idle screen.
 *
 * A horizontally symmetric bunga terung pair joined by a hooked band. Drawn
 * wide and without a vertical spine — an earlier version had one and read as
 * a pole rather than an ornament.
 */
export function MotifWatermark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 180"
      fill="none"
      aria-hidden
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(30 40)">
        <Spiral />
      </g>
      <g transform="translate(330 40) scale(-1 1)">
        <Spiral />
      </g>

      <g
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      >
        {/* Hooked band linking the two spirals. */}
        <path d="M112 88 C136 88, 146 74, 160 74 L200 74 C214 74, 224 88, 248 88" />
        <path d="M112 96 C136 96, 146 110, 160 110 L200 110 C214 110, 224 96, 248 96" />

        {/* Tendrils stepping away from the centre. */}
        <path d="M180 70 C180 54, 168 46, 154 46" />
        <path d="M180 70 C180 54, 192 46, 206 46" />
        <path d="M180 114 C180 130, 168 138, 154 138" />
        <path d="M180 114 C180 130, 192 138, 206 138" />
      </g>

      <circle cx="180" cy="92" r="7" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="180" cy="92" r="2" fill="currentColor" />
    </svg>
  );
}
