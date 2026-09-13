"use client";

import { useCallback, useRef, useState } from "react";
import type { Gender } from "./ethnics";

export type SwapPhase = "idle" | "submitting" | "queued" | "processing" | "done" | "error";

export type SwapState = {
  phase: SwapPhase;
  imageUrl: string | null;
  error: string | null;
  /** 0–100. Eased while we wait, snapped to 100 on completion. */
  progress: number;
};

const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 180_000;
/** Roughly how long a Nano Banana Pro edit takes; only drives the progress easing. */
const EXPECTED_MS = 34_000;

const INITIAL: SwapState = {
  phase: "idle",
  imageUrl: null,
  error: null,
  progress: 0,
};

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

export function useFaceSwap() {
  const [state, setState] = useState<SwapState>(INITIAL);
  const cancelled = useRef(false);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearInterval(id));
    timers.current = [];
  }, []);

  const reset = useCallback(() => {
    cancelled.current = true;
    clearTimers();
    setState(INITIAL);
  }, [clearTimers]);

  const run = useCallback(
    async (args: { photo: string; ethnic: string; gender: Gender }) => {
      cancelled.current = false;
      clearTimers();
      setState({ ...INITIAL, phase: "submitting", progress: 4 });

      // Ease the bar toward 92% over the expected duration so the wait reads as
      // motion rather than a frozen screen. Completion snaps it to 100.
      const started = Date.now();
      const ticker = window.setInterval(() => {
        const elapsed = Date.now() - started;
        const eased = 1 - Math.exp(-elapsed / (EXPECTED_MS / 2.2));
        setState((s) =>
          s.phase === "done" || s.phase === "error"
            ? s
            : { ...s, progress: Math.min(92, 4 + eased * 88) },
        );
      }, 220);
      timers.current.push(ticker);

      const fail = (message: string) => {
        clearTimers();
        if (!cancelled.current) {
          setState({ phase: "error", imageUrl: null, error: message, progress: 0 });
        }
      };

      try {
        const res = await fetch("/api/swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(args),
        });

        if (!res.ok) {
          fail(await readError(res, "We couldn't start your portrait."));
          return;
        }

        const { requestId } = (await res.json()) as { requestId: string };
        if (cancelled.current) return;
        setState((s) => ({ ...s, phase: "queued" }));

        while (!cancelled.current) {
          if (Date.now() - started > TIMEOUT_MS) {
            fail("This is taking longer than expected. Please try again.");
            return;
          }

          await new Promise((r) => window.setTimeout(r, POLL_INTERVAL_MS));
          if (cancelled.current) return;

          const poll = await fetch(`/api/swap/${requestId}`, { cache: "no-store" });

          if (!poll.ok) {
            fail(await readError(poll, "We lost track of your portrait."));
            return;
          }

          const data = (await poll.json()) as {
            status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED";
            imageUrl?: string;
          };

          if (data.status === "COMPLETED" && data.imageUrl) {
            clearTimers();
            if (!cancelled.current) {
              setState({
                phase: "done",
                imageUrl: data.imageUrl,
                error: null,
                progress: 100,
              });
            }
            return;
          }

          setState((s) =>
            s.phase === "error"
              ? s
              : { ...s, phase: data.status === "IN_QUEUE" ? "queued" : "processing" },
          );
        }
      } catch (err) {
        fail(
          err instanceof Error && err.message
            ? `Connection problem: ${err.message}`
            : "Connection problem. Please try again.",
        );
      }
    },
    [clearTimers],
  );

  return { state, run, reset };
}
