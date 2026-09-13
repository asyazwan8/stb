"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

/**
 * Decorative rhinoceros hornbill — the bird Sarawak is named for.
 *
 * Poses are sliced out of the supplied artwork sheet into
 * /public/hornbills/hornbill-1.png … -9.png (see scripts/slice-hornbills.mjs).
 * Purely ornamental, so it is hidden from assistive tech, and it removes
 * itself if the artwork is not present rather than leaving a broken image —
 * the layout is designed to read with or without the birds.
 */
export function Hornbill({
  pose,
  className = "",
  flip = false,
  rotate = 0,
}: {
  /** 1–9, keyed to the sliced artwork. */
  pose: number;
  className?: string;
  flip?: boolean;
  /** Degrees. A touch of tilt keeps them feeling placed, not pasted. */
  rotate?: number;
}) {
  const [missing, setMissing] = useState(false);
  if (missing) return null;

  return (
    <img
      src={`/hornbills/hornbill-${pose}.png`}
      alt=""
      aria-hidden
      onError={() => setMissing(true)}
      className={`pointer-events-none select-none ${className}`}
      style={{
        transform: `${flip ? "scaleX(-1) " : ""}rotate(${flip ? -rotate : rotate}deg)`,
      }}
    />
  );
}
