"use client";

/* eslint-disable @next/next/no-img-element */
import { Hornbill } from "@/components/Hornbill";

export function AttractScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      {/* Hornbills fill the quiet corners of a very tall panel. Big and in
          flight up top, smaller and perched down low. */}
      {/* In flight across the top band, at rest along the bottom band. Sized
          and offset to stay clear of the masthead and the footer copy — the
          logo is the hero and nothing may cross it. */}
      <div className="animate-float absolute -left-[8%] -top-[8%] w-[46%]">
        <Hornbill pose={5} rotate={-5} className="w-full" />
      </div>
      <div
        className="animate-float absolute -right-[5%] top-[4%] w-[28%]"
        style={{ animationDelay: "-2.6s" }}
      >
        <Hornbill pose={1} flip rotate={7} className="w-full" />
      </div>
      <div className="absolute bottom-[14%] left-[1%] w-[34%]">
        <Hornbill pose={6} className="w-full" />
      </div>
      <div className="absolute bottom-[13%] right-[4%] w-[17%]">
        <Hornbill pose={8} rotate={3} className="w-full" />
      </div>

      <main className="relative flex flex-1 flex-col items-center justify-center px-8 text-center">
        {/* The masthead is the hero here, not a header bar. */}
        <img
          src="/brand/stb-masthead.png"
          alt="Sarawak — Gateway to Borneo"
          className="animate-fade-up w-[78%] max-w-none"
        />

        <h1 className="animate-fade-up mt-10 text-[2.1rem] font-extrabold leading-tight tracking-tight text-ink">
          Wear the stories of Sarawak
        </h1>

        <p className="animate-fade-up mx-auto mt-4 max-w-md text-[1.1875rem] leading-relaxed text-muted">
          Step into traditional dress, find out what every piece means, and take
          the portrait home.
        </p>

        <button
          type="button"
          onClick={onStart}
          className="animate-fade-up mt-10 h-24 w-full max-w-md rounded-full bg-gold text-[1.75rem] font-extrabold tracking-tight text-ink shadow-lg shadow-gold/30 transition active:scale-[0.97] active:bg-gold-deep"
        >
          Tap to start
        </button>

        <p className="mt-5 text-sm text-muted">Takes about a minute</p>
      </main>

      <div className="kiosk-no-select kiosk-reach-bottom relative shrink-0 px-8">
        <p className="text-center text-xs leading-relaxed text-muted">
          A demonstration for the Sarawak Tourism Board. Photos are used only to
          create your portrait and are not stored by this kiosk.
        </p>
      </div>
    </div>
  );
}
