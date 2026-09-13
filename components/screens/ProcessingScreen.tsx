"use client";

import { useEffect, useState } from "react";
import { Masthead, Ribbon } from "@/components/Masthead";
import { PlaceBand } from "@/components/PlaceBand";
import { PLACES } from "@/lib/places";
import type { SwapState } from "@/lib/useFaceSwap";

const STATUS_COPY = [
  "Weaving your pua kumbu…",
  "Polishing the silver…",
  "Lighting the longhouse…",
  "Setting the feathers straight…",
];

const PLACE_MS = 6500;
const STATUS_MS = 3200;

export function ProcessingScreen({
  state,
  onCancel,
  onRetry,
}: {
  state: SwapState;
  onCancel: () => void;
  onRetry: () => void;
}) {
  const [placeIndex, setPlaceIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setPlaceIndex((i) => (i + 1) % PLACES.length),
      PLACE_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(
      () => setStatusIndex((i) => (i + 1) % STATUS_COPY.length),
      STATUS_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  const place = PLACES[placeIndex];

  if (state.phase === "error") {
    return (
      <div className="flex h-full flex-col bg-cream">
        <Ribbon />
        <main className="kiosk-reach-bottom flex flex-1 flex-col items-center justify-center px-8 text-center">
          <h1 className="font-display text-4xl font-bold text-ink">
            That didn&rsquo;t work
          </h1>
          <p className="mt-3 max-w-md text-[1.0625rem] leading-relaxed text-bark">
            {state.error}
          </p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="h-16 rounded-2xl bg-stb-hornbill text-lg font-bold text-white shadow-lg shadow-stb-hornbill/25 transition active:scale-[0.97]"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="h-16 rounded-2xl border-2 border-bark/15 text-lg font-semibold text-bark transition active:scale-[0.97]"
            >
              Start over
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-cream">
      <Masthead compact />

      <main className="kiosk-reach-bottom flex min-h-0 flex-1 flex-col px-6">
        <div className="flex-[0.45]" />

        {/* Destination promotion — the wait is the pitch. Landscape photography
            sits at its own aspect rather than being cropped to the panel. */}
        <div className="shrink-0">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-stb-hornbill">
            While you wait — visit
          </p>

          <PlaceBand activeIndex={placeIndex} className="mt-3 shadow-xl" />

          <h2
            key={place.id}
            className="animate-fade-up mt-5 font-display text-4xl font-bold leading-tight text-ink"
          >
            {place.name}
          </h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-muted">
            {place.region}
          </p>
          <p
            key={`${place.id}-hook`}
            className="animate-fade mt-3 max-w-md text-[1.0625rem] leading-relaxed text-bark"
          >
            {place.hook}
          </p>
        </div>

        <div className="flex-1" />

        <div className="shrink-0 rounded-3xl bg-ink p-6 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <p
              key={statusIndex}
              className="animate-fade text-lg font-semibold text-cream"
              role="status"
            >
              {STATUS_COPY[statusIndex]}
            </p>
            <span className="font-display text-lg font-bold tabular-nums text-cream/80">
              {Math.round(state.progress)}%
            </span>
          </div>

          <div className="relative mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-stb-amber transition-[width] duration-300 ease-out"
              style={{ width: `${state.progress}%` }}
            />
            <div
              aria-hidden
              className="animate-shimmer absolute inset-y-0 w-1/3"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
              }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-xs text-cream/60">
              Creating your portrait — this takes under a minute.
            </p>
            <button
              type="button"
              onClick={onCancel}
              className="shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-cream/60 underline underline-offset-4"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
