import { SwapInputError, describeFalError, submitSwap } from "@/lib/fal";
import {
  NO_STORE,
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
export const maxDuration = 30;

type Params = { params: Promise<{ id: string }> };

/**
 * The phone's selfie. It goes straight to fal and is never written to the
 * session — only the queue id is kept.
 */
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  let photo: unknown;
  try {
    ({ photo } = (await request.json()) as { photo?: unknown });
  } catch {
    return errorResponse("Malformed request body.", 400);
  }

  try {
    const session = await loadSession(id);
    if (!session) return errorResponse("This session has expired.", 404, "expired");
    if (callerOf(session, tokenFrom(request)) !== "phone") {
      return errorResponse("This screen is being used by someone else.", 403, "taken");
    }
    if (session.phase !== "selecting" && session.phase !== "error") {
      return errorResponse("A photo has already been sent.", 409, session.phase);
    }
    if (session.step !== "camera" || !session.ethnicId || !session.gender) {
      return errorResponse("Choose a look before taking your photo.", 409, "not-ready");
    }

    // Flip the kiosk to its loading screen now — the upload to fal takes a
    // moment, and the visitor should see the big screen react straight away.
    session.phase = "processing";
    session.submittedAt = Date.now();
    session.requestId = null;
    session.imageUrl = null;
    session.error = null;
    await saveSession(session);

    try {
      const { requestId } = await submitSwap({
        photo,
        ethnicId: session.ethnicId,
        gender: session.gender,
      });
      session.requestId = requestId;
      await saveSession(session);
      return viewResponse(session, NO_STORE);
    } catch (err) {
      const { message, status, detail } = describeFalError(err);
      if (!(err instanceof SwapInputError)) {
        console.error("[demo-qr] submit failed", status, message, detail);
      }
      session.phase = "error";
      session.error = message;
      await saveSession(session);
      return viewResponse(session, { status, ...NO_STORE });
    }
  } catch (err) {
    return storeErrorResponse(err);
  }
}
