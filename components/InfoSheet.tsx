"use client";

import { useEffect } from "react";
import type { Hotspot } from "@/lib/ethnics";

export function InfoSheet({
  hotspot,
  onClose,
}: {
  hotspot: Hotspot | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!hotspot) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotspot, onClose]);

  if (!hotspot) return null;

  const live = hotspot.status === "live";

  return (
    <div className="absolute inset-0 z-30 flex items-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/45 animate-fade"
      />

      <div className="animate-fade-up relative w-full rounded-t-[2rem] bg-cream p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-bark/15" aria-hidden />

        <div className="mx-auto w-full max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stb-hornbill">
            {hotspot.label}
          </p>
          <h3 className="mt-1.5 font-display text-3xl font-bold text-ink">
            {hotspot.name}
          </h3>

          {live ? (
            <p className="mt-3 text-[17px] leading-relaxed text-bark">
              {hotspot.description}
            </p>
          ) : (
            <p className="mt-3 text-[17px] leading-relaxed text-muted">
              We&rsquo;re still writing this one. In the full experience, every
              piece of the {hotspot.name.toLowerCase()} gets its own story.
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-6 h-14 w-full rounded-2xl bg-ink text-lg font-bold text-cream transition active:scale-[0.98]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
