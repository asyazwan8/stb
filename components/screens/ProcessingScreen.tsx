"use client";

import { useEffect, useState } from "react";
import { Masthead } from "@/components/Masthead";
import { PhotoFrame } from "@/components/PhotoFrame";
import { MotifDivider } from "@/components/Motif";
import { PLACES } from "@/lib/places";
import type { SwapState } from "@/lib/useFaceSwap";

const STATUS_COPY = [
  "Weaving your pua kumbu…",
  "Polishing the silver…",
  "Lighting the longhouse…",
  "Setting the feathers straight…",
];

const PLACE_MS = 5500;
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
  const [index, setIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % PLACES.length),
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

  const place = PLACES[index];

  if (state.phase === "error") {
    return (
      <div className="flex h-full flex-col bg-white">
        <Masthead compact />
        <main className="kiosk-reach-bottom flex flex-1 flex-col items-center justify-center px-8 text-center">
          <h1 className="font-display tracking-tight text-4xl font-extrabold text-ink">
            That didn&rsquo;t work
          </h1>
          <p className="mt-3 max-w-md text-[1.0625rem] leading-relaxed text-muted">
            {state.error}
          </p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="h-16 rounded-full bg-gold text-lg font-bold text-ink transition active:scale-[0.97] active:bg-gold-deep"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="h-16 rounded-full border border-ink/20 text-lg font-semibold text-ink transition active:scale-[0.97] active:bg-surface"
            >
              Start over
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <Masthead compact />

      <main className="kiosk-reach-bottom flex min-h-0 flex-1 flex-col px-8">
        <div className="flex-[0.85]" />

        {/* Carousel of framed prints. Every photo is rendered and cross-faded,
            so the images are loaded up front and transitions never flash. */}
        <div className="shrink-0">
          <p className="text-center text-xs font-bold uppercase tracking-[0.24em] text-muted">
            While you wait — visit
          </p>

          <div
            className="relative mt-5"
            style={{ aspectRatio: "4 / 3" }}
            aria-live="polite"
          >
            {PLACES.map((p, i) => (
              <div
                key={p.id}
                aria-hidden={i !== index}
                className="absolute inset-0 transition-opacity duration-700 ease-out"
                style={{ opacity: i === index ? 1 : 0 }}
              >
                <PhotoFrame src={p.image} className="h-full w-full" />
              </div>
            ))}
          </div>

          {/* Carousel position. */}
          <div className="mt-5 flex items-center justify-center gap-2">
            {PLACES.map((p, i) => (
              <span
                key={p.id}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index ? "w-7 bg-gold" : "w-1.5 bg-ink/20"
                }`}
              />
            ))}
            <span className="sr-only">
              {index + 1} of {PLACES.length}
            </span>
          </div>

          <h2
            key={place.id}
            className="animate-fade-up mt-5 text-center font-display tracking-tight text-4xl font-extrabold leading-tight text-ink"
          >
            {place.name}
          </h2>
          <p className="mt-1.5 text-center text-sm font-semibold uppercase tracking-[0.14em] text-muted">
            {place.region}
          </p>

          <MotifDivider className="mx-auto mt-4 h-3.5 w-44 text-ink/25" />

          <p
            key={`${place.id}-hook`}
            className="animate-fade mx-auto mt-4 max-w-md text-center text-[1.0625rem] leading-relaxed text-muted"
          >
            {place.hook}
          </p>
        </div>

        <div className="flex-1" />

        <div className="shrink-0 border-t border-line pt-5">
          <div className="flex items-center justify-between gap-4">
            <p
              key={statusIndex}
              className="animate-fade text-lg font-semibold text-ink"
              role="status"
            >
              {STATUS_COPY[statusIndex]}
            </p>
            <span className="font-display tracking-tight text-lg font-bold tabular-nums text-muted">
              {Math.round(state.progress)}%
            </span>
          </div>

          <div className="relative mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-gold transition-[width] duration-300 ease-out"
              style={{ width: `${state.progress}%` }}
            />
            <div
              aria-hidden
              className="animate-shimmer absolute inset-y-0 w-1/3"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
              }}
            />
          </div>

          <div className="mt-3.5 flex items-center justify-between gap-4">
            <p className="text-xs text-muted">
              Creating your portrait — this takes under a minute.
            </p>
            <button
              type="button"
              onClick={onCancel}
              className="shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-muted underline underline-offset-4"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
