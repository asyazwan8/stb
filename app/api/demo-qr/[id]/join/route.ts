import { NextResponse } from "next/server";
import { toView } from "@/lib/demoQr";
import {
  claimSession,
  errorResponse,
  loadSession,
  newToken,
  saveSession,
  storeErrorResponse,
} from "@/lib/demoQrServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * The first phone to scan the code takes the session. The same phone can
 * rejoin after a reload with the token it was given; any other phone is told
 * the screen is in use.
 */
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  let presented: string | null = null;
  try {
    const body = (await request.json()) as { token?: unknown };
    if (typeof body.token === "string") presented = body.token;
  } catch {
    // An empty body is a first visit.
  }

  try {
    const session = await loadSession(id);
    if (!session) return errorResponse("This code has expired.", 404, "expired");
    if (session.phase === "ended") {
      return errorResponse("This code has expired.", 410, "expired");
    }

    if (session.phoneToken) {
      if (presented && presented === session.phoneToken) {
        return respond(session.phoneToken, session);
      }
      return errorResponse("This screen is being used by someone else.", 409, "taken");
    }

    const token = newToken();
    if (!(await claimSession(id, token))) {
      return errorResponse("This screen is being used by someone else.", 409, "taken");
    }

    session.phoneToken = token;
    session.phase = "selecting";
    session.joinedAt = Date.now();
    await saveSession(session);
    return respond(token, session);
  } catch (err) {
    return storeErrorResponse(err);
  }
}

function respond(token: string, session: Parameters<typeof toView>[0]) {
  return NextResponse.json(
    { token, session: toView(session, Date.now()) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
