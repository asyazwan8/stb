"use client";

import type { Ethnic } from "@/lib/ethnics";
import { ComingSoonBadge } from "./ComingSoonBadge";

export function EthnicCard({
  ethnic,
  selected,
  onSelect,
}: {
  ethnic: Ethnic;
  selected: boolean;
  onSelect: (ethnic: Ethnic) => void;
}) {
  const live = ethnic.status === "live";

  return (
    <button
      type="button"
      onClick={() => onSelect(ethnic)}
      aria-pressed={live ? selected : undefined}
      className={`group relative flex min-h-44 flex-col justify-between overflow-hidden rounded-3xl border-2 p-5 text-left transition duration-200 active:scale-[0.98] ${
        selected
          ? "border-stb-hornbill bg-white shadow-xl shadow-stb-hornbill/15"
          : live
            ? "border-bark/10 bg-white shadow-sm hover:border-bark/25"
            : "border-bark/10 bg-sand/60"
      }`}
    >
      {/* Accent wash keyed to the masthead palette. */}
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-1.5 transition-opacity ${live ? "opacity-100" : "opacity-30"}`}
        style={{ background: ethnic.accent }}
      />

      <div className={live ? "" : "opacity-45"}>
        <h3 className="font-display text-3xl font-bold tracking-wide text-ink">
          {ethnic.name}
        </h3>
        <p className="mt-1.5 text-sm leading-snug text-muted">{ethnic.tagline}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {live ? (
          <span
            className={`text-sm font-bold uppercase tracking-[0.14em] transition-colors ${
              selected ? "text-stb-hornbill" : "text-bark/50"
            }`}
          >
            {selected ? "Selected" : "Try this look"}
          </span>
        ) : (
          <ComingSoonBadge />
        )}

        {live ? (
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
              selected ? "bg-stb-hornbill text-white" : "bg-sand text-bark/40"
            }`}
            aria-hidden
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12l5 5L19 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ) : null}
      </div>
    </button>
  );
}
