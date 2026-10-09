import { NextResponse } from "next/server";
import { toView } from "@/lib/demoQr";
import { createSession, storeErrorResponse } from "@/lib/demoQrServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The kiosk opens a session and shows its QR. Only the kiosk gets this token. */
export async function POST() {
  try {
    const session = await createSession();
    return NextResponse.json(
      {
        id: session.id,
        kioskToken: session.kioskToken,
        session: toView(session, Date.now()),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return storeErrorResponse(err);
  }
}
