/**
 * Phone-controlled mode (/demo-qr).
 *
 * The kiosk shows the question; the visitor's phone shows the choices. They
 * share one small session record, which the phone writes and both poll. This
 * file is the contract between them, and it is safe to import on either side.
 *
 * The selfie never enters the session — the phone posts it once and the
 * server hands it straight to fal, exactly as the touch kiosk does.
 */

import { ETHNICS, getEthnic, getLook, type Gender } from "./ethnics";

export type DemoStep = "ethnic" | "look" | "learn" | "camera";
export const DEMO_STEPS: DemoStep[] = ["ethnic", "look", "learn", "camera"];

export type DemoPhase =
  /** QR on the kiosk, no phone yet. */
  | "waiting"
  /** A phone has joined and is making choices. */
  | "selecting"
  /** Photo received; the portrait is being made. */
  | "processing"
  | "done"
  | "error"
  | "ended";

export type DemoEndReason = "finished" | "timeout" | "left";

/** The tap that drives the "You chose Iban" feedback. `seq` replays it. */
export type DemoPick = {
  type: "ethnic" | "look" | "detail";
  id: string;
  seq: number;
};

/** Everything the phone controls. Sent whole on every change. */
export type DemoSelection = {
  step: DemoStep;
  ethnicId: string | null;
  gender: Gender | null;
  hotspotId: string | null;
  lastPick: DemoPick | null;
};

export type DemoSession = DemoSelection & {
  id: string;
  phase: DemoPhase;
  /** Monotonic write counter from the phone; stale writes are dropped. */
  seq: number;
  requestId: string | null;
  submittedAt: number | null;
  imageUrl: string | null;
  error: string | null;
  endedReason: DemoEndReason | null;
  createdAt: number;
  updatedAt: number;
  kioskToken: string;
  phoneToken: string | null;
};

/** What either screen is allowed to see — never the tokens. */
export type DemoSessionView = Omit<DemoSession, "kioskToken" | "phoneToken"> & {
  joined: boolean;
  /** Server clock, so progress can be eased without trusting device clocks. */
  now: number;
};

export const INITIAL_SELECTION: DemoSelection = {
  step: "ethnic",
  ethnicId: null,
  gender: null,
  hotspotId: null,
  lastPick: null,
};

/** Refreshed on every write; an abandoned session simply evaporates. */
export const SESSION_TTL_SECONDS = 20 * 60;
/** A phone that stops tapping frees the kiosk for the next visitor. */
export const IDLE_TIMEOUT_MS = 4 * 60 * 1000;
/** Matches the touch kiosk's own give-up point. */
export const PROCESSING_TIMEOUT_MS = 180_000;

export const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{12}$/;
export const TOKEN_HEADER = "x-demo-token";

export function phonePath(id: string): string {
  return `/demo-qr/phone/${id}`;
}

export function toView(session: DemoSession, now: number): DemoSessionView {
  const { kioskToken: _k, phoneToken, ...rest } = session;
  return { ...rest, joined: phoneToken !== null, now };
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

/**
 * Checks a selection sent by the phone against the content model, so nothing
 * the kiosk renders can name a group, look or detail that does not exist.
 */
export function parseSelection(input: unknown): DemoSelection | null {
  if (!isObject(input)) return null;
  const { step, ethnicId, gender, hotspotId, lastPick } = input;

  if (typeof step !== "string" || !DEMO_STEPS.includes(step as DemoStep)) return null;

  let ethnic = null;
  if (ethnicId !== null) {
    if (typeof ethnicId !== "string") return null;
    ethnic = getEthnic(ethnicId);
    if (!ethnic || ethnic.status !== "live") return null;
  }

  if (gender !== null && gender !== "female" && gender !== "male") return null;
  const look = ethnic && gender ? getLook(ethnic.id, gender) : undefined;
  if (gender !== null && !look) return null;

  if (hotspotId !== null) {
    if (typeof hotspotId !== "string") return null;
    if (!look?.hotspots.some((h) => h.id === hotspotId)) return null;
  }

  // Each step needs the choices before it.
  if (step !== "ethnic" && !ethnic) return null;
  if ((step === "learn" || step === "camera") && !look) return null;

  let pick: DemoPick | null = null;
  if (lastPick !== null) {
    if (!isObject(lastPick)) return null;
    const { type, id, seq } = lastPick;
    if (typeof id !== "string" || typeof seq !== "number" || !Number.isInteger(seq)) {
      return null;
    }
    const known =
      type === "ethnic"
        ? ETHNICS.some((e) => e.id === id)
        : type === "look"
          ? Boolean(ethnic?.looks.some((l) => l.gender === id))
          : type === "detail"
            ? Boolean(look?.hotspots.some((h) => h.id === id))
            : false;
    if (!known) return null;
    pick = { type: type as DemoPick["type"], id, seq };
  }

  return {
    step: step as DemoStep,
    ethnicId: ethnic?.id ?? null,
    gender: gender as Gender | null,
    hotspotId: (hotspotId as string | null) ?? null,
    lastPick: pick,
  };
}

export type Feedback = {
  tone: "chosen" | "soon";
  before: string;
  name: string;
  after: string;
  /** Changes on every tap, so the pill animates in again. */
  key: string;
};

/**
 * The response to a tap — "You chose Iban". Derived from the selection rather
 * than stored, so Back and a reload both show the right line. The one
 * exception is a tap on something that is coming soon: that changes nothing,
 * so only the last pick remembers it.
 */
export function feedbackFor(
  sel: DemoSelection,
  surface: "kiosk" | "phone",
): Feedback | null {
  const key = `${sel.step}:${sel.lastPick?.seq ?? 0}`;
  const ethnic = sel.ethnicId ? getEthnic(sel.ethnicId) : undefined;
  const look = sel.ethnicId && sel.gender ? getLook(sel.ethnicId, sel.gender) : undefined;

  switch (sel.step) {
    case "ethnic": {
      const pick = sel.lastPick;
      if (pick?.type === "ethnic") {
        const tapped = getEthnic(pick.id);
        if (tapped && tapped.status !== "live") {
          return { tone: "soon", before: "", name: tapped.name, after: " is coming soon", key };
        }
      }
      return ethnic
        ? { tone: "chosen", before: "You chose ", name: ethnic.name, after: "", key }
        : null;
    }
    case "look":
      return look
        ? { tone: "chosen", before: "You chose ", name: look.name, after: "", key }
        : null;
    case "learn": {
      const hotspot = look?.hotspots.find((h) => h.id === sel.hotspotId);
      if (!hotspot) return null;
      if (hotspot.status !== "live") {
        return { tone: "soon", before: "", name: hotspot.name, after: " is coming soon", key };
      }
      return {
        tone: "chosen",
        before: "Now showing ",
        name: hotspot.name,
        after: surface === "phone" ? " on screen" : "",
        key,
      };
    }
    default:
      return null;
  }
}
