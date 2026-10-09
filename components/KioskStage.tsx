import type { ReactNode } from "react";

/**
 * The kiosk is a 9:16 panel. On anything wider we centre an exact 9:16 stage
 * against a dark surround, so a laptop preview shows precisely what the
 * installed kiosk looks like rather than a stretched approximation. On a phone
 * (taller than 9:16) the cap never binds and it fills the screen.
 */
export function KioskStage({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh w-full items-center justify-center overflow-hidden bg-neutral-950">
      <div
        className="kiosk-stage relative h-dvh w-full overflow-hidden bg-white shadow-2xl"
        style={{ maxWidth: "calc(100dvh * 9 / 16)" }}
      >
        {children}
      </div>
    </div>
  );
}
