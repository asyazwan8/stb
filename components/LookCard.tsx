"use client";

/* eslint-disable @next/next/no-img-element */
import type { Ethnic, Look } from "@/lib/ethnics";

/** A reference portrait to pick, shared by the kiosk and the phone. */
export function LookCard({
  ethnic,
  look,
  selected,
  onSelect,
}: {
  ethnic: Ethnic;
  look: Look;
  selected: boolean;
  onSelect: (look: Look) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(look)}
      aria-pressed={selected}
      className={`group overflow-hidden rounded-3xl border-2 text-left transition duration-200 active:scale-[0.98] ${
        selected ? "border-gold shadow-xl shadow-black/10" : "border-line shadow-sm"
      }`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
        <img
          src={look.image}
          alt={`${ethnic.name} ${look.label.toLowerCase()} traditional dress`}
          className="h-full w-full object-cover"
        />
        {selected ? (
          <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-gold text-ink shadow-lg">
            <svg width="16" height="16" className="size-[calc(16*var(--px))]" viewBox="0 0 24 24" fill="none" aria-hidden>
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

      <div className="bg-white px-4 py-3.5">
        <p className="font-display tracking-tight text-xl font-bold text-ink">
          {look.label}
        </p>
        <p className="mt-0.5 text-sm italic text-muted">{look.name}</p>
      </div>
    </button>
  );
}
