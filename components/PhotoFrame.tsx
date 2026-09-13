"use client";

/* eslint-disable @next/next/no-img-element */
import { FRAME_WINDOW } from "@/lib/places";

/**
 * A matted, framed print.
 *
 * The supplied destination photography is not one shape — it runs from 3:2
 * landscape to square. Rather than cropping everything to a common ratio, the
 * frame keeps a fixed outer window and centres each photo inside it at its own
 * aspect. The differing amount of surrounding mat is exactly what happens when
 * you mat prints of different sizes, so it reads as intentional.
 *
 * The hairline keyline hugs the photograph itself, not the mat, which is how
 * real matting works and what keeps uneven margins looking deliberate.
 */
export function PhotoFrame({
  src,
  alt = "",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative bg-white p-[5%] shadow-[0_1.2rem_2.5rem_-1rem_rgba(0,0,0,0.28)] ring-1 ring-line ${className}`}
      style={{ aspectRatio: `${FRAME_WINDOW.w} / ${FRAME_WINDOW.h}` }}
    >
      <div className="flex h-full w-full items-center justify-center">
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain outline outline-1 outline-ink/25"
        />
      </div>

    </div>
  );
}
