"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Ribbon } from "@/components/Masthead";
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
  const failed = state.phase === "error";

  if (failed) {
    return (
      <div className="flex h-full flex-col bg-cream">
        <Ribbon />
        <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <h1 className="font-display text-4xl font-bold text-ink">
            That didn&rsquo;t work
          </h1>
          <p className="mt-3 max-w-md text-[17px] leading-relaxed text-bark">
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
    <div className="relative flex h-full flex-col overflow-hidden bg-bark">
      {/* Destination promotion — the wait is the pitch. */}
      {PLACES.map((p, i) => (
        <div
          key={p.id}
          aria-hidden={i !== placeIndex}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: i === placeIndex ? 1 : 0,
            background: `linear-gradient(160deg, ${p.to}, ${p.from})`,
          }}
        >
          <img
            src={p.image}
            alt=""
            className={`h-full w-full object-cover ${i === placeIndex ? "animate-ken-burns" : ""}`}
          />
        </div>
      ))}

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,15,11,0.45) 0%, rgba(20,15,11,0.15) 35%, rgba(20,15,11,0.85) 100%)",
        }}
      />

      <div className="relative flex flex-1 flex-col justify-between px-7 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(1.75rem,env(safe-area-inset-top))]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">
            While you wait — visit
          </p>
          <h2
            key={place.id}
            className="animate-fade-up mt-2 font-display text-[clamp(2.2rem,8vw,3.4rem)] font-bold leading-tight text-white"
          >
            {place.name}
          </h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-white/60">
            {place.region}
          </p>
          <p
            key={`${place.id}-hook`}
            className="animate-fade mt-3 max-w-md text-[17px] leading-relaxed text-white/90"
          >
            {place.hook}
          </p>
        </div>

        <div className="rounded-3xl bg-ink/55 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <p
              key={statusIndex}
              className="animate-fade text-lg font-semibold text-white"
              role="status"
            >
              {STATUS_COPY[statusIndex]}
            </p>
            <span className="font-display text-lg font-bold tabular-nums text-white/80">
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
            <p className="text-xs text-white/60">
              Creating your portrait — this takes under a minute.
            </p>
            <button
              type="button"
              onClick={onCancel}
              className="shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-white/60 underline underline-offset-4"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
