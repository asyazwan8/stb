import { NextResponse } from "next/server";
import { SwapInputError, checkSwap, describeFalError } from "@/lib/fal";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const { requestId } = await params;

  try {
    return NextResponse.json(await checkSwap(requestId));
  } catch (err) {
    const { message, status, detail } = describeFalError(err);
    if (!(err instanceof SwapInputError)) {
      console.error("[swap] poll failed", status, message, detail);
    }
    return NextResponse.json({ error: message, detail }, { status });
  }
}
