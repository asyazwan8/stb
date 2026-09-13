"use client";

import { useEffect, useState } from "react";
import { Masthead, Ribbon } from "@/components/Masthead";
import { PlaceBand } from "@/components/PlaceBand";
import { PLACES } from "@/lib/places";

const PLACE_MS = 6000;

export function AttractScreen({ onStart }: { onStart: () => void }) {
  const [placeIndex, setPlaceIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setPlaceIndex((i) => (i + 1) % PLACES.length),
      PLACE_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col bg-cream">
      <Masthead />

      <main className="relative flex flex-1 flex-col overflow-hidden px-7">
        {/* Warm wash so the screen reads from across a hall. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 60% at 50% 10%, rgba(242,160,48,0.18) 0%, rgba(253,250,244,0) 60%)",
          }}
        />

        {/* Rotating destination band — landscape photography at its own aspect. */}
        <PlaceBand
          activeIndex={placeIndex}
          showCaption
          className="relative shrink-0 shadow-xl"
        />

        <div className="animate-fade-up relative flex flex-1 flex-col justify-center py-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-stb-hornbill">
            AI Photobooth
          </p>

          <h1 className="mt-4 font-display text-[3.15rem] leading-[1.05] font-bold text-ink">
            Wear the
            <br />
            stories of
            <br />
            <span className="text-stb-hornbill">Sarawak</span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-[1.1875rem] leading-relaxed text-bark">
            Step into the traditional dress of Sarawak&rsquo;s people, learn what
            every piece means, and take the portrait home.
          </p>

          <button
            type="button"
            onClick={onStart}
            className="mx-auto mt-8 h-20 w-full max-w-sm rounded-3xl bg-stb-hornbill text-2xl font-bold text-white shadow-xl shadow-stb-hornbill/30 transition active:scale-[0.97]"
          >
            Start
          </button>

          <p className="mt-4 text-sm text-muted">Takes about a minute</p>
        </div>
      </main>

      <div className="kiosk-no-select kiosk-reach-bottom shrink-0 px-6">
        <Ribbon className="mb-4 rounded-full" />
        <p className="text-center text-xs leading-relaxed text-muted">
          A demonstration for the Sarawak Tourism Board. Photos are used only to
          create your portrait and are not stored by this kiosk.
        </p>
      </div>
    </div>
  );
}
