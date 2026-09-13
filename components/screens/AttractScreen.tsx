"use client";

/* eslint-disable @next/next/no-img-element */
import { Masthead, Ribbon } from "@/components/Masthead";

export function AttractScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex h-full flex-col bg-cream">
      <Masthead />

      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-7 text-center">
        {/* Warm wash so the screen reads from across a hall. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 70% at 50% 0%, rgba(242,160,48,0.18) 0%, rgba(253,250,244,0) 60%)",
          }}
        />

        <div className="animate-fade-up relative">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-stb-hornbill">
            AI Photobooth
          </p>

          <h1 className="mt-5 font-display text-[clamp(2.6rem,9vw,4.6rem)] leading-[1.05] font-bold text-ink">
            Wear the
            <br />
            stories of
            <br />
            <span className="text-stb-hornbill">Sarawak</span>
          </h1>

          <p className="mx-auto mt-6 max-w-md text-[19px] leading-relaxed text-bark">
            Step into the traditional dress of Sarawak&rsquo;s people, learn what
            every piece means, and take the portrait home.
          </p>

          <button
            type="button"
            onClick={onStart}
            className="mt-10 h-20 w-full max-w-sm rounded-3xl bg-stb-hornbill text-2xl font-bold text-white shadow-xl shadow-stb-hornbill/30 transition active:scale-[0.97]"
          >
            Start
          </button>

          <p className="mt-5 text-sm text-muted">Takes about a minute</p>
        </div>
      </main>

      <div className="kiosk-no-select shrink-0 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <Ribbon className="mb-4 rounded-full" />
        <p className="text-center text-xs leading-relaxed text-muted">
          A demonstration for the Sarawak Tourism Board. Photos are used only to
          create your portrait and are not stored by this kiosk.
        </p>
      </div>
    </div>
  );
}
