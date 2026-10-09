import { parseSelection } from "@/lib/demoQr";
import {
  NO_STORE,
  advanceSession,
  callerOf,
  errorResponse,
  loadSession,
  saveSession,
  storeErrorResponse,
  tokenFrom,
  viewResponse,
} from "@/lib/demoQrServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// A read may look in on the fal queue once.
export const maxDuration = 30;

type Params = { params: Promise<{ id: string }> };

/**
 * Both screens poll this, each with its own token. The id alone is not
 * enough: it is printed in a QR code anyone in the room can scan, and the
 * session ends up holding the visitor's portrait.
 */
export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const session = await loadSession(id);
    if (!session) return errorResponse("This session has expired.", 404, "expired");
    if (!callerOf(session, tokenFrom(request))) {
      return errorResponse("This screen is being used by someone else.", 403, "taken");
    }
    return viewResponse(await advanceSession(session), NO_STORE);
  } catch (err) {
    return storeErrorResponse(err);
  }
}

/**
 * The phone's choices. It sends its whole selection every time with a rising
 * `seq`, so a slow request that lands after a newer one is simply dropped.
 */
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorResponse("Malformed request body.", 400);
  }

  const seq = body.seq;
  if (typeof seq !== "number" || !Number.isInteger(seq) || seq < 1) {
    return errorResponse("Missing sequence number.", 400);
  }
  const selection = parseSelection(body.selection);
  if (!selection) return errorResponse("That choice isn't available.", 400);

  try {
    const session = await loadSession(id);
    if (!session) return errorResponse("This session has expired.", 404, "expired");
    if (callerOf(session, tokenFrom(request)) !== "phone") {
      return errorResponse("This screen is being used by someone else.", 403, "taken");
    }
    if (session.phase !== "selecting" && session.phase !== "error") {
      return errorResponse("This session can't be changed now.", 409, session.phase);
    }
    if (seq <= session.seq) return viewResponse(session, NO_STORE);

    Object.assign(session, selection, { seq });
    // Choosing again after a failed attempt (Retake) reopens the session.
    if (session.phase === "error") {
      session.phase = "selecting";
      session.error = null;
      session.requestId = null;
      session.submittedAt = null;
    }
    await saveSession(session);
    return viewResponse(session, NO_STORE);
  } catch (err) {
    return storeErrorResponse(err);
  }
}
