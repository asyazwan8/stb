"use client";

import { Masthead } from "@/components/Masthead";
import { MotifDivider, MotifWatermark } from "@/components/Motif";

export function AttractScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <Masthead />

      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-8 text-center">
        {/* One oversized pale motif, sitting behind the type. The idle screen
            no longer advertises destinations — that belongs on the loading
            screen, where there is dwell time to read it. */}
        <MotifWatermark
          className="pointer-events-none absolute left-1/2 top-1/2 w-[118%] -translate-x-1/2 -translate-y-1/2 text-ink/[0.055]"
        />

        <div className="animate-fade-up relative">
          <h1 className="font-display tracking-tight text-[3.15rem] font-extrabold leading-[1.06] text-ink">
            Wear the
            <br />
            stories of
            <br />
            Sarawak
          </h1>

          <MotifDivider className="mx-auto mt-6 h-4 w-56 text-ink/30" />

          <p className="mx-auto mt-6 max-w-md text-[1.1875rem] leading-relaxed text-muted">
            Step into the traditional dress of Sarawak&rsquo;s people, learn what
            every piece means, and take the portrait home.
          </p>

          <button
            type="button"
            onClick={onStart}
            className="mt-10 h-20 w-full max-w-sm rounded-full bg-gold text-2xl font-bold text-ink transition active:scale-[0.97] active:bg-gold-deep"
          >
            Start
          </button>

          <p className="mt-5 text-sm text-muted">Takes about a minute</p>
        </div>
      </main>

      <div className="kiosk-no-select kiosk-reach-bottom shrink-0 px-8">
        <p className="text-center text-xs leading-relaxed text-muted">
          A demonstration for the Sarawak Tourism Board. Photos are used only to
          create your portrait and are not stored by this kiosk.
        </p>
      </div>
    </div>
  );
}
