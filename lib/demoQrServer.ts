import { randomBytes } from "node:crypto";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { checkSwap, describeFalError } from "./fal";
import {
  IDLE_TIMEOUT_MS,
  INITIAL_SELECTION,
  PROCESSING_TIMEOUT_MS,
  SESSION_ID_PATTERN,
  SESSION_TTL_SECONDS,
  TOKEN_HEADER,
  toView,
  type DemoSession,
} from "./demoQr";

/**
 * Session storage for /demo-qr.
 *
 * Vercel functions share no memory, so the kiosk and the phone can only meet
 * through an external store — Upstash Redis, added from Vercel → Storage. Its
 * integration sets KV_REST_API_URL / KV_REST_API_TOKEN; a database created on
 * upstash.com directly uses the UPSTASH_REDIS_REST_* names. Either works.
 *
 * Without one, a single long-lived process (npm run dev, or next start on the
 * kiosk PC) keeps sessions in memory. On Vercel that would silently break, so
 * there we refuse with a clear message instead, the same way a missing FAL_KEY
 * is handled.
 */

export class StoreNotConfiguredError extends Error {
  constructor() {
    super(
      "Phone mode needs a session store. In Vercel → Storage, add Upstash for Redis and connect it to this project, then redeploy.",
    );
    this.name = "StoreNotConfiguredError";
  }
}

type Store = {
  get(id: string): Promise<DemoSession | null>;
  put(session: DemoSession): Promise<void>;
  /** Atomically hands the session to the first phone. True if this call won. */
  claim(id: string, token: string): Promise<boolean>;
};

const key = (id: string) => `demoqr:${id}`;
const claimKey = (id: string) => `demoqr:${id}:phone`;

function redisStore(redis: Redis): Store {
  return {
    get: (id) => redis.get<DemoSession>(key(id)),
    async put(session) {
      await redis.set(key(session.id), session, { ex: SESSION_TTL_SECONDS });
    },
    async claim(id, token) {
      const won = await redis.set(claimKey(id), token, {
        nx: true,
        ex: SESSION_TTL_SECONDS,
      });
      return won === "OK";
    },
  };
}

type MemoryEntry = { value: DemoSession; expiresAt: number };

function memoryStore(): Store {
  // Survives dev hot reloads, which re-evaluate this module.
  const g = globalThis as typeof globalThis & {
    __demoQrSessions?: Map<string, MemoryEntry>;
    __demoQrClaims?: Set<string>;
  };
  const sessions = (g.__demoQrSessions ??= new Map());
  const claims = (g.__demoQrClaims ??= new Set());

  return {
    async get(id) {
      const entry = sessions.get(id);
      if (!entry) return null;
      if (entry.expiresAt < Date.now()) {
        sessions.delete(id);
        claims.delete(id);
        return null;
      }
      // A copy, so callers can't mutate the stored record by accident.
      return structuredClone(entry.value);
    },
    async put(session) {
      sessions.set(session.id, {
        value: structuredClone(session),
        expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
      });
    },
    async claim(id) {
      if (claims.has(id)) return false;
      claims.add(id);
      return true;
    },
  };
}

let store: Store | null = null;

function getStore(): Store {
  if (store) return store;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (url && token) {
    store = redisStore(new Redis({ url, token }));
  } else if (process.env.VERCEL) {
    throw new StoreNotConfiguredError();
  } else {
    store = memoryStore();
  }
  return store;
}

const randomId = (bytes: number) => randomBytes(bytes).toString("base64url");

export async function createSession(): Promise<DemoSession> {
  const now = Date.now();
  const session: DemoSession = {
    ...INITIAL_SELECTION,
    id: randomId(9),
    phase: "waiting",
    seq: 0,
    requestId: null,
    submittedAt: null,
    imageUrl: null,
    error: null,
    endedReason: null,
    createdAt: now,
    updatedAt: now,
    kioskToken: randomId(16),
    phoneToken: null,
  };
  await getStore().put(session);
  return session;
}

export async function loadSession(id: string): Promise<DemoSession | null> {
  if (!SESSION_ID_PATTERN.test(id)) return null;
  return getStore().get(id);
}

export async function saveSession(session: DemoSession): Promise<void> {
  session.updatedAt = Date.now();
  await getStore().put(session);
}

export async function claimSession(id: string, token: string): Promise<boolean> {
  return getStore().claim(id, token);
}

export const newToken = () => randomId(16);

/**
 * Moves a session along on read: notices the finished portrait, gives up on
 * one that is taking too long, and frees the kiosk from a phone that went
 * quiet. Only writes when something actually changed.
 */
export async function advanceSession(session: DemoSession): Promise<DemoSession> {
  const now = Date.now();

  if (session.phase === "processing" && session.submittedAt !== null) {
    if (now - session.submittedAt > PROCESSING_TIMEOUT_MS) {
      session.phase = "error";
      session.error = "This is taking longer than expected. Please try again.";
      await saveSession(session);
      return session;
    }
    // Still submitting — the photo route fills this in.
    if (!session.requestId) return session;

    try {
      const check = await checkSwap(session.requestId);
      if (check.status === "COMPLETED") {
        session.phase = "done";
        session.imageUrl = check.imageUrl;
        session.error = null;
        await saveSession(session);
      }
    } catch (err) {
      const { message, status, detail } = describeFalError(err);
      console.error("[demo-qr] poll failed", status, message, detail);
      session.phase = "error";
      session.error = message;
      await saveSession(session);
    }
    return session;
  }

  if (
    (session.phase === "selecting" || session.phase === "error") &&
    now - session.updatedAt > IDLE_TIMEOUT_MS
  ) {
    session.phase = "ended";
    session.endedReason = "timeout";
    await saveSession(session);
  }

  return session;
}

/** Who is calling, judged by the token they hold. */
export function callerOf(
  session: DemoSession,
  token: string | null,
): "kiosk" | "phone" | null {
  if (!token) return null;
  if (token === session.kioskToken) return "kiosk";
  if (session.phoneToken && token === session.phoneToken) return "phone";
  return null;
}

export function tokenFrom(request: Request): string | null {
  return request.headers.get(TOKEN_HEADER);
}

export function viewResponse(session: DemoSession, init?: ResponseInit) {
  return NextResponse.json({ session: toView(session, Date.now()) }, init);
}

export function errorResponse(message: string, status: number, code?: string) {
  return NextResponse.json({ error: message, code }, { status });
}

/** Store failures become a clear 503 rather than an opaque crash. */
export function storeErrorResponse(err: unknown) {
  if (err instanceof StoreNotConfiguredError) {
    return errorResponse(err.message, 503, "not-configured");
  }
  console.error("[demo-qr] store failed", err);
  return errorResponse("The session service is unavailable. Please try again.", 503);
}

export const NO_STORE = { headers: { "Cache-Control": "no-store" } };
