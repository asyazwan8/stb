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
      className={`group relative flex min-h-44 flex-col justify-between overflow-hidden rounded-2xl border p-5 text-left transition duration-200 active:scale-[0.98] ${
        selected
          ? "border-gold bg-white shadow-lg shadow-black/10"
          : live
            ? "border-line bg-white"
            : "border-line bg-surface"
      }`}
    >
      <div className={live ? "" : "opacity-45"}>
        <h3 className="font-display tracking-tight text-3xl font-extrabold tracking-wide text-ink">
          {ethnic.name}
        </h3>
        <p className="mt-1.5 text-sm leading-snug text-muted">{ethnic.tagline}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {live ? (
          <span
            className={`text-sm font-bold uppercase tracking-[0.14em] transition-colors ${
              selected ? "text-ink" : "text-muted"
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
              selected ? "bg-gold text-ink" : "bg-surface text-muted"
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
