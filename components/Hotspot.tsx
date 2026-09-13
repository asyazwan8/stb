"use client";

import type { Hotspot as HotspotData } from "@/lib/ethnics";

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
      aria-label={
        live
          ? `${hotspot.label}: ${hotspot.name}`
          : `${hotspot.name} — coming soon`
      }
      className="absolute -translate-x-1/2 -translate-y-1/2 touch-manipulation"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
    >
      <span className="relative flex flex-col items-center gap-2">
        <span
          className={`flex h-16 w-16 items-center justify-center rounded-full border-2 backdrop-blur-[2px] transition duration-200 ${
            live
              ? `border-white/85 bg-white/25 ${active ? "scale-110 bg-white/45" : ""} animate-hotspot`
              : "border-white/35 bg-black/25"
          }`}
        >
          {live ? (
            <span
              className={`h-3.5 w-3.5 rounded-full transition ${
                active ? "bg-stb-hornbill" : "bg-white"
              }`}
            />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect
                x="4"
                y="10"
                width="16"
                height="11"
                rx="2"
                stroke="white"
                strokeOpacity="0.7"
                strokeWidth="2.5"
              />
              <path
                d="M8 10V7a4 4 0 018 0v3"
                stroke="white"
                strokeOpacity="0.7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>

        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.1em] ${
            live
              ? "bg-white/90 text-ink shadow-sm"
              : "bg-black/45 text-white/70"
          }`}
        >
          {hotspot.label}
        </span>
      </span>
    </button>
  );
}
