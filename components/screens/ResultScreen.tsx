"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Masthead } from "@/components/Masthead";
import { QrPanel } from "@/components/QrPanel";
import type { Ethnic, Look } from "@/lib/ethnics";

/** Kiosks must clear themselves — nobody's portrait should sit on screen. */
const AUTO_RESET_SECONDS = 90;
const WARN_AT = 15;

export function ResultScreen({
  imageUrl,
  ethnic,
  look,
  onRestart,
}: {
  imageUrl: string;
  ethnic: Ethnic;
  look: Look;
  onRestart: () => void;
}) {
  const [remaining, setRemaining] = useState(AUTO_RESET_SECONDS);

  useEffect(() => {
    const id = window.setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (remaining <= 0) onRestart();
  }, [remaining, onRestart]);

  // Served through our own origin so nothing depends on the fal CDN's headers.
  const display = `/api/image?src=${encodeURIComponent(imageUrl)}`;

  return (
    <div className="flex h-full flex-col bg-cream">
      <Masthead compact />

      <main className="flex min-h-0 flex-1 flex-col px-6 pb-4">
        <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
          <div className="animate-fade-up shrink-0 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-stb-hornbill">
              Your portrait
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-ink">
              {look.name}
            </h1>
            <p className="mt-0.5 text-[14px] text-muted">
              {ethnic.name} traditional dress
            </p>
          </div>

          {/* Height-driven so the QR and the restart button are always reachable. */}
          <div className="flex min-h-0 flex-1 justify-center py-3">
            <div
              className="animate-fade relative h-full max-w-full overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-bark/10"
              style={{ aspectRatio: `${look.aspect.w} / ${look.aspect.h}` }}
            >
              <img
                src={display}
                alt={`You in ${ethnic.name} ${look.name}`}
                className="h-full w-full object-cover"
              />
              {/* Branded lockup burned onto the frame, so a photo of the screen
                  still carries the Sarawak mark. */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-ink/75 to-transparent px-4 pb-3 pt-10">
                <img
                  src="/brand/stb-masthead.png"
                  alt="Sarawak — Gateway to Borneo"
                  className="h-7 w-auto brightness-0 invert"
                />
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/85">
                  AI Photobooth
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="shrink-0 sm:w-52">
              <QrPanel imageUrl={imageUrl} />
            </div>

            <div className="flex flex-1 flex-col justify-between gap-3">
              <div className="rounded-3xl bg-sand/70 px-5 py-3.5">
                <p className="text-[15px] leading-relaxed text-bark">
                  Scan the code to save your portrait, then come and see the real
                  thing — the {ethnic.name} welcome visitors to their longhouses
                  along Sarawak&rsquo;s rivers.
                </p>
              </div>

              <button
                type="button"
                onClick={onRestart}
                className="h-16 w-full rounded-2xl bg-stb-hornbill text-lg font-bold text-white shadow-lg shadow-stb-hornbill/25 transition active:scale-[0.97]"
              >
                Start over
              </button>
            </div>
          </div>

          <p className="mt-3 shrink-0 text-center text-xs text-muted">
            {remaining <= WARN_AT
              ? `Clearing this screen in ${Math.max(remaining, 0)}s…`
              : "This screen clears itself for the next visitor."}
          </p>
        </div>
      </main>
    </div>
  );
}
