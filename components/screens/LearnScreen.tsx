"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, type MouseEvent } from "react";
import { Masthead } from "@/components/Masthead";
import { StepBar } from "@/components/StepBar";
import { Hotspot } from "@/components/Hotspot";
import { InfoSheet } from "@/components/InfoSheet";
import type { Ethnic, Hotspot as HotspotData, Look } from "@/lib/ethnics";

export function LearnScreen({
  ethnic,
  look,
  onBack,
  onNext,
  calibrate = false,
}: {
  ethnic: Ethnic;
  look: Look;
  onBack: () => void;
  onNext: () => void;
  /** ?calibrate=1 — tap the photo to read coordinates after swapping assets. */
  calibrate?: boolean;
}) {
  const [open, setOpen] = useState<HotspotData | null>(null);
  const [probe, setProbe] = useState<{ x: number; y: number } | null>(null);

  const handleProbe = (e: MouseEvent<HTMLDivElement>) => {
    if (!calibrate) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
    const y = Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(1));
    setProbe({ x, y });
    console.log(`hotspot coords → x: ${x}, y: ${y}`);
  };

  return (
    <div className="relative flex h-full flex-col bg-cream">
      <Masthead compact step={{ current: 2, total: 4, label: "Meet the dress" }} />

      <main className="flex min-h-0 flex-1 flex-col px-6 pb-4">
        <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
          <div className="shrink-0">
            <div className="animate-fade-up flex items-baseline justify-between gap-3">
              <h1 className="font-display text-4xl font-bold text-ink">
                {ethnic.name}
              </h1>
              <p className="text-sm font-semibold italic text-muted">{look.name}</p>
            </div>

            <p className="animate-fade-up mt-2 text-base leading-relaxed text-bark">
              {ethnic.description}
            </p>
          </div>

          {/* Height-driven so the whole screen always fits a kiosk without
              scrolling. The box keeps the photo's exact aspect ratio, which is
              what makes the percentage hotspot positions reliable. */}
          <div className="flex min-h-0 flex-1 justify-center py-4">
            <div
              onClick={handleProbe}
              className="animate-fade relative h-full max-w-full overflow-hidden rounded-3xl bg-bark shadow-xl"
              style={{ aspectRatio: `${look.aspect.w} / ${look.aspect.h}` }}
            >
              <img
                src={look.image}
                alt={`${ethnic.name} ${look.label.toLowerCase()} in ${look.name}`}
                className="h-full w-full object-cover"
              />

              {look.hotspots.map((hotspot) => (
                <Hotspot
                  key={hotspot.id}
                  hotspot={hotspot}
                  active={open?.id === hotspot.id}
                  onTap={setOpen}
                />
              ))}

              {calibrate && probe ? (
                <span className="absolute left-3 top-3 rounded-lg bg-ink/85 px-2.5 py-1.5 font-mono text-xs text-cream">
                  x: {probe.x}, y: {probe.y}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-sand/70 px-4 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-stb-hornbill/60 bg-white/70">
              <span className="h-2 w-2 rounded-full bg-stb-hornbill" />
            </span>
            <p className="text-[0.9375rem] font-medium leading-snug text-bark">
              Tap a circle on the photo to learn what it means.
            </p>
          </div>
        </div>
      </main>

      <InfoSheet hotspot={open} onClose={() => setOpen(null)} />

      <StepBar onBack={onBack} onNext={onNext} nextLabel="Take photo" />
    </div>
  );
}
