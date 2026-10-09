import type { ReactNode } from "react";
import { Masthead } from "@/components/Masthead";
import { Hornbill } from "@/components/Hornbill";

/**
 * One centred message in the kiosk's own style — used for every phone screen
 * that isn't a choice (connecting, waiting, ready, ended) and for the kiosk's
 * "not set up" notice.
 */
export function StatusScreen({
  eyebrow,
  title,
  body,
  progress,
  busy = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  body?: ReactNode;
  /** 0–100 for the gold bar; omit for none. */
  progress?: number;
  /** An indeterminate shimmer, for "connecting". */
  busy?: boolean;
  /** Buttons, stacked full width. */
  children?: ReactNode;
}) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <Masthead compact />

      <div className="animate-float pointer-events-none absolute right-[-4%] top-[8%] w-[30%]">
        <Hornbill pose={2} flip rotate={-4} className="w-full" />
      </div>

      <main className="kiosk-reach-bottom relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-md">
          {eyebrow ? (
            <p className="animate-fade-up text-xs font-bold uppercase tracking-[0.24em] text-muted">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="animate-fade-up mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink">
            {title}
          </h1>
          {body ? (
            <p className="animate-fade-up mx-auto mt-3 max-w-sm text-base leading-relaxed text-muted">
              {body}
            </p>
          ) : null}

          {progress !== undefined || busy ? (
            <div className="relative mx-auto mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface">
              {progress !== undefined ? (
                <div
                  className="h-full rounded-full bg-gold transition-[width] duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              ) : null}
              <div
                aria-hidden
                className={`animate-shimmer absolute inset-y-0 w-1/3 ${busy ? "bg-gold/70" : ""}`}
                style={
                  busy
                    ? undefined
                    : {
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                      }
                }
              />
            </div>
          ) : null}

          {children ? <div className="mt-8 flex flex-col gap-3">{children}</div> : null}
        </div>
      </main>
    </div>
  );
}

export const PRIMARY_BUTTON =
  "h-16 w-full rounded-full bg-gold text-lg font-bold text-ink shadow-lg shadow-black/10 transition active:scale-[0.97] active:bg-gold-deep";
export const SECONDARY_BUTTON =
  "h-16 w-full rounded-full border border-ink/20 text-lg font-semibold text-ink transition active:scale-[0.97] active:bg-surface";
