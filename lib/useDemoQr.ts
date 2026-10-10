"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  INITIAL_SELECTION,
  TOKEN_HEADER,
  type DemoPick,
  type DemoSelection,
  type DemoSessionView,
} from "./demoQr";

type Json = Record<string, unknown> & {
  error?: string;
  code?: string;
  session?: DemoSessionView;
};

async function call(
  url: string,
  init: RequestInit & { token?: string | null; json?: unknown } = {},
): Promise<{ status: number; body: Json }> {
  const { token, json, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (json !== undefined) headers.set("Content-Type", "application/json");
  if (token) headers.set(TOKEN_HEADER, token);
  const res = await fetch(url, {
    cache: "no-store",
    ...rest,
    headers,
    body: json === undefined ? rest.body : JSON.stringify(json),
  });
  let body: Json = {};
  try {
    body = (await res.json()) as Json;
  } catch {
    // Non-JSON error page — the status alone tells the story.
  }
  return { status: res.status, body };
}

const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

/**
 * The server's clock minus ours, so progress can be eased from the moment
 * the photo was submitted without trusting either device's clock.
 */
function useClockOffset() {
  const offset = useRef(0);
  const note = useCallback((view: DemoSessionView | undefined) => {
    if (view) offset.current = view.now - Date.now();
  }, []);
  const serverNow = useCallback(() => Date.now() + offset.current, []);
  return { note, serverNow };
}

/* ------------------------------------------------------------------ */
/* Kiosk                                                               */
/* ------------------------------------------------------------------ */

export type KioskConnection =
  | { status: "connecting" }
  | { status: "unavailable"; error: string }
  | { status: "live"; id: string; session: DemoSessionView };

const KIOSK_POLL_WAITING_MS = 2000;
const KIOSK_POLL_ACTIVE_MS = 1000;
const KIOSK_RETRY_MS = 5000;

/**
 * Opens a session, polls it, and opens a fresh one the moment the last ends
 * or expires — so the kiosk always has a scannable code without anyone
 * touching it.
 */
export function useKioskSession() {
  const [conn, setConn] = useState<KioskConnection>({ status: "connecting" });
  const current = useRef<{ id: string; token: string } | null>(null);
  const { note, serverNow } = useClockOffset();

  useEffect(() => {
    let alive = true;

    const open = async (): Promise<boolean> => {
      try {
        const { status, body } = await call("/api/demo-qr", { method: "POST" });
        if (!alive) return false;
        if (status === 200 && typeof body.id === "string" && body.session) {
          current.current = { id: body.id, token: String(body.kioskToken) };
          note(body.session);
          setConn({ status: "live", id: body.id, session: body.session });
          return true;
        }
        setConn({
          status: "unavailable",
          error: body.error ?? "The session service is unavailable.",
        });
      } catch {
        if (alive) {
          setConn({ status: "unavailable", error: "Can't reach the server." });
        }
      }
      return false;
    };

    void (async () => {
      while (alive) {
        if (!current.current) {
          if (!(await open())) {
            await sleep(KIOSK_RETRY_MS);
            continue;
          }
        }

        const session = await poll();
        if (!alive) return;
        await sleep(
          session?.phase === "waiting" ? KIOSK_POLL_WAITING_MS : KIOSK_POLL_ACTIVE_MS,
        );
      }
    })();

    async function poll(): Promise<DemoSessionView | null> {
      const mine = current.current;
      if (!mine) return null;
      try {
        const { status, body } = await call(`/api/demo-qr/${mine.id}`, {
          token: mine.token,
        });
        if (!alive || current.current !== mine) return null;
        if (status === 404 || body.session?.phase === "ended") {
          // Gone or finished — the next loop opens a new code.
          current.current = null;
          return null;
        }
        if (status === 200 && body.session) {
          note(body.session);
          setConn({ status: "live", id: mine.id, session: body.session });
          return body.session;
        }
      } catch {
        // A dropped poll is not worth showing; keep the current screen.
      }
      return null;
    }

    // If the kiosk page is closed or reloaded mid-session, tell the phone.
    const onHide = () => {
      const mine = current.current;
      if (!mine) return;
      navigator.sendBeacon?.(
        `/api/demo-qr/${mine.id}/end`,
        new Blob([JSON.stringify({ token: mine.token, reason: "left" })], {
          type: "application/json",
        }),
      );
    };
    window.addEventListener("pagehide", onHide);

    return () => {
      alive = false;
      window.removeEventListener("pagehide", onHide);
    };
  }, [note]);

  /** Close this session; the polling loop opens the next one. */
  const end = useCallback(async () => {
    const mine = current.current;
    if (!mine) return;
    current.current = null;
    setConn({ status: "connecting" });
    try {
      await call(`/api/demo-qr/${mine.id}/end`, {
        method: "POST",
        token: mine.token,
        json: { reason: "finished" },
      });
    } catch {
      // It expires on its own regardless.
    }
  }, []);

  return { conn, end, serverNow };
}

/* ------------------------------------------------------------------ */
/* Phone                                                               */
/* ------------------------------------------------------------------ */

export type PhoneConnection =
  | { status: "joining" }
  | { status: "taken" }
  | { status: "expired" }
  | { status: "unavailable"; error: string }
  | { status: "live"; session: DemoSessionView };

const PHONE_POLL_SELECTING_MS = 5000;
const PHONE_POLL_WAITING_MS = 2500;

const tokenKey = (id: string) => `demo-qr:${id}`;

function readToken(id: string): string | null {
  try {
    return window.sessionStorage.getItem(tokenKey(id));
  } catch {
    return null;
  }
}

function writeToken(id: string, token: string) {
  try {
    window.sessionStorage.setItem(tokenKey(id), token);
  } catch {
    // Private mode: a reload will just ask to scan again.
  }
}

/**
 * One join per page load, however many times React mounts the effect —
 * StrictMode mounts twice in development, and a second, token-less join
 * racing the first would be told the screen is taken.
 */
const joins = new Map<string, Promise<{ status: number; body: Json }>>();

function joinOnce(id: string) {
  let pending = joins.get(id);
  if (!pending) {
    pending = call(`/api/demo-qr/${id}/join`, {
      method: "POST",
      json: { token: readToken(id) },
    });
    joins.set(id, pending);
  }
  return pending;
}

/**
 * Joins the session from the QR, then drives it. Choices update the phone
 * immediately and are written in the background, one request at a time and
 * retried, so the server always ends up with the newest. A reload rejoins
 * with the stored token and resumes where it was.
 */
export function usePhoneSession(id: string) {
  const [conn, setConn] = useState<PhoneConnection>({ status: "joining" });
  const [selection, setSelection] = useState<DemoSelection>(INITIAL_SELECTION);
  const [sending, setSending] = useState(false);
  /** A failure the server never heard about. A poll must not clear it. */
  const [localError, setLocalError] = useState<string | null>(null);
  const token = useRef<string | null>(null);
  const seq = useRef(0);
  const current = useRef<DemoSelection>(INITIAL_SELECTION);
  /** Newest server write seen — a slow reply must not undo a newer state. */
  const newest = useRef(0);
  /** The newest choice the server hasn't acknowledged yet. */
  const outbox = useRef<{ seq: number; selection: DemoSelection } | null>(null);
  const flushing = useRef(false);
  const { note, serverNow } = useClockOffset();

  /**
   * Shared handling for every reply. Protocol codes come first, then any
   * session the reply carries; bare HTTP statuses only as a last resort, so
   * an upstream 403 or 404 can never read as "taken" or "expired".
   */
  const settle = useCallback(
    (status: number, body: Json): boolean => {
      if (body.code === "expired") {
        setConn({ status: "expired" });
        return true;
      }
      if (body.code === "taken") {
        setConn({ status: "taken" });
        return true;
      }
      if (body.code === "not-configured") {
        setConn({ status: "unavailable", error: body.error ?? "Not configured." });
        return true;
      }
      const view = body.session;
      if (view) {
        if (view.updatedAt >= newest.current) {
          newest.current = view.updatedAt;
          note(view);
          // The server has moved on, so it knows more than a local failure.
          if (view.phase !== "selecting") setLocalError(null);
          setConn({ status: "live", session: view });
        }
        return true;
      }
      if (status === 404 || status === 410) {
        setConn({ status: "expired" });
        return true;
      }
      if (status === 403) {
        setConn({ status: "taken" });
        return true;
      }
      return false;
    },
    [note],
  );

  /**
   * Sends the outbox, one request at a time. Taps that arrive meanwhile just
   * replace what is waiting, so the server sees choices in order (its seq
   * check is a read-then-write, not atomic) and a dropped request is retried.
   */
  const flush = useCallback(async () => {
    if (flushing.current) return;
    flushing.current = true;
    let failures = 0;
    try {
      while (outbox.current) {
        const msg = outbox.current;
        let delivered = false;
        try {
          const { status, body } = await call(`/api/demo-qr/${id}`, {
            method: "PATCH",
            token: token.current,
            json: msg,
          });
          // Anything but a server-side failure is final: applied, superseded,
          // or refused for a reason a retry would not change.
          delivered = settle(status, body) || status < 500;
        } catch {
          // Offline for a moment.
        }
        if (outbox.current !== msg) {
          failures = 0; // A newer choice replaced it; send that next.
          continue;
        }
        if (delivered) {
          outbox.current = null;
          break;
        }
        failures += 1;
        // Past this, leave it to the poll, which resends when the server is behind.
        if (failures >= 6) break;
        await sleep(Math.min(4000, 300 * 2 ** failures));
      }
    } finally {
      flushing.current = false;
    }
  }, [id, settle]);

  // Join, then keep an eye on the session.
  useEffect(() => {
    let alive = true;

    void (async () => {
      try {
        const { status, body } = await joinOnce(id);
        if (!alive) return;
        if (status === 200 && typeof body.token === "string" && body.session) {
          token.current = body.token;
          writeToken(id, body.token);
          seq.current = body.session.seq;
          const { step, ethnicId, gender, hotspotId, lastPick } = body.session;
          current.current = { step, ethnicId, gender, hotspotId, lastPick };
          setSelection(current.current);
        }
        if (!settle(status, body)) {
          setConn({
            status: "unavailable",
            error: body.error ?? "Couldn't connect to the screen.",
          });
          return;
        }
        if (status !== 200) return;
      } catch {
        if (alive) setConn({ status: "unavailable", error: "Can't reach the server." });
        return;
      }

      let phase: string | undefined = "selecting";
      while (alive) {
        await sleep(phase === "selecting" ? PHONE_POLL_SELECTING_MS : PHONE_POLL_WAITING_MS);
        if (!alive) return;
        try {
          const { status, body } = await call(`/api/demo-qr/${id}`, {
            token: token.current,
          });
          if (!alive) return;
          settle(status, body);
          const view = body.session;
          phase = view?.phase;
          if (status === 404 || phase === "ended") return;
          // The server is behind this phone — a write was lost for good.
          if (view?.phase === "selecting" && view.seq < seq.current && !flushing.current) {
            outbox.current = { seq: seq.current, selection: current.current };
            void flush();
          }
        } catch {
          // Try again next tick.
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, settle, flush]);

  /** Apply a choice locally and send it. `pick` stamps the feedback. */
  const choose = useCallback(
    (next: Omit<DemoSelection, "lastPick">, pick?: Omit<DemoPick, "seq">) => {
      seq.current += 1;
      const n = seq.current;
      const stamped: DemoSelection = {
        ...next,
        lastPick: pick ? { ...pick, seq: n } : current.current.lastPick,
      };
      current.current = stamped;
      setSelection(stamped);
      setLocalError(null);
      outbox.current = { seq: n, selection: stamped };
      void flush();
    },
    [flush],
  );

  const submitPhoto = useCallback(
    async (photo: string) => {
      setSending(true);
      setLocalError(null);
      try {
        // The selection rides along, in case the write that reached the
        // camera step never landed.
        const { status, body } = await call(`/api/demo-qr/${id}/photo`, {
          method: "POST",
          token: token.current,
          json: { photo, seq: seq.current, selection: current.current },
        });
        if (!settle(status, body)) {
          setLocalError(body.error ?? "We couldn't send your photo.");
        }
      } catch {
        setLocalError("Connection problem. Please try again.");
      } finally {
        setSending(false);
      }
    },
    [id, settle],
  );

  /** The visitor is done — clear the kiosk for the next person. */
  const finish = useCallback(async () => {
    try {
      await call(`/api/demo-qr/${id}/end`, {
        method: "POST",
        token: token.current,
        json: { reason: "finished" },
      });
    } catch {
      // The kiosk clears itself on a timer anyway.
    }
    setConn((c) =>
      c.status === "live"
        ? {
            status: "live",
            session: { ...c.session, phase: "ended", endedReason: "finished" },
          }
        : c,
    );
  }, [id]);

  return { conn, selection, choose, submitPhoto, sending, localError, finish, serverNow };
}

/** Re-renders every `ms` while `active`, for progress bars eased off a clock. */
export function useTicker(active: boolean, ms = 220) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), ms);
    return () => window.clearInterval(id);
  }, [active, ms]);
}
