"use client";

/* eslint-disable @next/next/no-img-element */
import { PLACES, PLACE_ASPECT, type Place } from "@/lib/places";

/**
 * Destination photography on a portrait kiosk.
 *
 * The photos STB supplies are landscape. Filling a 9:16 panel with them would
 * crop away most of each frame, so instead they sit as a full-width band at
 * their natural aspect — nothing is ever lost, and the band reads as an
 * editorial spread rather than a bad crop.
 *
 * Renders every place stacked and cross-fades between them, so the images are
 * all loaded up front and the transition never flashes.
 */
export function PlaceBand({
  activeIndex,
  rounded = true,
  showCaption = false,
  className = "",
}: {
  activeIndex: number;
  rounded?: boolean;
  /** Names the place over the band — worth it on the attract loop. */
  showCaption?: boolean;
  className?: string;
}) {
  const active = PLACES[activeIndex] ?? PLACES[0];
  return (
    <div
      className={`relative w-full overflow-hidden ${rounded ? "rounded-3xl" : ""} ${className}`}
      style={{ aspectRatio: `${PLACE_ASPECT.w} / ${PLACE_ASPECT.h}` }}
    >
      {PLACES.map((place, i) => (
        <BandLayer key={place.id} place={place} active={i === activeIndex} />
      ))}

      {/* Slight inner shade so white type placed over the band stays legible
          regardless of what the photograph happens to contain. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,15,11,0.28) 0%, rgba(20,15,11,0) 45%, rgba(20,15,11,0.35) 100%)",
        }}
      />

      {showCaption ? (
        <p
          key={active.id}
          className="animate-fade absolute bottom-4 left-5 right-5 text-sm font-bold uppercase tracking-[0.16em] text-white/90 drop-shadow"
        >
          {active.name}
        </p>
      ) : null}
    </div>
  );
}

function BandLayer({ place, active }: { place: Place; active: boolean }) {
  return (
    <div
      aria-hidden={!active}
      className="absolute inset-0 transition-opacity duration-1000 ease-out"
      style={{
        opacity: active ? 1 : 0,
        // Doubles as the fallback wash before real photography is dropped in.
        background: `linear-gradient(150deg, ${place.to}, ${place.from})`,
      }}
    >
      <img
        src={place.image}
        alt=""
        className={`h-full w-full object-cover ${active ? "animate-ken-burns" : ""}`}
      />
    </div>
  );
}
