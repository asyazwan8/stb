"use client";

import type { Hotspot as HotspotData } from "@/lib/ethnics";

/**
 * Tap target over a piece of the costume.
 *
 * Deliberately restrained: the reference photography is the thing worth
 * looking at, so the marker is small, mostly transparent and carries no label.
 * The name and description belong in the sheet that opens on tap, not burned
 * over the picture.
 */
export function Hotspot({
  hotspot,
  active,
  onTap,
}: {
  hotspot: HotspotData;
  active: boolean;
  onTap: (hotspot: HotspotData) => void;
}) {
  const live = hotspot.status === "live";

  return (
    <button
      type="button"
      onClick={() => onTap(hotspot)}
      // The accessible name carries what the visible label used to.
      aria-label={
        live ? `${hotspot.label}: ${hotspot.name}` : `${hotspot.name} — coming soon`
      }
      className="absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center touch-manipulation"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
    >
      {/* A translucent white ring alone vanishes over a bright area of the
          photograph — the male headdress, for instance. Pairing it with a soft
          dark halo and a solid centre dot keeps the marker legible on any
          background while staying small and unobtrusive. */}
      <span
        className={`flex items-center justify-center rounded-full border transition duration-200 ${
          live
            ? `h-9 w-9 border-white/85 ${
                active
                  ? "scale-110 bg-white/30"
                  : "bg-white/10 animate-hotspot"
              }`
            : "h-7 w-7 border-white/50 bg-white/[0.06]"
        }`}
        style={{
          boxShadow: live
            ? "0 0 0 1px rgba(0,0,0,0.22), 0 1px 5px rgba(0,0,0,0.32)"
            : "0 0 0 1px rgba(0,0,0,0.16)",
        }}
      >
        <span
          className={`rounded-full transition ${
            live ? `h-2 w-2 ${active ? "bg-gold" : "bg-white"}` : "h-1.5 w-1.5 bg-white/70"
          }`}
          style={{ boxShadow: "0 0 3px rgba(0,0,0,0.5)" }}
        />
      </span>
    </button>
  );
}
