import { NextResponse } from "next/server";
import type { DemoEndReason } from "@/lib/demoQr";
import {
  callerOf,
  errorResponse,
  loadSession,
  saveSession,
  storeErrorResponse,
  tokenFrom,
} from "@/lib/demoQrServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const REASONS: DemoEndReason[] = ["finished", "timeout", "left"];

/**
 * Either screen can close the session: the phone's Done button, or the kiosk
 * clearing its result. The token may come in the body, because the kiosk's
 * unload beacon cannot set headers.
 */
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  let body: { token?: unknown; reason?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    // Reason and token are both optional in the body.
  }
  const token = tokenFrom(request) ?? (typeof body.token === "string" ? body.token : null);
  const reason = REASONS.includes(body.reason as DemoEndReason)
    ? (body.reason as DemoEndReason)
    : "finished";

  try {
    const session = await loadSession(id);
    // Already gone is as good as ended.
    if (!session) return NextResponse.json({ ok: true });
    if (!callerOf(session, token)) {
      return errorResponse("Not allowed to end this session.", 403);
    }
    if (session.phase !== "ended") {
      session.phase = "ended";
      session.endedReason = reason;
      await saveSession(session);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return storeErrorResponse(err);
  }
}
