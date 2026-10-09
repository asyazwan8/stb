import { NextResponse } from "next/server";
import { FAL_MODEL, SwapInputError, describeFalError, submitSwap } from "@/lib/fal";

export const runtime = "nodejs";
// Submitting to the queue returns immediately; the client polls for the
// result, so this never approaches Vercel's function ceiling.
export const maxDuration = 30;

type Body = {
  photo?: unknown;
  ethnic?: unknown;
  gender?: unknown;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  try {
    const { requestId } = await submitSwap({
      photo: body.photo,
      ethnicId: body.ethnic,
      gender: body.gender,
    });
    return NextResponse.json({ requestId, model: FAL_MODEL });
  } catch (err) {
    const { message, status, detail } = describeFalError(err);
    if (!(err instanceof SwapInputError)) {
      console.error("[swap] submit failed", status, message, detail);
    }
    return NextResponse.json({ error: message, detail }, { status });
  }
}
